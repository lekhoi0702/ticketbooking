from datetime import datetime

from flask import Blueprint, request

from app.extensions import db
from app.models import EventSeat, Order, Seat, Ticket, TicketType
from app.routes.helpers import ApiMethodView, parse_datetime


tickets_bp = Blueprint("tickets", __name__)


class TicketListCreateView(ApiMethodView):
    def get(self):
        order_id = request.args.get("OrderID", type=int)
        code = request.args.get("TicketCode")
        query = Ticket.query
        if order_id:
            query = query.filter_by(order_id=order_id)
        if code:
            query = query.filter(Ticket.ticket_qrcode == code)
        rows = query.order_by(Ticket.ticket_id.desc()).all()
        return self.ok([row.to_dict() for row in rows])

    def post(self):
        data = request.get_json() or {}
        required_fields = ["OrderID", "SeatID", "TicketTypeID", "TicketPrice", "TicketQRCode", "CreateID"]

        for field in required_fields:
            if field not in data:
                return self.fail(f"Missing field: {field}", 400)

        order = Order.query.filter_by(order_id=data["OrderID"]).first()
        if not order:
            return self.fail("Order not found", 404)

        seat = Seat.query.filter_by(seat_id=data["SeatID"]).first()
        if not seat:
            return self.fail("Seat not found", 404)

        ticket_type = TicketType.query.filter_by(ticket_type_id=data["TicketTypeID"]).first()
        if not ticket_type:
            return self.fail("TicketType not found", 404)

        now = datetime.now()
        if ticket_type.sale_start_date and now < ticket_type.sale_start_date:
            return self.fail("Ticket sale has not started yet", 400)
        if ticket_type.sale_end_date and now > ticket_type.sale_end_date:
            return self.fail("Ticket sale has ended", 400)

        # Prevent duplicate seat assignment for the same event.
        existing = (
            Ticket.query.join(Order, Order.order_id == Ticket.order_id)
            .filter(
                Ticket.seat_id == seat.seat_id,
                Order.event_id == order.event_id,
                Ticket.status.in_(["ACTIVE", "USED", "BOOKED"]),
            )
            .first()
        )
        if existing:
            return self.fail("Seat already assigned for this event", 409)

        event_seat = EventSeat.query.filter_by(event_id=order.event_id, seat_id=seat.seat_id).first()
        if not event_seat:
            event_seat = EventSeat(
                event_id=order.event_id,
                seat_id=seat.seat_id,
                status="AVAILABLE",
                create_id=data["CreateID"],
                create_date=datetime.utcnow(),
                update_date=None,
            )
            db.session.add(event_seat)
            db.session.flush()

        event_seat_status = str(event_seat.status or "").strip().upper()
        if event_seat_status == "BOOKED":
            return self.fail("Seat already booked", 409)

        ticket = Ticket(
            order_id=data["OrderID"],
            seat_id=data["SeatID"],
            ticket_type_id=data["TicketTypeID"],
            ticket_price=data["TicketPrice"],
            status=data.get("Status", "Active"),
            ticket_qrcode=data["TicketQRCode"],
            create_id=data["CreateID"],
            create_date=parse_datetime(data.get("CreateDate")) or datetime.utcnow(),
            update_date=parse_datetime(data.get("UpdateDate")),
        )
        db.session.add(ticket)
        event_seat.status = "BOOKED"
        event_seat.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(ticket.to_dict(), 201)


class TicketDetailView(ApiMethodView):
    def patch(self, ticket_id):
        ticket = Ticket.query.filter_by(ticket_id=ticket_id).first()
        if not ticket:
            return self.fail("Not found", 404)

        data = request.get_json(silent=True) or {}
        status = data.get("Status") or data.get("status")
        if status is not None:
            ticket.status = str(status).upper()
            ticket.update_date = datetime.utcnow()
            db.session.commit()

        return self.ok(ticket.to_dict())


class TicketCheckinView(ApiMethodView):
    def post(self):
        data = request.get_json(silent=True) or {}
        code = data.get("TicketCode") or data.get("ticket_code") or data.get("code")
        if not code:
            return self.fail("TicketCode is required", 400)

        ticket = Ticket.query.filter_by(ticket_qrcode=str(code)).first()
        if not ticket:
            return self.fail("Ticket not found", 404)

        if str(ticket.status).upper() != "ACTIVE":
            return self.fail("Ticket is not active", 400)

        ticket.status = "USED"
        ticket.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(ticket.to_dict())


tickets_bp.add_url_rule("/tickets", view_func=TicketListCreateView.as_view("tickets_list_create"), methods=["GET", "POST"])
tickets_bp.add_url_rule("/tickets/<int:ticket_id>", view_func=TicketDetailView.as_view("tickets_detail"), methods=["PATCH"])
tickets_bp.add_url_rule("/tickets/check-in", view_func=TicketCheckinView.as_view("tickets_checkin"), methods=["POST"])

