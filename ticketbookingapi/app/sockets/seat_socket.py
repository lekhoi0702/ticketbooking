from flask import request
from flask_socketio import emit, join_room, leave_room
from app.extensions import socketio

# In-memory storage for active selections to sync new users
# Structure: { event_room: { seat_id: sid } }
active_selections = {}

@socketio.on('join_event')
def on_join(data):
    """Join a room for a specific event showtime"""
    event_id = data.get('event_id')
    if event_id:
        room = f"event_{event_id}"
        join_room(room)
        
        # Sync existing selections to the new user
        if room in active_selections:
            for seat_id in active_selections[room]:
                emit('seat_locked', {'seat_id': seat_id}, room=request.sid)
        
        print(f"User {request.sid} joined room: {room}")

@socketio.on('leave_event')
def on_leave(data):
    """Leave a room and cleanup their specific locks"""
    event_id = data.get('event_id')
    if event_id:
        room = f"event_{event_id}"
        sid = request.sid
        
        # Cleanup: Remove any seats locked by THIS user in THIS room
        if room in active_selections:
            seats_to_remove = [s_id for s_id, u_sid in active_selections[room].items() if u_sid == sid]
            for s_id in seats_to_remove:
                del active_selections[room][s_id]
                emit('seat_unlocked', {'seat_id': s_id}, room=room, include_self=False)
        
        leave_room(room)
        print(f"User {sid} left room: {room}")

@socketio.on('select_seat')
def handle_seat_select(data):
    """Notify others that a seat is being selected"""
    event_id = data.get('event_id')
    seat_id = data.get('seat_id')
    if event_id and seat_id:
        room = f"event_{event_id}"
        if room not in active_selections:
            active_selections[room] = {}
        
        # Track who locked it
        active_selections[room][seat_id] = request.sid
        emit('seat_locked', data, room=room, include_self=False)

@socketio.on('deselect_seat')
def handle_seat_deselect(data):
    """Notify others that a seat is no longer being selected"""
    event_id = data.get('event_id')
    seat_id = data.get('seat_id')
    if event_id and seat_id:
        room = f"event_{event_id}"
        if room in active_selections and seat_id in active_selections[room]:
            del active_selections[room][seat_id]
        emit('seat_unlocked', data, room=room, include_self=False)

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect(reason=None):
    sid = request.sid
    # Cleanup all seats locked by this SID across all rooms
    for room, selections in list(active_selections.items()):
        seats_to_remove = [s_id for s_id, u_sid in selections.items() if u_sid == sid]
        for s_id in seats_to_remove:
            del active_selections[room][s_id]
            emit('seat_unlocked', {'seat_id': s_id}, room=room)
    print(f"Client disconnected ({reason}) and locks released: {sid}")
