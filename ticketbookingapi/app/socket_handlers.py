"""
Socket.IO event handlers for real-time seat reservation
"""
from flask import request
from app.extensions import socketio, db
from app.models.seat import Seat
from app.models.seat_reservation import SeatReservation
from app.models.ticket_type import TicketType
from app.models.event import Event
from app.models.user import User
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
import threading
import time

# Store active timers for seat reservations
seat_timers = {}
timer_lock = threading.Lock()

# Reservation duration: 5 minutes
RESERVATION_DURATION_MINUTES = 5

def cleanup_expired_reservations():
    """Clean up expired reservations"""
    try:
        expired_reservations = SeatReservation.query.filter(
            SeatReservation.is_active == True,
            SeatReservation.expires_at < datetime.utcnow()
        ).all()
        
        for reservation in expired_reservations:
            seat = Seat.query.get(reservation.seat_id)
            if seat and seat.status == 'RESERVED':
                seat.status = 'AVAILABLE'
                reservation.is_active = False
                
                # Emit to event room
                socketio.emit('seat_released', {
                    'seat_id': seat.seat_id,
                    'event_id': reservation.event_id
                }, room=f'event_{reservation.event_id}')
        
        if expired_reservations:
            db.session.commit()
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
        
        # Check if reservation still exists and is not completed
        with db.session.begin():
            reservation = SeatReservation.query.filter_by(
                seat_id=seat_id,
                user_id=user_id,
                is_active=True
            ).first()
            
            if reservation and reservation.is_expired():
                seat = Seat.query.get(seat_id)
                if seat and seat.status == 'RESERVED':
                    seat.status = 'AVAILABLE'
                    reservation.is_active = False
                    db.session.commit()
                    
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
            
            # Check for existing active reservation
            existing_reservation = SeatReservation.query.filter_by(
                seat_id=seat_id,
                is_active=True
            ).first()
            
            if existing_reservation:
                if existing_reservation.is_expired():
                    # Clean up expired reservation
                    seat.status = 'AVAILABLE'
                    existing_reservation.is_active = False
                    db.session.commit()
                elif existing_reservation.user_id != user_id:
                    # Seat is reserved by another user
                    socketio.emit('seat_lock_error', {
                        'seat_id': seat_id,
                        'message': 'Seat is already reserved by another user'
                    }, room=request.sid)
                    return
                elif existing_reservation.user_id == user_id:
                    # User already has this seat reserved
                    socketio.emit('seat_locked', {
                        'seat_id': seat_id,
                        'user_id': user_id,
                        'event_id': event_id,
                        'expires_at': existing_reservation.expires_at.isoformat()
                    }, room=request.sid)
                    return
            
            # Check if seat is available
            if seat.status != 'AVAILABLE' and seat.status != 'RESERVED':
                socketio.emit('seat_lock_error', {
                    'seat_id': seat_id,
                    'message': 'Seat is not available'
                }, room=request.sid)
                return
            
            # Create new reservation
            try:
                reservation = SeatReservation(
                    seat_id=seat_id,
                    user_id=user_id,
                    event_id=event_id,
                    reservation_duration_minutes=RESERVATION_DURATION_MINUTES
                )
                
                seat.status = 'RESERVED'
                db.session.add(reservation)
                db.session.commit()
                
                # Start timer
                start_seat_timer(seat_id, event_id, user_id)
                
                # Emit success to client
                socketio.emit('seat_locked', {
                    'seat_id': seat_id,
                    'user_id': user_id,
                    'event_id': event_id,
                    'expires_at': reservation.expires_at.isoformat()
                }, room=request.sid)
            except IntegrityError as e:
                db.session.rollback()
                error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
                if 'fk_seat_reservation_user' in error_msg or 'user_id' in error_msg.lower():
                    socketio.emit('seat_lock_error', {
                        'seat_id': seat_id,
                        'message': 'User not found or invalid user_id'
                    }, room=request.sid)
                elif 'fk_seat_reservation_event' in error_msg or 'event_id' in error_msg.lower():
                    socketio.emit('seat_lock_error', {
                        'seat_id': seat_id,
                        'message': 'Event not found or invalid event_id'
                    }, room=request.sid)
                elif 'fk_seat_reservation_seat' in error_msg or 'seat_id' in error_msg.lower():
                    socketio.emit('seat_lock_error', {
                        'seat_id': seat_id,
                        'message': 'Seat not found or invalid seat_id'
                    }, room=request.sid)
                else:
                    socketio.emit('seat_lock_error', {
                        'seat_id': seat_id,
                        'message': f'Database constraint error: {error_msg}'
                    }, room=request.sid)
                return
            
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
    
    try:
        seat = Seat.query.get(seat_id)
        if not seat:
            return
        
        # Find active reservation for this user
        reservation = SeatReservation.query.filter_by(
            seat_id=seat_id,
            user_id=user_id,
            is_active=True
        ).first()
        
        if reservation:
            reservation.is_active = False
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
    
    try:
        with db.session.begin():
            for seat_id in seat_ids:
                reservation = SeatReservation.query.filter_by(
                    seat_id=seat_id,
                    user_id=user_id,
                    is_active=True
                ).first()
                
                if reservation:
                    # Cancel timer - seat will be kept as RESERVED until order is paid
                    cancel_seat_timer(seat_id)
                    # Reservation stays active until payment completes
                    
    except Exception as e:
        db.session.rollback()
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
