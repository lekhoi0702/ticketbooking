"""
Socket.IO event handlers for real-time seat reservation
"""
from flask import request
from app.extensions import socketio, db
from app.models.seat import Seat
from app.models.ticket_type import TicketType
from app.models.event import Event
from app.models.user import User
from datetime import datetime, timedelta
from app.utils.datetime_utils import now_gmt7
from app.utils.redis_reservation_manager import get_redis_reservation_manager
import threading
import time

# Store active timers for seat reservations
seat_timers = {}
timer_lock = threading.Lock()

# Reservation duration: 5 minutes
RESERVATION_DURATION_MINUTES = 5

def cleanup_expired_reservations():
    """Clean up expired reservations - cleanup seats with RESERVED status but no active reservation in Redis"""
    try:
        reservation_manager = get_redis_reservation_manager()
        if not reservation_manager:
            return
        
        # Find all seats with RESERVED status
        reserved_seats = Seat.query.filter(Seat.status == 'RESERVED').all()
        
        seats_to_release = []
        for seat in reserved_seats:
            # Check if reservation still exists in Redis
            reservation = reservation_manager.get_reservation(seat.seat_id)
            if not reservation:
                # No active reservation, release the seat
                seats_to_release.append(seat)
        
        # Release seats that don't have active reservations
        for seat in seats_to_release:
            seat.status = 'AVAILABLE'
            db.session.commit()
            
            # Emit to event room (we need event_id, try to get from ticket_type)
            try:
                ticket_type = TicketType.query.get(seat.ticket_type_id)
                if ticket_type:
                    event_id = ticket_type.event_id
                    socketio.emit('seat_released', {
                        'seat_id': seat.seat_id,
                        'event_id': event_id
                    }, room=f'event_{event_id}')
            except Exception:
                pass
        
        # Also cleanup expired reservations in fallback storage
        reservation_manager.cleanup_expired()
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in cleanup_expired_reservations: {str(e)}")

def start_seat_timer(seat_id, event_id, user_id):
    """Start timer for seat reservation expiry"""
    def release_seat():
        time.sleep(RESERVATION_DURATION_MINUTES * 60)  # 5 minutes
        
        with timer_lock:
            if seat_id in seat_timers:
                del seat_timers[seat_id]
        
        # Check if reservation still exists in Redis
        reservation_manager = get_redis_reservation_manager()
        if reservation_manager:
            reservation = reservation_manager.get_reservation(seat_id)
            
            # If reservation exists and belongs to this user, check if expired
            if reservation and reservation.get('user_id') == user_id:
                from datetime import datetime
                expires_at = datetime.fromisoformat(reservation['expires_at'])
                if expires_at < now_gmt7():
                    # Expired, release the seat
                    with db.session.begin():
                        seat = Seat.query.get(seat_id)
                        if seat and seat.status == 'RESERVED':
                            seat.status = 'AVAILABLE'
                            db.session.commit()
                            
                            # Delete reservation from Redis
                            reservation_manager.delete_reservation(seat_id)
                            
                            # Emit to event room
                            socketio.emit('seat_released', {
                                'seat_id': seat_id,
                                'event_id': event_id
                            }, room=f'event_{event_id}')
    
    timer = threading.Thread(target=release_seat, daemon=True)
    timer.start()
    
    with timer_lock:
        seat_timers[seat_id] = timer

def cancel_seat_timer(seat_id):
    """Cancel timer for seat reservation"""
    with timer_lock:
        if seat_id in seat_timers:
            del seat_timers[seat_id]

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"Client disconnected: {request.sid}")

@socketio.on('join_event')
def handle_join_event(data):
    """Join event room for seat updates"""
    event_id = data.get('event_id')
    if event_id:
        room = f'event_{event_id}'
        socketio.server.enter_room(request.sid, room)
        print(f"Client {request.sid} joined room {room}")

@socketio.on('leave_event')
def handle_leave_event(data):
    """Leave event room"""
    event_id = data.get('event_id')
    if event_id:
        room = f'event_{event_id}'
        socketio.server.leave_room(request.sid, room)
        print(f"Client {request.sid} left room {room}")

