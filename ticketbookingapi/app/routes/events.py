import json
import os
from datetime import datetime
from uuid import uuid4

from flask import Blueprint, request
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import Event, EventQRCode, Order, Payment, Seat, Showtime, Ticket, TicketType, TicketTypeSeat, Venue
from app.models.organizer import Organizer
from app.routes.helpers import ApiMethodView, parse_datetime


events_bp = Blueprint("events", __name__)


def _uploads_dir():
    current_app_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.dirname(current_app_dir)
    api_root = os.path.dirname(app_dir)
    path = os.path.join(api_root, "uploads", "events")
    os.makedirs(path, exist_ok=True)
    return path


def _save_upload(file_storage):
    if not file_storage or not file_storage.filename:
        return None
    original = secure_filename(file_storage.filename)
    _, ext = os.path.splitext(original)
    generated = f"event_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid4().hex[:8]}{ext.lower()}"
    abs_path = os.path.join(_uploads_dir(), generated)
    file_storage.save(abs_path)
    return f"/uploads/events/{generated}"


def _parse_ticket_types(payload):
    if payload is None:
        return []
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        return [payload]
    if isinstance(payload, str):
        try:
            parsed = json.loads(payload)
            return _parse_ticket_types(parsed)
        except Exception:
            return []
    return []


def _extract_ticket_type_payloads():
    # JSON body: ticket_types can be object/list/string
    data = request.get_json(silent=True)
    if isinstance(data, dict) and "ticket_types" in data:
        return _parse_ticket_types(data.get("ticket_types"))

    # multipart/form-data: repeated ticket_types fields
    if request.form:
        payloads = []
        for item in request.form.getlist("ticket_types"):
            payloads.extend(_parse_ticket_types(item))
        return payloads

    return []


def _parse_showtimes(payload):
    if payload is None:
        return []
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        return [payload]
    if isinstance(payload, str):
        try:
            parsed = json.loads(payload)
            return _parse_showtimes(parsed)
        except Exception:
            return []
    return []


def _extract_showtime_payloads():
    data = request.get_json(silent=True)
    if isinstance(data, dict) and "showtimes" in data:
        return _parse_showtimes(data.get("showtimes"))

    if request.form:
        payloads = []
        for item in request.form.getlist("showtimes"):
            payloads.extend(_parse_showtimes(item))
        return payloads

    return []


def _normalize_showtimes_input(raw_showtimes, fallback_start=None, fallback_end=None, fallback_venue_id=None):
    normalized = []
    for row in raw_showtimes or []:
        start_raw = row.get("start_datetime") or row.get("StartDateTime") or row.get("StartDate")
        end_raw = row.get("end_datetime") or row.get("EndDateTime") or row.get("EndDate")
        if not start_raw or not end_raw:
            continue
        start_dt = parse_datetime(start_raw)
        end_dt = parse_datetime(end_raw)
        if not start_dt or not end_dt:
            continue
        if end_dt <= start_dt:
            raise ValueError("showtime end_datetime must be after start_datetime")
        venue_raw = row.get("venue_id") if "venue_id" in row else row.get("VenueID")
        venue_id = fallback_venue_id if venue_raw in (None, "") else int(venue_raw)
        normalized.append(
            {
                "showtime_id": row.get("showtime_id") or row.get("ShowtimeID"),
                "start_datetime": start_dt,
                "end_datetime": end_dt,
                "venue_id": venue_id,
                "status": str(row.get("status") or row.get("Status") or "ACTIVE").upper(),
            }
        )

    if not normalized and fallback_start and fallback_end:
        start_dt = parse_datetime(fallback_start)
        end_dt = parse_datetime(fallback_end)
        if start_dt and end_dt:
            if end_dt <= start_dt:
                raise ValueError("end_datetime must be after start_datetime")
            normalized.append(
                {
                    "showtime_id": None,
                    "start_datetime": start_dt,
                    "end_datetime": end_dt,
                    "venue_id": fallback_venue_id,
                    "status": "ACTIVE",
                }
            )
    return normalized


