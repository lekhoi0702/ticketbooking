from datetime import datetime, timedelta

from flask import Blueprint, request

from app.extensions import db, socketio
from app.models import Event, Seat
from app.routes.helpers import ApiMethodView

seats_bp = Blueprint("seats", __name__)
LOCK_MINUTES = 5
_seat_locks = {}


def _to_status(value):
    raw = str(value or "").strip().upper()
    if raw in ("BOOKED", "SOLD", "USED"):
        return "BOOKED"
    if raw == "RESERVED":
        return "RESERVED"
    return "AVAILABLE"


def _seat_label(seat):
    return f"{seat.row_number}{seat.seat_number}"


def _serialize_seat(seat):
    data = seat.to_dict()
    data["Status"] = _to_status(seat.status)
    data["SeatLabel"] = _seat_label(seat)
    return data


def _cleanup_expired_locks():
    now = datetime.utcnow()
    expired = [
        (seat_id, lock)
        for seat_id, lock in _seat_locks.items()
        if (lock.get("expires_at") or now) <= now
    ]
    if not expired:
        return

    changed = False
    released_events = []
    for seat_id, lock in expired:
        _seat_locks.pop(seat_id, None)
        seat = Seat.query.filter_by(seat_id=seat_id).first()
        if seat and _to_status(seat.status) == "RESERVED":
            seat.status = "AVAILABLE"
            seat.update_date = now
            changed = True
            released_events.append((lock.get("event_id"), seat_id))
    if changed:
        db.session.commit()
        for event_id, seat_id in released_events:
            socketio.emit(
                "seat_released",
                {"seat_id": seat_id, "event_id": event_id, "status": "AVAILABLE"},
                to=f"event_{event_id}" if event_id is not None else None,
            )


class SeatListView(ApiMethodView):
    def get(self):
        _cleanup_expired_locks()
        venue_id = request.args.get("VenueID", type=int)
        event_id = request.args.get("EventID", type=int)
        query = Seat.query
        if event_id and not venue_id:
            event = Event.query.filter_by(event_id=event_id).first()
            venue_id = event.venue_id if event else None
        if venue_id:
            query = query.filter_by(venue_id=venue_id)
        return self.ok([_serialize_seat(row) for row in query.all()])


class SeatInitializeView(ApiMethodView):
    def post(self):
        data = request.get_json(silent=True) or {}
        venue_id = data.get("VenueID") or data.get("venue_id")
        rows = data.get("Rows") or data.get("rows") or 5
        seats_per_row = data.get("SeatsPerRow") or data.get("seats_per_row") or 10
        create_id = data.get("CreateID") or data.get("create_id") or 1

        try:
            venue_id = int(venue_id)
            rows = int(rows)
            seats_per_row = int(seats_per_row)
            create_id = int(create_id)
        except (TypeError, ValueError):
            return self.fail("VenueID, rows and seats_per_row must be valid numbers", 400)

        if rows <= 0 or seats_per_row <= 0:
            return self.fail("rows and seats_per_row must be greater than 0", 400)

        Seat.query.filter_by(venue_id=venue_id).delete(synchronize_session=False)

        now = datetime.utcnow()
        created = []
        for r in range(rows):
            row_name = chr(ord("A") + r)
            for c in range(seats_per_row):
                seat = Seat(
                    venue_id=venue_id,
                    seat_number=str(c + 1),
                    row_number=row_name,
                    status="Available",
                    area="MAIN",
                    x_position=c,
                    y_position=r,
                    create_id=create_id,
                    create_date=now,
                    update_date=None,
                )
                db.session.add(seat)
                created.append(seat)

        db.session.commit()
        return self.ok([row.to_dict() for row in created], 201)