@socketio.on('lock_seat')
def handle_lock_seat(data):
    """Lock a seat for reservation"""
    seat_id = data.get('seat_id')
    user_id = data.get('user_id')
    event_id = data.get('event_id')
    
    if not all([seat_id, user_id, event_id]):
        socketio.emit('seat_lock_error', {
            'seat_id': seat_id,
            'message': 'Missing required parameters'
        }, room=request.sid)
        return
    
    reservation_manager = get_redis_reservation_manager()
    if not reservation_manager:
        socketio.emit('seat_lock_error', {
            'seat_id': seat_id,
            'message': 'Reservation service unavailable'
        }, room=request.sid)
        return
    
    try:
        with db.session.begin():
            # Validate user exists
            user = User.query.get(user_id)
            if not user:
                print(f"SeatReservation validation failed: User {user_id} not found")
                socketio.emit('seat_lock_error', {
                    'seat_id': seat_id,
                    'message': f'User not found (user_id: {user_id})'
                }, room=request.sid)
                return
            
            # Validate event exists
            event = Event.query.get(event_id)
            if not event:
                print(f"SeatReservation validation failed: Event {event_id} not found")
                socketio.emit('seat_lock_error', {
                    'seat_id': seat_id,
                    'message': f'Event not found (event_id: {event_id})'
                }, room=request.sid)
                return
            
            # Validate seat exists
            seat = Seat.query.get(seat_id)
            if not seat:
                print(f"SeatReservation validation failed: Seat {seat_id} not found")
                socketio.emit('seat_lock_error', {
                    'seat_id': seat_id,
                    'message': f'Seat not found (seat_id: {seat_id})'
                }, room=request.sid)
                return
            
            # Check for existing active reservation in Redis
            existing_reservation = reservation_manager.get_reservation(seat_id)
            
            if existing_reservation:
                # Check if expired
                from datetime import datetime
                expires_at = datetime.fromisoformat(existing_reservation['expires_at'])
                if expires_at < now_gmt7():
                    # Expired, clean up
                    seat.status = 'AVAILABLE'
                    reservation_manager.delete_reservation(seat_id)
                    db.session.commit()
                elif existing_reservation.get('user_id') != user_id:
                    # Seat is reserved by another user
                    socketio.emit('seat_lock_error', {
                        'seat_id': seat_id,
                        'message': 'Seat is already reserved by another user'
                    }, room=request.sid)
                    return
                elif existing_reservation.get('user_id') == user_id:
                    # User already has this seat reserved
                    socketio.emit('seat_locked', {
                        'seat_id': seat_id,
                        'user_id': user_id,
                        'event_id': event_id,
                        'expires_at': existing_reservation['expires_at']
                    }, room=request.sid)
                    return
            
            # Check if seat is available
            if seat.status != 'AVAILABLE' and seat.status != 'RESERVED':
                socketio.emit('seat_lock_error', {
                    'seat_id': seat_id,
                    'message': 'Seat is not available'
                }, room=request.sid)
                return
            
            # Create new reservation in Redis
            success = reservation_manager.create_reservation(
                seat_id=seat_id,
                user_id=user_id,
                event_id=event_id,
                duration_minutes=RESERVATION_DURATION_MINUTES
            )
            
            if not success:
                socketio.emit('seat_lock_error', {
                    'seat_id': seat_id,
                    'message': 'Failed to create reservation'
                }, room=request.sid)
                return
            
            # Update seat status
            seat.status = 'RESERVED'
            db.session.commit()
            
            # Get reservation to get expires_at
            reservation = reservation_manager.get_reservation(seat_id)
            expires_at = reservation['expires_at'] if reservation else None
            
            # Start timer
            start_seat_timer(seat_id, event_id, user_id)
            
            # Emit success to client
            socketio.emit('seat_locked', {
                'seat_id': seat_id,
                'user_id': user_id,
                'event_id': event_id,
                'expires_at': expires_at
            }, room=request.sid)
            
            # Broadcast to event room
            socketio.emit('seat_reserved', {
                'seat_id': seat_id,
                'event_id': event_id
            }, room=f'event_{event_id}')
            
    except Exception as e:
        db.session.rollback()
        print(f"Error locking seat: {str(e)}")
        socketio.emit('seat_lock_error', {
            'seat_id': seat_id,
            'message': f'Error: {str(e)}'
        }, room=request.sid)

@socketio.on('unlock_seat')
def handle_unlock_seat(data):
    """Unlock a seat reservation"""
    seat_id = data.get('seat_id')
    user_id = data.get('user_id')
    event_id = data.get('event_id')
    
    if not all([seat_id, user_id, event_id]):
        return
    
    reservation_manager = get_redis_reservation_manager()
    if not reservation_manager:
        return
    
    try:
        seat = Seat.query.get(seat_id)
        if not seat:
            return
        
        # Find active reservation in Redis
        reservation = reservation_manager.get_reservation(seat_id)
        
        if reservation and reservation.get('user_id') == user_id:
            # Delete reservation from Redis
            reservation_manager.delete_reservation(seat_id)
            
            # Update seat status
            seat.status = 'AVAILABLE'
            db.session.commit()
            
            # Cancel timer
            cancel_seat_timer(seat_id)
            
            # Emit to event room
            socketio.emit('seat_released', {
                'seat_id': seat_id,
                'event_id': event_id
            }, room=f'event_{event_id}')
                
    except Exception as e:
        db.session.rollback()
        print(f"Error unlocking seat: {str(e)}")

@socketio.on('checkout_complete')
def handle_checkout_complete(data):
    """Handle checkout completion - keep seats reserved"""
    seat_ids = data.get('seat_ids', [])
    user_id = data.get('user_id')
    event_id = data.get('event_id')
    
    if not all([seat_ids, user_id, event_id]):
        return
    
    reservation_manager = get_redis_reservation_manager()
    if not reservation_manager:
        return
    
    try:
        for seat_id in seat_ids:
            reservation = reservation_manager.get_reservation(seat_id)
            
            if reservation and reservation.get('user_id') == user_id:
                # Cancel timer - seat will be kept as RESERVED until order is paid
                cancel_seat_timer(seat_id)
                # Reservation stays in Redis until payment completes
                    
    except Exception as e:
        print(f"Error handling checkout complete: {str(e)}")

# Periodic cleanup task
_cleanup_task_started = False
_app_instance = None

def start_cleanup_task(app_instance=None):
    """Start periodic cleanup of expired reservations"""
    global _cleanup_task_started, _app_instance
    
    if _cleanup_task_started:
        return
    
    if app_instance:
        _app_instance = app_instance
    
    def cleanup_loop():
        while True:
            try:
                if _app_instance:
                    with _app_instance.app_context():
                        cleanup_expired_reservations()
                else:
                    from flask import current_app
                    with current_app.app_context():
                        cleanup_expired_reservations()
            except Exception as e:
                print(f"Error in cleanup task: {str(e)}")
            time.sleep(60)  # Run every minute
    
    cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
    cleanup_thread.start()
    _cleanup_task_started = True
