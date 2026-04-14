from datetime import datetime

from flask import Blueprint, request
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Discount, Event, User
from app.routes.helpers import ApiMethodView, parse_datetime

discounts_bp = Blueprint("discounts", __name__)


class DiscountListView(ApiMethodView):
    def get(self):
        event_id = request.args.get("EventID", type=int)
        code = (request.args.get("Code") or "").strip()
        query = Discount.query
        if code:
            query = query.filter(Discount.code == code.upper())
        if event_id:
            query = query.filter(or_(Discount.applies_all_events.is_(True), Discount.event_id == event_id))
        rows = query.order_by(Discount.discount_id.desc()).all()
        return self.ok([row.to_dict() for row in rows])

    def post(self):
        data = request.get_json(silent=True) or {}
        event_id = data.get("EventID") or data.get("event_id")
        applies_all_events = bool(data.get("AppliesAllEvents") or data.get("applies_all_events"))
        code = data.get("Code") or data.get("code")
        description = data.get("Description") or data.get("description") or data.get("name")
        discount_amount = data.get("DiscountAmount") or data.get("discount_amount") or data.get("value")
        start_date = parse_datetime(data.get("StartDate") or data.get("start_date"))
        end_date = parse_datetime(data.get("EndDate") or data.get("end_date"))
        status = data.get("Status") or data.get("status") or "ACTIVE"
        create_id = data.get("CreateID") or data.get("create_id") or data.get("manager_id") or 1

        if not code or discount_amount is None or not start_date or not end_date:
            return self.fail("code, discount_amount, start_date and end_date are required", 400)
        if end_date < start_date:
            return self.fail("end_date must be after or equal start_date", 400)

        creator = User.query.filter_by(user_id=int(create_id)).first()
        creator_role = int(creator.role_id) if creator else 0
        is_admin_creator = creator_role == 1
        is_organizer_creator = creator_role == 2

        if not is_admin_creator and not is_organizer_creator:
            return self.fail("Only admin or organizer can create discount", 403)

        if is_admin_creator:
            # Admin can create code for all events or a single event.
            if applies_all_events:
                event_id = None
            elif not event_id:
                return self.fail("event_id is required when AppliesAllEvents is false", 400)
        else:
            # Non-admin cannot create global discount.
            applies_all_events = False
            if not event_id:
                return self.fail("event_id is required", 400)

        if is_organizer_creator:
            # Organizer only creates discount for their own events.
            event = Event.query.filter_by(event_id=int(event_id)).first()
            if not event:
                return self.fail("Event not found", 404)
            if int(event.organizer_id) != int(create_id):
                return self.fail("Organizer can only create discount for their own events", 403)

        discount = Discount(
            event_id=int(event_id) if event_id else None,
            applies_all_events=applies_all_events,
            code=str(code).upper(),
            description=description,
            discount_amount=discount_amount,
            start_date=start_date,
            end_date=end_date,
            status=str(status).upper(),
            create_id=int(create_id),
            create_date=datetime.utcnow(),
            update_date=None,
        )
        try:
            db.session.add(discount)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return self.fail("Discount code already exists", 409)
        return self.ok(discount.to_dict(), 201)


class DiscountDetailView(ApiMethodView):
    def put(self, discount_id):
        discount = Discount.query.filter_by(discount_id=discount_id).first()
        if not discount:
            return self.fail("Not found", 404)

        data = request.get_json(silent=True) or {}
        code = data.get("Code") or data.get("code")
        description = data.get("Description") or data.get("description") or data.get("name")
        discount_amount = data.get("DiscountAmount") or data.get("discount_amount") or data.get("value")
        start_date = data.get("StartDate") or data.get("start_date")
        end_date = data.get("EndDate") or data.get("end_date")
        status = data.get("Status") or data.get("status")
        event_id = data.get("EventID") or data.get("event_id")
        applies_all_events = data.get("AppliesAllEvents") if "AppliesAllEvents" in data else data.get("applies_all_events")

        if code is not None:
            discount.code = str(code).upper()
        if description is not None:
            discount.description = description
        if discount_amount is not None:
            discount.discount_amount = discount_amount
        if start_date is not None:
            discount.start_date = parse_datetime(start_date)
        if end_date is not None:
            discount.end_date = parse_datetime(end_date)
        if status is not None:
            discount.status = str(status).upper()
        if applies_all_events is not None:
            discount.applies_all_events = bool(applies_all_events)
            if discount.applies_all_events:
                discount.event_id = None
        if event_id is not None and not discount.applies_all_events:
            discount.event_id = int(event_id)
        if discount.end_date and discount.start_date and discount.end_date < discount.start_date:
            return self.fail("end_date must be after or equal start_date", 400)

        discount.update_date = datetime.utcnow()
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return self.fail("Discount code already exists", 409)
        return self.ok(discount.to_dict())

    def delete(self, discount_id):
        discount = Discount.query.filter_by(discount_id=discount_id).first()
        if not discount:
            return self.fail("Not found", 404)

        db.session.delete(discount)
        db.session.commit()
        return self.ok({"Deleted": True})


discounts_bp.add_url_rule("/discounts", view_func=DiscountListView.as_view("discounts_list"), methods=["GET", "POST"])
discounts_bp.add_url_rule("/discounts/<int:discount_id>", view_func=DiscountDetailView.as_view("discounts_detail"), methods=["PUT", "DELETE"])