class SeatAssignTemplateView(ApiMethodView):
    def post(self):
        data = request.get_json(silent=True) or {}
        venue_id = data.get("VenueID") or data.get("venue_id")
        seats = data.get("Seats") or data.get("seats") or []
        create_id = data.get("CreateID") or data.get("create_id") or 1

        try:
            venue_id = int(venue_id)
            create_id = int(create_id)
        except (TypeError, ValueError):
            return self.fail("VenueID must be a valid number", 400)

        if not isinstance(seats, list):
            return self.fail("seats must be a list", 400)

        Seat.query.filter_by(venue_id=venue_id).delete(synchronize_session=False)

        now = datetime.utcnow()
        created = []
        for idx, item in enumerate(seats):
            row_name = str(item.get("row_name") or item.get("RowNumber") or "").strip() or "A"
            seat_number = str(item.get("seat_number") or item.get("SeatNumber") or "").strip() or str(idx + 1)
            area = item.get("area") or item.get("Area") or item.get("area_name") or "MAIN"
            x_pos = item.get("x_pos") or item.get("XPosition")
            y_pos = item.get("y_pos") or item.get("YPosition")

            seat = Seat(
                venue_id=venue_id,
                seat_number=seat_number,
                row_number=row_name,
                status="Available",
                area=str(area),
                x_position=int(x_pos) if x_pos is not None and str(x_pos).strip() != "" else None,
                y_position=int(y_pos) if y_pos is not None and str(y_pos).strip() != "" else None,
                create_id=create_id,
                create_date=now,
                update_date=None,
            )
            db.session.add(seat)
            created.append(seat)

        db.session.commit()
        return self.ok([_serialize_seat(row) for row in created], 201)


class SeatLockView(ApiMethodView):
    def post(self):
        _cleanup_expired_locks()
        data = request.get_json(silent=True) or {}
        seat_id = data.get("SeatID") or data.get("seat_id")
        user_id = data.get("UserID") or data.get("user_id")
        event_id = data.get("EventID") or data.get("event_id")
        if seat_id is None or user_id is None:
            return self.fail("SeatID and UserID are required", 400)

        try:
            seat_id = int(seat_id)
            user_id = int(user_id)
            event_id = int(event_id) if event_id not in (None, "") else None
        except (TypeError, ValueError):
            return self.fail("SeatID/UserID/EventID must be valid integers", 400)

        seat = Seat.query.filter_by(seat_id=seat_id).first()
        if not seat:
            return self.fail("Seat not found", 404)

        current_status = _to_status(seat.status)
        if current_status == "BOOKED":
            return self.fail("Seat already booked", 409)

        now = datetime.utcnow()
        existing_lock = _seat_locks.get(seat_id)
        if existing_lock and existing_lock.get("user_id") != user_id:
            if (existing_lock.get("expires_at") or now) > now:
                return self.fail("Seat is being reserved by another user", 409)

        expires_at = now.replace(microsecond=0) + timedelta(minutes=LOCK_MINUTES)
        _seat_locks[seat_id] = {
            "seat_id": seat_id,
            "user_id": user_id,
            "event_id": event_id,
            "expires_at": expires_at,
        }

        seat.status = "RESERVED"
        seat.update_date = now
        db.session.commit()
        socketio.emit(
            "seat_reserved",
            {
                "seat_id": seat_id,
                "event_id": event_id,
                "user_id": user_id,
                "status": "RESERVED",
                "expires_at": expires_at.isoformat(),
            },
            to=f"event_{event_id}" if event_id is not None else None,
        )
        return self.ok(
            {
                "SeatID": seat_id,
                "UserID": user_id,
                "EventID": event_id,
                "SeatLabel": _seat_label(seat),
                "Status": "RESERVED",
                "ExpiresAt": expires_at.isoformat(),
            }
        )


