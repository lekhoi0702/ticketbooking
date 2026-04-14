from datetime import datetime

from flask import Blueprint, request
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Venue
from app.routes.helpers import ApiMethodView

venues_bp = Blueprint("venues", __name__)


class VenueListView(ApiMethodView):
    def get(self):
        return self.ok([row.to_dict() for row in Venue.query.all()])

    def post(self):
        data = request.get_json() or {}

        venue_name = data.get("VenueName") or data.get("venue_name")
        address = data.get("Address") or data.get("address")
        city = data.get("City") or data.get("city")
        capacity = data.get("Capacity") or data.get("capacity")
        create_id = data.get("CreateID") or data.get("create_id") or data.get("ManagerID") or data.get("manager_id")
        seat_map = data.get("SeatMap") or data.get("seat_map") or data.get("seat_map_template")
        status = data.get("Status") or data.get("status") or "ACTIVE"

        if not venue_name or not address or not city:
            return self.fail("VenueName, Address and City are required", 400)

        try:
            capacity = int(capacity) if capacity is not None else 0
        except (TypeError, ValueError):
            return self.fail("Capacity must be a valid integer", 400)

        try:
            create_id = int(create_id) if create_id is not None else 1
        except (TypeError, ValueError):
            create_id = 1

        venue = Venue(
            venue_name=venue_name,
            address=address,
            city=city,
            status=str(status).upper(),
            capacity=capacity,
            seat_map=seat_map if isinstance(seat_map, dict) else None,
            create_id=create_id,
            create_date=datetime.utcnow(),
            update_date=None,
        )

        db.session.add(venue)
        db.session.commit()
        return self.ok(venue.to_dict(), 201)


class VenueDetailView(ApiMethodView):
    def get(self, venue_id):
        venue = Venue.query.filter_by(venue_id=venue_id).first()
        if not venue:
            return self.fail("Not found", 404)
        return self.ok(venue.to_dict())

    def put(self, venue_id):
        venue = Venue.query.filter_by(venue_id=venue_id).first()
        if not venue:
            return self.fail("Not found", 404)

        data = request.get_json() or {}
        venue_name = data.get("VenueName", data.get("venue_name"))
        address = data.get("Address", data.get("address"))
        city = data.get("City", data.get("city"))
        capacity = data.get("Capacity", data.get("capacity"))
        status = data.get("Status", data.get("status"))
        seat_map = data.get("SeatMap", data.get("seat_map"))

        if venue_name is not None:
            venue.venue_name = venue_name
        if address is not None:
            venue.address = address
        if city is not None:
            venue.city = city
        if capacity is not None:
            try:
                venue.capacity = int(capacity)
            except (TypeError, ValueError):
                return self.fail("Capacity must be a valid integer", 400)
        if status is not None:
            venue.status = str(status).upper()
        if seat_map is not None and isinstance(seat_map, dict):
            venue.seat_map = seat_map

        venue.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(venue.to_dict())

    def delete(self, venue_id):
        venue = Venue.query.filter_by(venue_id=venue_id).first()
        if not venue:
            return self.fail("Not found", 404)
        try:
            db.session.delete(venue)
            db.session.commit()
            return self.ok({"Deleted": True})
        except IntegrityError:
            db.session.rollback()
            return self.fail("Cannot delete venue because it is referenced by related data", 409)


class VenueSeatMapView(ApiMethodView):
    def put(self, venue_id):
        venue = Venue.query.filter_by(venue_id=venue_id).first()
        if not venue:
            return self.fail("Not found", 404)

        data = request.get_json() or {}
        seat_map = data.get("SeatMap") or data.get("seat_map") or data.get("seat_map_template")
        capacity = data.get("Capacity") or data.get("capacity")

        if seat_map is not None:
            if not isinstance(seat_map, dict):
                return self.fail("seat_map_template must be an object", 400)
            venue.seat_map = seat_map

        if capacity is not None:
            try:
                venue.capacity = int(capacity)
            except (TypeError, ValueError):
                return self.fail("Capacity must be a valid integer", 400)

        venue.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(venue.to_dict())


venues_bp.add_url_rule("/venues", view_func=VenueListView.as_view("venues_list"), methods=["GET"])
venues_bp.add_url_rule("/venues", view_func=VenueListView.as_view("venues_create"), methods=["POST"])
venues_bp.add_url_rule(
    "/venues/<int:venue_id>",
    view_func=VenueDetailView.as_view("venues_detail"),
    methods=["GET", "PUT", "DELETE"],
)
venues_bp.add_url_rule("/venues/<int:venue_id>/seat-map", view_func=VenueSeatMapView.as_view("venues_seat_map"), methods=["PUT"])
