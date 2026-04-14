from datetime import datetime

from flask import Blueprint, request

from app.extensions import db
from app.models import Order, Payment, Ticket, TicketType, Seat, User, Event
from app.routes.helpers import ApiMethodView, parse_datetime

orders_bp = Blueprint("orders", __name__)


def _normalize_order_status(status):
    if not status:
        return "PENDING"
    s = str(status).strip().upper()
    mapping = {
        "PENDING": "PENDING",
        "PAID": "PAID",
        "CANCELLED": "CANCELLED",
        "CANCELLATION_PENDING": "CANCELLATION_PENDING",
        "COMPLETED": "COMPLETED",
    }
    return mapping.get(s, s)


def _serialize_order_summary(order):
    user = order.user
    event = order.event
    latest_payment = order.payments[0] if order.payments else None
    status = _normalize_order_status(order.status)
    tickets = order.tickets or []
    return {
        **order.to_dict(),
        "OrderStatus": status,
        "CustomerName": user.full_name if user else None,
        "CustomerEmail": user.email if user else None,
        "CustomerPhone": user.phone if user else None,
        "EventName": event.event_name if event else None,
        "CreatedAt": order.order_date.isoformat() if order.order_date else None,
        "TicketsCount": len(tickets),
        "PaymentMethod": latest_payment.payment_method if latest_payment else "CASH",
    }


def _serialize_ticket_detail(ticket):
    ticket_type = ticket.ticket_type
    seat = ticket.seat
    return {
        **ticket.to_dict(),
        "TicketCode": ticket.ticket_qrcode,
        "TicketTypeName": ticket_type.type_name if ticket_type else None,
        "SeatName": f"{seat.row_number}{seat.seat_number}" if seat else None,
        "TicketStatus": ticket.status,
        "Price": float(ticket.ticket_price) if ticket.ticket_price is not None else 0,
    }


class OrderListCreateView(ApiMethodView):
    def get(self):
        user_id = request.args.get("UserID", type=int)
        query = Order.query
        if user_id:
            query = query.filter_by(user_id=user_id)
        rows = query.order_by(Order.order_date.desc()).all()
        return self.ok([_serialize_order_summary(row) for row in rows])

    def post(self):
        data = request.get_json() or {}
        required_fields = ["UserID", "EventID", "TotalAmount", "OrderCode", "CreateID"]

        for field in required_fields:
            if field not in data:
                return self.fail(f"Missing field: {field}", 400)

        order = Order(
            user_id=data["UserID"],
            event_id=data["EventID"],
            order_date=parse_datetime(data.get("OrderDate")) or datetime.utcnow(),
            total_amount=data["TotalAmount"],
            status=_normalize_order_status(data.get("Status", "PENDING")),
            order_code=data["OrderCode"],
            create_id=data["CreateID"],
            update_date=parse_datetime(data.get("UpdateDate")),
        )
        db.session.add(order)
        db.session.commit()
        return self.ok(_serialize_order_summary(order), 201)


class OrderDetailView(ApiMethodView):
    def get(self, order_id):
        order = Order.query.filter_by(order_id=order_id).first()
        if not order:
            return self.fail("Not found", 404)

        data = _serialize_order_summary(order)
        data["Tickets"] = [_serialize_ticket_detail(ticket) for ticket in order.tickets]
        data["Payments"] = [payment.to_dict() for payment in order.payments]
        return self.ok(data)

    def patch(self, order_id):
        order = Order.query.filter_by(order_id=order_id).first()
        if not order:
            return self.fail("Not found", 404)

        data = request.get_json(silent=True) or {}
        status = data.get("Status") or data.get("status")
        if status is not None:
            order.status = _normalize_order_status(status)
            order.update_date = datetime.utcnow()
            db.session.commit()

        return self.ok(_serialize_order_summary(order))


class OrderCashConfirmView(ApiMethodView):
    def post(self, order_id):
        order = Order.query.filter_by(order_id=order_id).first()
        if not order:
            return self.fail("Not found", 404)
        order.status = "PAID"
        order.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(_serialize_order_summary(order))


class OrderRefundRequestView(ApiMethodView):
    def post(self, order_id):
        order = Order.query.filter_by(order_id=order_id).first()
        if not order:
            return self.fail("Not found", 404)
        order.status = "CANCELLATION_PENDING"
        order.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(_serialize_order_summary(order))


class OrderRefundCancelView(ApiMethodView):
    def post(self, order_id):
        order = Order.query.filter_by(order_id=order_id).first()
        if not order:
            return self.fail("Not found", 404)
        order.status = "PAID"
        order.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(_serialize_order_summary(order))


class OrderRefundProcessView(ApiMethodView):
    def post(self, order_id):
        order = Order.query.filter_by(order_id=order_id).first()
        if not order:
            return self.fail("Not found", 404)

        data = request.get_json(silent=True) or {}
        action = (data.get("Action") or data.get("action") or "").strip().lower()
        if action not in ("approve", "reject"):
            return self.fail("action must be approve or reject", 400)

        if action == "approve":
            order.status = "CANCELLED"
            for ticket in order.tickets:
                ticket.status = "CANCELLED"
                ticket.update_date = datetime.utcnow()
                if ticket.seat:
                    ticket.seat.status = "AVAILABLE"
                    ticket.seat.update_date = datetime.utcnow()
        else:
            order.status = "PAID"

        order.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(_serialize_order_summary(order))


class RefundRequestListView(ApiMethodView):
    def get(self):
        manager_id = request.args.get("ManagerID", type=int)

        query = Order.query.filter(Order.status == "CANCELLATION_PENDING")
        if manager_id:
            query = query.join(Event, Event.event_id == Order.event_id).filter(Event.organizer_id == manager_id)

        rows = query.order_by(Order.order_date.desc()).all()
        out = []
        for order in rows:
            item = _serialize_order_summary(order)
            item["Tickets"] = [_serialize_ticket_detail(ticket) for ticket in order.tickets]
            item["EventDate"] = order.event.start_date.isoformat() if order.event and order.event.start_date else None
            out.append(item)
        return self.ok(out)


orders_bp.add_url_rule("/orders", view_func=OrderListCreateView.as_view("orders_list_create"), methods=["GET", "POST"])
orders_bp.add_url_rule("/orders/<int:order_id>", view_func=OrderDetailView.as_view("orders_detail"), methods=["GET", "PATCH"])
orders_bp.add_url_rule("/orders/<int:order_id>/confirm-cash", view_func=OrderCashConfirmView.as_view("orders_confirm_cash"), methods=["POST"])
orders_bp.add_url_rule("/orders/<int:order_id>/refund-request", view_func=OrderRefundRequestView.as_view("orders_refund_request"), methods=["POST"])
orders_bp.add_url_rule("/orders/<int:order_id>/refund-cancel", view_func=OrderRefundCancelView.as_view("orders_refund_cancel"), methods=["POST"])
orders_bp.add_url_rule("/orders/<int:order_id>/refund-process", view_func=OrderRefundProcessView.as_view("orders_refund_process"), methods=["POST"])
orders_bp.add_url_rule("/orders/refund-requests", view_func=RefundRequestListView.as_view("orders_refund_requests"), methods=["GET"])