def _replace_event_showtimes(event, normalized_showtimes):
    Showtime.query.filter_by(event_id=event.event_id).delete(synchronize_session=False)
    now = datetime.utcnow()
    for item in normalized_showtimes:
        db.session.add(
            Showtime(
                event_id=event.event_id,
                venue_id=item.get("venue_id") if item.get("venue_id") not in ("", None) else event.venue_id,
                start_datetime=item["start_datetime"],
                end_datetime=item["end_datetime"],
                status=item.get("status") or "ACTIVE",
                create_date=now,
                update_date=now,
            )
        )


def _delete_event_dependencies(event_id):
    ticket_type_ids = [
        row.ticket_type_id
        for row in TicketType.query.filter_by(event_id=event_id).all()
    ]

    # Remove event-level ancillary records first
    EventQRCode.query.filter_by(event_id=event_id).delete(synchronize_session=False)
    Showtime.query.filter_by(event_id=event_id).delete(synchronize_session=False)

    # Remove order/payment/ticket chain for this event
    order_ids = [row.order_id for row in Order.query.filter_by(event_id=event_id).all()]
    if order_ids:
        Payment.query.filter(Payment.order_id.in_(order_ids)).delete(synchronize_session=False)
        Ticket.query.filter(Ticket.order_id.in_(order_ids)).delete(synchronize_session=False)
        Order.query.filter(Order.order_id.in_(order_ids)).delete(synchronize_session=False)

    # Remove ticket type related rows
    if ticket_type_ids:
        TicketTypeSeat.query.filter(TicketTypeSeat.ticket_type_id.in_(ticket_type_ids)).delete(synchronize_session=False)
        Ticket.query.filter(Ticket.ticket_type_id.in_(ticket_type_ids)).delete(synchronize_session=False)
    TicketType.query.filter_by(event_id=event_id).delete(synchronize_session=False)


def _event_to_payload(event):
    data = event.to_dict()
    seat_mappings = (
        TicketTypeSeat.query
        .filter(TicketTypeSeat.ticket_type_id.in_([tt.ticket_type_id for tt in event.ticket_types]))
        .all()
        if event.ticket_types
        else []
    )
    seat_ids = [row.seat_id for row in seat_mappings]
    seat_rows = Seat.query.filter(Seat.seat_id.in_(seat_ids)).all() if seat_ids else []
    seat_map = {seat.seat_id: seat for seat in seat_rows}

    mappings_by_ticket_type = {}
    for mapping in seat_mappings:
        mappings_by_ticket_type.setdefault(mapping.ticket_type_id, []).append(mapping)

    ticket_types_payload = []
    for tt in event.ticket_types:
        tt_data = tt.to_dict()
        tt_mappings = mappings_by_ticket_type.get(tt.ticket_type_id, [])
        selected_seats = []
        for mapping in tt_mappings:
            seat = seat_map.get(mapping.seat_id)
            if not seat:
                continue
            selected_seats.append(
                {
                    "seat_id": seat.seat_id,
                    "row_name": seat.row_number,
                    "seat_number": seat.seat_number,
                    "area": seat.area,
                    "area_name": seat.area,
                    "ticket_type_id": tt.ticket_type_id,
                }
            )
        tt_data["SelectedSeats"] = selected_seats
        tt_data["selected_seats"] = selected_seats
        total_quantity = len(selected_seats)
        sold_quantity = (
            db.session.query(Ticket.ticket_id)
            .join(Order, Order.order_id == Ticket.order_id)
            .filter(Ticket.ticket_type_id == tt.ticket_type_id)
            .filter(Ticket.status != "CANCELLED")
            .filter(Order.status.in_(["PAID", "COMPLETED", "CANCELLATION_PENDING"]))
            .count()
        )
        available_quantity = max(total_quantity - sold_quantity, 0)
        tt_data["Quantity"] = total_quantity
        tt_data["SoldQuantity"] = sold_quantity
        tt_data["AvailableQuantity"] = available_quantity
        ticket_types_payload.append(tt_data)

    data["TicketTypes"] = ticket_types_payload
    data["Category"] = event.category.to_dict() if event.category else None
    data["Venue"] = event.venue.to_dict() if getattr(event, "venue", None) else None
    data["Organizer"] = event.organizer.to_dict() if getattr(event, "organizer", None) else None
    data["OrganizerName"] = (
        event.organizer.organizer_name if getattr(event, "organizer", None) else None
    )

    qr = EventQRCode.query.filter_by(event_id=event.event_id).order_by(EventQRCode.qrcode_id.desc()).first()
    data["QRCodeURL"] = qr.qrcode_url if qr else None
    data["QRBankName"] = qr.bank_name if qr else None
    data["QRAccountNumber"] = qr.account_number if qr else None

    showtimes = (
        Showtime.query
        .filter_by(event_id=event.event_id)
        .order_by(Showtime.start_datetime.asc(), Showtime.showtime_id.asc())
        .all()
    )
    data["Showtimes"] = [
        {
            **row.to_dict(),
            "Venue": row.venue.to_dict() if getattr(row, "venue", None) else None,
            "start_datetime": row.start_datetime.isoformat() if row.start_datetime else None,
            "end_datetime": row.end_datetime.isoformat() if row.end_datetime else None,
            "status": row.status,
            "ticket_types": ticket_types_payload,
            "total_capacity": (row.venue.capacity if getattr(row, "venue", None) and row.venue.capacity else 0),
        }
        for row in showtimes
    ]

    return data


