from flask_socketio import join_room, leave_room

from app.extensions import socketio


def register_socket_handlers():
    @socketio.on("join_event")
    def handle_join_event(data):
        event_id = (data or {}).get("event_id")
        if event_id is None:
            return
        join_room(f"event_{event_id}")

    @socketio.on("leave_event")
    def handle_leave_event(data):
        event_id = (data or {}).get("event_id")
        if event_id is None:
            return
        leave_room(f"event_{event_id}")
