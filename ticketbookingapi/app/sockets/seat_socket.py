from flask import request
from flask_socketio import emit, join_room, leave_room
from app.extensions import socketio
from datetime import datetime, timedelta
import threading
import time

# Configuration: Seat hold timeout in minutes
SEAT_HOLD_TIMEOUT_MINUTES = 30

# In-memory storage for active selections with timestamps
# Structure: { event_room: { seat_id: { 'sid': socket_id, 'locked_at': datetime, 'expires_at': datetime } } }
active_selections = {}

# Lock for thread-safe operations
selections_lock = threading.Lock()

def get_remaining_seconds(expires_at):
    """Calculate remaining seconds until expiration"""
    if not expires_at:
        return 0
    remaining = (expires_at - datetime.utcnow()).total_seconds()
    return max(0, int(remaining))

def cleanup_expired_seats():
    """Background task to cleanup expired seat locks"""
    while True:
        time.sleep(30)  # Check every 30 seconds
        try:
            with selections_lock:
                now = datetime.utcnow()
                for room, selections in list(active_selections.items()):
                    expired_seats = []
                    for seat_id, info in list(selections.items()):
                        if info['expires_at'] <= now:
                            expired_seats.append((seat_id, info['sid']))
                    
                    for seat_id, sid in expired_seats:
                        del active_selections[room][seat_id]
                        # Notify all users in the room that seat is unlocked
                        socketio.emit('seat_expired', {
                            'seat_id': seat_id,
                            'message': 'Ghế đã hết thời gian giữ'
                        }, room=room)
                        socketio.emit('seat_unlocked', {'seat_id': seat_id}, room=room)
                        print(f"Seat {seat_id} expired and released in room {room}")
                    
                    # Cleanup empty rooms
                    if not active_selections[room]:
                        del active_selections[room]
        except Exception as e:
            print(f"Error in cleanup_expired_seats: {e}")

# Start background cleanup thread
cleanup_thread = threading.Thread(target=cleanup_expired_seats, daemon=True)
cleanup_thread.start()

@socketio.on('join_event')
def on_join(data):
    """Join a room for a specific event showtime"""
    event_id = data.get('event_id')
    if event_id:
        room = f"event_{event_id}"
        join_room(room)
        
        # Sync existing selections to the new user with remaining time
        with selections_lock:
            if room in active_selections:
                for seat_id, info in active_selections[room].items():
                    remaining = get_remaining_seconds(info['expires_at'])
                    if remaining > 0:
                        emit('seat_locked', {
                            'seat_id': seat_id,
                            'remaining_seconds': remaining
                        }, room=request.sid)
        
        print(f"User {request.sid} joined room: {room}")

@socketio.on('leave_event')
def on_leave(data):
    """Leave a room and cleanup their specific locks"""
    event_id = data.get('event_id')
    if event_id:
        room = f"event_{event_id}"
        sid = request.sid
        
        # Cleanup: Remove any seats locked by THIS user in THIS room
        with selections_lock:
            if room in active_selections:
                seats_to_remove = [s_id for s_id, info in active_selections[room].items() if info['sid'] == sid]
                for s_id in seats_to_remove:
                    del active_selections[room][s_id]
                    emit('seat_unlocked', {'seat_id': s_id}, room=room, include_self=False)
        
        leave_room(room)
        print(f"User {sid} left room: {room}")

@socketio.on('select_seat')
def handle_seat_select(data):
    """Lock a seat with 30-minute timeout"""
    event_id = data.get('event_id')
    seat_id = data.get('seat_id')
    if event_id and seat_id:
        room = f"event_{event_id}"
        now = datetime.utcnow()
        expires_at = now + timedelta(minutes=SEAT_HOLD_TIMEOUT_MINUTES)
        
        with selections_lock:
            if room not in active_selections:
                active_selections[room] = {}
            
            # Check if seat is already locked by another user
            if seat_id in active_selections[room]:
                existing = active_selections[room][seat_id]
                if existing['sid'] != request.sid and existing['expires_at'] > now:
                    # Seat is locked by someone else and not expired
                    remaining = get_remaining_seconds(existing['expires_at'])
                    emit('seat_lock_failed', {
                        'seat_id': seat_id,
                        'message': 'Ghế đang được người khác giữ',
                        'remaining_seconds': remaining
                    }, room=request.sid)
                    return
            
            # Lock the seat with timestamp
            active_selections[room][seat_id] = {
                'sid': request.sid,
                'locked_at': now,
                'expires_at': expires_at
            }
        
        remaining = SEAT_HOLD_TIMEOUT_MINUTES * 60
        
        # Notify the user who selected the seat with their timer
        emit('seat_lock_confirmed', {
            'seat_id': seat_id,
            'remaining_seconds': remaining,
            'expires_at': expires_at.isoformat()
        }, room=request.sid)
        
        # Notify others that seat is locked
        emit('seat_locked', {
            'seat_id': seat_id,
            'remaining_seconds': remaining
        }, room=room, include_self=False)

@socketio.on('deselect_seat')
def handle_seat_deselect(data):
    """Notify others that a seat is no longer being selected"""
    event_id = data.get('event_id')
    seat_id = data.get('seat_id')
    if event_id and seat_id:
        room = f"event_{event_id}"
        with selections_lock:
            if room in active_selections and seat_id in active_selections[room]:
                # Only allow the owner to deselect
                if active_selections[room][seat_id]['sid'] == request.sid:
                    del active_selections[room][seat_id]
                    emit('seat_unlocked', {'seat_id': seat_id}, room=room, include_self=False)
                    emit('seat_deselect_confirmed', {'seat_id': seat_id}, room=request.sid)

@socketio.on('get_seat_timer')
def handle_get_seat_timer(data):
    """Get remaining time for a user's selected seats"""
    event_id = data.get('event_id')
    if event_id:
        room = f"event_{event_id}"
        sid = request.sid
        
        with selections_lock:
            if room in active_selections:
                user_seats = []
                for seat_id, info in active_selections[room].items():
                    if info['sid'] == sid:
                        remaining = get_remaining_seconds(info['expires_at'])
                        user_seats.append({
                            'seat_id': seat_id,
                            'remaining_seconds': remaining,
                            'expires_at': info['expires_at'].isoformat()
                        })
                
                emit('seat_timers', {'seats': user_seats}, room=request.sid)

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect(reason=None):
    sid = request.sid
    # Cleanup all seats locked by this SID across all rooms
    with selections_lock:
        for room, selections in list(active_selections.items()):
            seats_to_remove = [s_id for s_id, info in selections.items() if info['sid'] == sid]
            for s_id in seats_to_remove:
                del active_selections[room][s_id]
                emit('seat_unlocked', {'seat_id': s_id}, room=room)
    print(f"Client disconnected ({reason}) and locks released: {sid}")