def _normalize_area(value):
    if value is None:
        return None
    normalized = str(value).strip()
    return normalized.lower() if normalized else None


def _extract_selected_seats(item):
    payload = (
        item.get("selected_seats")
        or item.get("selectedSeats")
        or item.get("SelectedSeats")
        or item.get("Seats")
        or []
    )
    if isinstance(payload, str):
        try:
            payload = json.loads(payload)
        except Exception:
            payload = []
    if not isinstance(payload, list):
        return []
    return [row for row in payload if isinstance(row, dict)]


def _resolve_seat_ids_for_venue(venue_id, selected_seats, create_id=1):
    if not venue_id or not selected_seats:
        return []

    seats = Seat.query.filter_by(venue_id=venue_id).all()
    if not seats:
        venue = Venue.query.filter_by(venue_id=venue_id).first()
        seat_map = venue.seat_map if venue else None
        now = datetime.utcnow()
        bootstrap_rows = []

        if isinstance(seat_map, dict) and isinstance(seat_map.get("areas"), list):
            for area in seat_map.get("areas", []):
                area_name = str(area.get("name") or "MAIN").strip() or "MAIN"
                rows = int(area.get("rows") or 0)
                cols = int(area.get("cols") or 0)
                locked = set(area.get("locked_seats") or [])
                for r_idx in range(rows):
                    row_name = chr(ord("A") + r_idx)
                    for c_idx in range(cols):
                        seat_code = f"{r_idx + 1}-{c_idx + 1}"
                        if seat_code in locked:
                            continue
                        bootstrap_rows.append(
                            Seat(
                                venue_id=venue_id,
                                seat_number=str(c_idx + 1),
                                row_number=row_name,
                                status="Available",
                                area=area_name,
                                x_position=c_idx,
                                y_position=r_idx,
                                create_id=create_id,
                                create_date=now,
                                update_date=None,
                            )
                        )
        elif isinstance(seat_map, list):
            for idx, item in enumerate(seat_map):
                if not isinstance(item, dict):
                    continue
                row_name = str(item.get("row_name") or item.get("RowNumber") or "").strip() or "A"
                seat_number = str(item.get("seat_number") or item.get("SeatNumber") or "").strip() or str(idx + 1)
                area_name = item.get("area") or item.get("area_name") or item.get("Area")
                bootstrap_rows.append(
                    Seat(
                        venue_id=venue_id,
                        seat_number=seat_number,
                        row_number=row_name,
                        status="Available",
                        area=str(area_name) if area_name is not None else None,
                        x_position=None,
                        y_position=None,
                        create_id=create_id,
                        create_date=now,
                        update_date=None,
                    )
                )

        if bootstrap_rows:
            db.session.add_all(bootstrap_rows)
            db.session.flush()
            seats = Seat.query.filter_by(venue_id=venue_id).all()

    by_id = {seat.seat_id: seat for seat in seats}
    by_key = {}
    for seat in seats:
        key = (
            str(seat.row_number or "").strip().upper(),
            str(seat.seat_number or "").strip(),
            _normalize_area(seat.area),
        )
        by_key[key] = seat.seat_id

    resolved_ids = []
    for item in selected_seats:
        raw_seat_id = item.get("seat_id") or item.get("SeatID")
        if raw_seat_id not in (None, ""):
            try:
                seat_id = int(raw_seat_id)
            except (TypeError, ValueError):
                continue
            seat_row = by_id.get(seat_id)
            if seat_row:
                resolved_ids.append(seat_row.seat_id)
                continue

        row_name = str(item.get("row_name") or item.get("RowNumber") or "").strip().upper()
        seat_number = str(item.get("seat_number") or item.get("SeatNumber") or "").strip()
        area = _normalize_area(item.get("area") or item.get("area_name") or item.get("Area"))
        if not row_name or not seat_number:
            continue

        seat_id = by_key.get((row_name, seat_number, area))
        if seat_id is None and area is not None:
            seat_id = by_key.get((row_name, seat_number, None))
        if seat_id is not None:
            resolved_ids.append(seat_id)
            continue

        # Last resort: create missing seat row directly from selected_seats payload.
        # This keeps tickettypeseat consistent even when Seat table was never initialized.
        if row_name and seat_number:
            created = Seat(
                venue_id=venue_id,
                seat_number=seat_number,
                row_number=row_name,
                status="Available",
                area=item.get("area") or item.get("area_name") or item.get("Area"),
                x_position=None,
                y_position=None,
                create_id=create_id,
                create_date=datetime.utcnow(),
                update_date=None,
            )
            db.session.add(created)
            db.session.flush()
            by_id[created.seat_id] = created
            by_key[(row_name, seat_number, _normalize_area(created.area))] = created.seat_id
            resolved_ids.append(created.seat_id)

    unique_ids = []
    seen = set()
    for seat_id in resolved_ids:
        if seat_id in seen:
            continue
        seen.add(seat_id)
        unique_ids.append(seat_id)
    return unique_ids