class SeatUnlockView(ApiMethodView):
    def post(self):
        _cleanup_expired_locks()
        data = request.get_json(silent=True) or {}
        seat_id = data.get("SeatID") or data.get("seat_id")
        user_id = data.get("UserID") or data.get("user_id")
        if seat_id is None or user_id is None:
            return self.fail("SeatID and UserID are required", 400)
        try:
            seat_id = int(seat_id)
            user_id = int(user_id)
        except (TypeError, ValueError):
            return self.fail("SeatID and UserID must be valid integers", 400)

        lock = _seat_locks.get(seat_id)
        if lock and lock.get("user_id") != user_id:
            return self.fail("Cannot unlock seat reserved by another user", 403)

        _seat_locks.pop(seat_id, None)
        seat = Seat.query.filter_by(seat_id=seat_id).first()
        if seat and _to_status(seat.status) == "RESERVED":
            seat.status = "AVAILABLE"
            seat.update_date = datetime.utcnow()
            db.session.commit()
            socketio.emit(
                "seat_released",
                {"seat_id": seat_id, "event_id": lock.get("event_id") if lock else None, "status": "AVAILABLE"},
                to=f"event_{lock.get('event_id')}" if lock and lock.get("event_id") is not None else None,
            )
        return self.ok({"SeatID": seat_id, "Unlocked": True})


class SeatUnlockAllView(ApiMethodView):
    def post(self):
        _cleanup_expired_locks()
        data = request.get_json(silent=True) or {}
        user_id = data.get("UserID") or data.get("user_id")
        event_id = data.get("EventID") or data.get("event_id")
        if user_id is None:
            return self.fail("UserID is required", 400)
        try:
            user_id = int(user_id)
            event_id = int(event_id) if event_id not in (None, "") else None
        except (TypeError, ValueError):
            return self.fail("UserID/EventID must be valid integers", 400)

        now = datetime.utcnow()
        unlocked = []
        for seat_id, lock in list(_seat_locks.items()):
            if lock.get("user_id") != user_id:
                continue
            if event_id is not None and lock.get("event_id") != event_id:
                continue
            unlocked.append(seat_id)
            _seat_locks.pop(seat_id, None)
            seat = Seat.query.filter_by(seat_id=seat_id).first()
            if seat and _to_status(seat.status) == "RESERVED":
                seat.status = "AVAILABLE"
                seat.update_date = now

        if unlocked:
            db.session.commit()
            if event_id is not None:
                for seat_id in unlocked:
                    socketio.emit(
                        "seat_released",
                        {"seat_id": seat_id, "event_id": event_id, "status": "AVAILABLE"},
                        to=f"event_{event_id}",
                    )
        return self.ok({"UnlockedSeatIDs": unlocked})


class SeatMyReservationsView(ApiMethodView):
    def get(self):
        _cleanup_expired_locks()
        user_id = request.args.get("UserID", type=int)
        event_id = request.args.get("EventID", type=int)
        if not user_id:
            return self.fail("UserID is required", 400)

        rows = []
        now = datetime.utcnow()
        for seat_id, lock in _seat_locks.items():
            if lock.get("user_id") != user_id:
                continue
            if event_id is not None and lock.get("event_id") != event_id:
                continue

            seat = Seat.query.filter_by(seat_id=seat_id).first()
            rows.append(
                {
                    "SeatID": seat_id,
                    "EventID": lock.get("event_id"),
                    "UserID": user_id,
                    "SeatLabel": _seat_label(seat) if seat else None,
                    "ExpiresAt": lock.get("expires_at").isoformat() if lock.get("expires_at") else None,
                    "IsExpired": (lock.get("expires_at") or now) <= now,
                }
            )
        return self.ok(rows)


seats_bp.add_url_rule("/seats", view_func=SeatListView.as_view("seats_list"), methods=["GET"])
seats_bp.add_url_rule("/seats/initialize", view_func=SeatInitializeView.as_view("seats_initialize"), methods=["POST"])
seats_bp.add_url_rule("/seats/assign-template", view_func=SeatAssignTemplateView.as_view("seats_assign_template"), methods=["POST"])
seats_bp.add_url_rule("/seats/lock", view_func=SeatLockView.as_view("seats_lock"), methods=["POST"])
seats_bp.add_url_rule("/seats/unlock", view_func=SeatUnlockView.as_view("seats_unlock"), methods=["POST"])
seats_bp.add_url_rule("/seats/unlock-all", view_func=SeatUnlockAllView.as_view("seats_unlock_all"), methods=["POST"])
seats_bp.add_url_rule("/seats/my-reservations", view_func=SeatMyReservationsView.as_view("seats_my_reservations"), methods=["GET"])
