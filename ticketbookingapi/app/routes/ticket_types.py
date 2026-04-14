from datetime import datetime

from flask import Blueprint, request

from app.extensions import db
from app.models import TicketType
from app.routes.helpers import ApiMethodView, parse_datetime

ticket_types_bp = Blueprint("ticket_types", __name__)


class TicketTypeListView(ApiMethodView):
    def get(self):
        event_id = request.args.get("EventID", type=int)
        query = TicketType.query
        if event_id:
            query = query.filter_by(event_id=event_id)
        return self.ok([row.to_dict() for row in query.all()])

    def post(self):
        data = request.get_json(silent=True) or {}
        event_id = data.get("EventID") or data.get("event_id")
        type_name = data.get("TypeName") or data.get("type_name")
        price = data.get("Price") or data.get("price")
        sale_start_date = parse_datetime(data.get("SaleStartDate") or data.get("sale_start_date"))
        sale_end_date = parse_datetime(data.get("SaleEndDate") or data.get("sale_end_date"))
        status = data.get("Status") or data.get("status") or "ACTIVE"
        create_id = data.get("CreateID") or data.get("create_id") or 1

        if not event_id or not type_name or price is None:
            return self.fail("event_id, type_name and price are required", 400)
        if not sale_start_date or not sale_end_date:
            return self.fail("sale_start_date and sale_end_date are required", 400)
        if sale_end_date < sale_start_date:
            return self.fail("sale_end_date must be after or equal sale_start_date", 400)

        row = TicketType(
            event_id=int(event_id),
            type_name=type_name,
            price=price,
            sale_start_date=sale_start_date,
            sale_end_date=sale_end_date,
            status=str(status).upper(),
            create_id=int(create_id),
            create_date=datetime.utcnow(),
            update_date=None,
        )
        db.session.add(row)
        db.session.commit()
        return self.ok(row.to_dict(), 201)


class TicketTypeDetailView(ApiMethodView):
    def put(self, ticket_type_id):
        row = TicketType.query.filter_by(ticket_type_id=ticket_type_id).first()
        if not row:
            return self.fail("Not found", 404)
        data = request.get_json(silent=True) or {}

        type_name = data.get("TypeName") or data.get("type_name")
        price = data.get("Price") or data.get("price")
        sale_start_date = data.get("SaleStartDate") if "SaleStartDate" in data else data.get("sale_start_date")
        sale_end_date = data.get("SaleEndDate") if "SaleEndDate" in data else data.get("sale_end_date")
        status = data.get("Status") or data.get("status")
        if type_name is not None:
            row.type_name = type_name
        if price is not None:
            row.price = price
        if sale_start_date is not None:
            row.sale_start_date = parse_datetime(sale_start_date)
        if sale_end_date is not None:
            row.sale_end_date = parse_datetime(sale_end_date)
        if row.sale_start_date and row.sale_end_date and row.sale_end_date < row.sale_start_date:
            return self.fail("sale_end_date must be after or equal sale_start_date", 400)
        if status is not None:
            row.status = str(status).upper()
        row.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(row.to_dict())

    def delete(self, ticket_type_id):
        row = TicketType.query.filter_by(ticket_type_id=ticket_type_id).first()
        if not row:
            return self.fail("Not found", 404)
        db.session.delete(row)
        db.session.commit()
        return self.ok({"Deleted": True})


ticket_types_bp.add_url_rule("/ticket-types", view_func=TicketTypeListView.as_view("ticket_types_list"), methods=["GET", "POST"])
ticket_types_bp.add_url_rule("/ticket-types/<int:ticket_type_id>", view_func=TicketTypeDetailView.as_view("ticket_types_detail"), methods=["PUT", "DELETE"])