def _replace_ticket_type_seats(ticket_type_id, seat_ids, create_id):
    TicketTypeSeat.query.filter_by(ticket_type_id=ticket_type_id).delete(synchronize_session=False)
    now = datetime.utcnow()
    for seat_id in seat_ids:
        db.session.add(
            TicketTypeSeat(
                ticket_type_id=ticket_type_id,
                seat_id=seat_id,
                create_id=create_id,
                create_date=now,
                update_date=None,
            )
        )


def _upsert_qr_for_event(event_id, create_id):
    qr_image_url = (
        request.form.get("qr_image_url")
        or request.form.get("qrImageUrl")
        or request.form.get("vietqr_image_url")
    )
    qr_file = request.files.get("qr_image") or request.files.get("vietqr_image")
    qr_saved = _save_upload(qr_file) if qr_file else None
    final_qr = qr_saved or qr_image_url

    bank_name = (
        request.form.get("bank_name")
        or request.form.get("bankName")
        or request.form.get("BankName")
    )
    account_number = (
        request.form.get("account_number")
        or request.form.get("accountNumber")
        or request.form.get("AccountNumber")
    )

    if not final_qr:
        return

    qr = EventQRCode.query.filter_by(event_id=event_id).order_by(EventQRCode.qrcode_id.desc()).first()
    if qr:
        qr.qrcode_url = final_qr
        qr.bank_name = bank_name
        qr.account_number = account_number
        qr.update_date = datetime.utcnow()
    else:
        qr = EventQRCode(
            event_id=event_id,
            qrcode_url=final_qr,
            bank_name=bank_name,
            account_number=account_number,
            create_id=create_id,
            create_date=datetime.utcnow(),
            update_date=None,
        )
        db.session.add(qr)


class EventListView(ApiMethodView):
    def get(self):
        rows = Event.query.order_by(Event.start_date.asc()).all()
        return self.ok([_event_to_payload(row) for row in rows])

    def post(self):
        data = request.get_json(silent=True) or {}
        if not data:
            data = request.form.to_dict(flat=True)

        event_name = data.get("EventName") or data.get("event_name")
        category_id = data.get("CategoryID") or data.get("category_id")
        venue_id = data.get("VenueID") or data.get("venue_id")
        description = data.get("Description") or data.get("description")
        try:
            start_date = parse_datetime(data.get("StartDate") or data.get("start_datetime"))
            end_date = parse_datetime(data.get("EndDate") or data.get("end_datetime"))
        except Exception:
            return self.fail("Invalid start_datetime/end_datetime format", 400)
        status = data.get("Status") or data.get("status") or "PENDING_APPROVAL"
        manager_id = data.get("ManagerID") or data.get("manager_id") or data.get("CreateID") or 1

        image_url = data.get("ImageURL") or data.get("image_url") or data.get("banner_image_url")
        banner_file = request.files.get("banner_image")
        saved_banner = _save_upload(banner_file) if banner_file else None
        if saved_banner:
            image_url = saved_banner

        raw_showtimes = _extract_showtime_payloads()

        if not event_name or category_id is None:
            return self.fail("event_name and category_id are required", 400)

        try:
            category_id = int(category_id)
            manager_id = int(manager_id)
            venue_id = int(venue_id) if venue_id not in (None, "") else None
        except (TypeError, ValueError):
            return self.fail("category_id, venue_id and manager_id must be integers", 400)

        if venue_id:
            venue = Venue.query.filter_by(venue_id=venue_id).first()
            if not venue:
                return self.fail("Venue not found", 400)
        try:
            normalized_showtimes = _normalize_showtimes_input(
                raw_showtimes,
                fallback_start=start_date,
                fallback_end=end_date,
                fallback_venue_id=venue_id,
            )
        except ValueError as ex:
            return self.fail(str(ex), 400)
        except Exception:
            return self.fail("Invalid showtimes payload", 400)

        if not normalized_showtimes:
            return self.fail("At least one showtime is required", 400)

        start_date = min(item["start_datetime"] for item in normalized_showtimes)
        end_date = max(item["end_datetime"] for item in normalized_showtimes)

        organizer = Organizer.query.filter_by(organizer_id=manager_id).first()
        if not organizer:
            organizer = Organizer(
                organizer_id=manager_id,
                organizer_name=f"Organizer {manager_id}",
                description=None,
                logo_url=None,
                create_id=manager_id,
                create_date=datetime.utcnow(),
                update_date=None,
            )
            db.session.add(organizer)
            db.session.flush()

        event = Event(
            event_name=event_name,
            category_id=category_id,
            venue_id=venue_id,
            description=description,
            start_date=start_date,
            end_date=end_date,
            status=status,
            organizer_id=organizer.organizer_id,
            image_url=image_url,
            is_banner=False,
            is_favorite=False,
            create_date=datetime.utcnow(),
            update_date=None,
        )
        db.session.add(event)
        db.session.flush()
        _replace_event_showtimes(event, normalized_showtimes)

        ticket_types = _extract_ticket_type_payloads()
        assigned_seat_ids = set()
        for item in ticket_types:
            type_name = item.get("type_name") or item.get("TypeName")
            price = item.get("price") or item.get("Price")
            sale_start_date = parse_datetime(item.get("sale_start_date") or item.get("SaleStartDate"))
            sale_end_date = parse_datetime(item.get("sale_end_date") or item.get("SaleEndDate"))
            if not type_name or price is None:
                continue
            if not sale_start_date or not sale_end_date:
                return self.fail("Each ticket type requires sale_start_date and sale_end_date", 400)
            if sale_end_date < sale_start_date:
                return self.fail("sale_end_date must be after or equal sale_start_date", 400)
            tt = TicketType(
                event_id=event.event_id,
                type_name=type_name,
                price=price,
                sale_start_date=sale_start_date,
                sale_end_date=sale_end_date,
                status=str(item.get("status") or item.get("Status") or "ACTIVE").upper(),
                create_id=manager_id,
                create_date=datetime.utcnow(),
                update_date=None,
            )
            db.session.add(tt)
            db.session.flush()

            selected_seats = _extract_selected_seats(item)
            seat_ids = _resolve_seat_ids_for_venue(event.venue_id, selected_seats, manager_id)
            if selected_seats and not seat_ids:
                return self.fail(
                    f"Ticket type '{type_name}' has selected_seats but none could be resolved for venue {event.venue_id}",
                    400,
                )
            duplicate_ids = [seat_id for seat_id in seat_ids if seat_id in assigned_seat_ids]
            if duplicate_ids:
                return self.fail("A seat cannot belong to multiple ticket types in the same event", 400)
            assigned_seat_ids.update(seat_ids)
            _replace_ticket_type_seats(tt.ticket_type_id, seat_ids, manager_id)

        _upsert_qr_for_event(event.event_id, manager_id)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return self.fail("Invalid related data for category, venue or organizer", 400)

        event = Event.query.filter_by(event_id=event.event_id).first()
        return self.ok(_event_to_payload(event), 201)


class EventDetailView(ApiMethodView):
    def get(self, event_id):
        event = Event.query.filter_by(event_id=event_id).first()
        if not event:
            return self.fail("Not found", 404)
        return self.ok(_event_to_payload(event))

    def patch(self, event_id):
        event = Event.query.filter_by(event_id=event_id).first()
        if not event:
            return self.fail("Not found", 404)

        data = request.get_json(silent=True) or {}
        if not data:
            data = request.form.to_dict(flat=True)

        has_changes = False

        status = data.get("Status") or data.get("status")
        if status is not None:
            event.status = status
            has_changes = True

        is_favorite = data.get("IsFavorite")
        if is_favorite is None:
            is_favorite = data.get("is_favorite")

        if is_favorite is not None:
            if isinstance(is_favorite, str):
                normalized = is_favorite.strip().lower()
                is_favorite = normalized in ("1", "true", "yes", "on")
            else:
                is_favorite = bool(is_favorite)
            event.is_favorite = is_favorite
            has_changes = True

        event_name = data.get("EventName") or data.get("event_name")
        description = data.get("Description") or data.get("description")
        image_url = data.get("ImageURL") or data.get("image_url") or data.get("banner_image_url")
        category_id = data.get("CategoryID") or data.get("category_id")
        venue_id = data.get("VenueID") or data.get("venue_id")
        start_date = data.get("StartDate") or data.get("start_datetime")
        end_date = data.get("EndDate") or data.get("end_datetime")
        raw_showtimes = _extract_showtime_payloads()

        banner_file = request.files.get("banner_image")
        saved_banner = _save_upload(banner_file) if banner_file else None
        if saved_banner:
            image_url = saved_banner

        if event_name is not None:
            event.event_name = event_name
            has_changes = True
        if description is not None:
            event.description = description
            has_changes = True
        if image_url is not None:
            event.image_url = image_url
            has_changes = True
        if category_id is not None:
            try:
                event.category_id = int(category_id)
            except (TypeError, ValueError):
                return self.fail("category_id must be an integer", 400)
            has_changes = True
        if venue_id is not None and str(venue_id).strip() != "":
            try:
                event.venue_id = int(venue_id)
            except (TypeError, ValueError):
                return self.fail("venue_id must be an integer", 400)
            if not Venue.query.filter_by(venue_id=event.venue_id).first():
                return self.fail("Venue not found", 400)
            has_changes = True
        if start_date is not None:
            try:
                event.start_date = parse_datetime(start_date)
            except Exception:
                return self.fail("Invalid start_datetime format", 400)
            has_changes = True
        if end_date is not None:
            try:
                event.end_date = parse_datetime(end_date)
            except Exception:
                return self.fail("Invalid end_datetime format", 400)
            has_changes = True

        if raw_showtimes:
            try:
                normalized_showtimes = _normalize_showtimes_input(
                    raw_showtimes,
                    fallback_start=None,
                    fallback_end=None,
                    fallback_venue_id=event.venue_id,
                )
            except ValueError as ex:
                return self.fail(str(ex), 400)
            except Exception:
                return self.fail("Invalid showtimes payload", 400)

            if not normalized_showtimes:
                return self.fail("At least one valid showtime is required", 400)

            _replace_event_showtimes(event, normalized_showtimes)
            event.start_date = min(item["start_datetime"] for item in normalized_showtimes)
            event.end_date = max(item["end_datetime"] for item in normalized_showtimes)
            has_changes = True
        elif start_date is not None or end_date is not None or venue_id is not None:
            # Backward-compatible sync for legacy clients that only send event start/end.
            showtime = (
                Showtime.query
                .filter_by(event_id=event.event_id)
                .order_by(Showtime.start_datetime.asc(), Showtime.showtime_id.asc())
                .first()
            )
            if showtime:
                if start_date is not None:
                    showtime.start_datetime = event.start_date
                if end_date is not None:
                    showtime.end_datetime = event.end_date
                if venue_id is not None and str(venue_id).strip() != "":
                    showtime.venue_id = event.venue_id
                showtime.update_date = datetime.utcnow()
            elif event.start_date and event.end_date:
                _replace_event_showtimes(
                    event,
                    [
                        {
                            "start_datetime": event.start_date,
                            "end_datetime": event.end_date,
                            "venue_id": event.venue_id,
                            "status": "ACTIVE",
                        }
                    ],
                )

        ticket_types = _extract_ticket_type_payloads()
        if ticket_types:
            assigned_seat_ids = set()
            for item in ticket_types:
                tt_id = item.get("ticket_type_id") or item.get("TicketTypeID")
                type_name = item.get("type_name") or item.get("TypeName")
                price = item.get("price") or item.get("Price")
                sale_start_date = item.get("sale_start_date") if "sale_start_date" in item else item.get("SaleStartDate")
                sale_end_date = item.get("sale_end_date") if "sale_end_date" in item else item.get("SaleEndDate")
                status_val = item.get("status") or item.get("Status")

                target = None
                if tt_id:
                    target = TicketType.query.filter_by(ticket_type_id=int(tt_id), event_id=event.event_id).first()
                if target is None and type_name:
                    target = TicketType.query.filter_by(event_id=event.event_id, type_name=type_name).first()

                if target is None and type_name and price is not None:
                    parsed_sale_start = parse_datetime(sale_start_date)
                    parsed_sale_end = parse_datetime(sale_end_date)
                    if not parsed_sale_start or not parsed_sale_end:
                        return self.fail("Each ticket type requires sale_start_date and sale_end_date", 400)
                    if parsed_sale_end < parsed_sale_start:
                        return self.fail("sale_end_date must be after or equal sale_start_date", 400)
                    target = TicketType(
                        event_id=event.event_id,
                        type_name=type_name,
                        price=price,
                        sale_start_date=parsed_sale_start,
                        sale_end_date=parsed_sale_end,
                        status=str(status_val or "ACTIVE").upper(),
                        create_id=event.organizer_id,
                        create_date=datetime.utcnow(),
                        update_date=None,
                    )
                    db.session.add(target)
                    db.session.flush()
                elif target is not None:
                    if type_name is not None:
                        target.type_name = type_name
                    if price is not None:
                        target.price = price
                    if sale_start_date is not None:
                        target.sale_start_date = parse_datetime(sale_start_date)
                    if sale_end_date is not None:
                        target.sale_end_date = parse_datetime(sale_end_date)
                    if target.sale_start_date and target.sale_end_date and target.sale_end_date < target.sale_start_date:
                        return self.fail("sale_end_date must be after or equal sale_start_date", 400)
                    if status_val is not None:
                        target.status = str(status_val).upper()
                    target.update_date = datetime.utcnow()

                if target is not None:
                    selected_seats = _extract_selected_seats(item)
                    seat_ids = _resolve_seat_ids_for_venue(event.venue_id, selected_seats, event.organizer_id)
                    if selected_seats and not seat_ids:
                        return self.fail(
                            f"Ticket type '{target.type_name}' has selected_seats but none could be resolved for venue {event.venue_id}",
                            400,
                        )
                    duplicate_ids = [seat_id for seat_id in seat_ids if seat_id in assigned_seat_ids]
                    if duplicate_ids:
                        return self.fail("A seat cannot belong to multiple ticket types in the same event", 400)
                    assigned_seat_ids.update(seat_ids)
                    _replace_ticket_type_seats(target.ticket_type_id, seat_ids, event.organizer_id)
            has_changes = True

        _upsert_qr_for_event(event.event_id, event.organizer_id)

        if not has_changes:
            return self.fail("No fields to update", 400)

        event.update_date = datetime.utcnow()
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return self.fail("Invalid related data for event update", 400)
        return self.ok(_event_to_payload(event))

    def put(self, event_id):
        return self.patch(event_id)

    def delete(self, event_id):
        event = Event.query.filter_by(event_id=event_id).first()
        if not event:
            return self.fail("Not found", 404)
        _delete_event_dependencies(event.event_id)
        db.session.delete(event)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return self.fail("Cannot delete event because related data still exists", 400)
        return self.ok({"Deleted": True})


class EventBulkDeleteView(ApiMethodView):
    def post(self):
        data = request.get_json(silent=True) or {}
        event_ids = data.get("event_ids") or data.get("EventIDs") or []
        if not isinstance(event_ids, list) or not event_ids:
            return self.fail("event_ids is required", 400)

        deleted_ids = []
        failed_events = []
        for event_id in event_ids:
            event = Event.query.filter_by(event_id=event_id).first()
            if not event:
                failed_events.append({"event_id": event_id, "event_name": None, "reason": "Not found"})
                continue
            _delete_event_dependencies(event.event_id)
            deleted_ids.append(event.event_id)
            db.session.delete(event)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return self.fail("Cannot bulk delete events because related data still exists", 400)

        return self.ok(
            {
                "success_count": len(deleted_ids),
                "deleted_event_ids": deleted_ids,
                "failed_events": failed_events,
            }
        )


events_bp.add_url_rule("/events", view_func=EventListView.as_view("events_list"), methods=["GET", "POST"])
events_bp.add_url_rule("/events/<int:event_id>", view_func=EventDetailView.as_view("events_detail"), methods=["GET", "PUT", "PATCH", "DELETE"])
events_bp.add_url_rule("/events/bulk-delete", view_func=EventBulkDeleteView.as_view("events_bulk_delete"), methods=["POST"])

