from datetime import datetime

from flask import Blueprint, request

from app.extensions import db
from app.models import Organizer
from app.routes.helpers import ApiMethodView

organizers_bp = Blueprint("organizers", __name__)


class OrganizerListView(ApiMethodView):
    def get(self):
        return self.ok([row.to_dict() for row in Organizer.query.all()])


class OrganizerDetailView(ApiMethodView):
    def get(self, organizer_id):
        row = Organizer.query.filter_by(organizer_id=organizer_id).first()
        if not row:
            row = Organizer.query.filter_by(create_id=organizer_id).first()
        if not row:
            return self.fail("Not found", 404)
        return self.ok(row.to_dict())

    def patch(self, organizer_id):
        row = Organizer.query.filter_by(organizer_id=organizer_id).first()
        if not row:
            row = Organizer.query.filter_by(create_id=organizer_id).first()
        if not row:
            return self.fail("Not found", 404)

        data = request.get_json(silent=True) or {}
        organizer_name = data.get("OrganizerName") or data.get("organizer_name") or data.get("organization_name")
        description = data.get("Description") or data.get("description")
        logo_url = data.get("LogoURL") or data.get("logo_url")

        if organizer_name is not None:
            row.organizer_name = organizer_name
        if description is not None:
            row.description = description
        if logo_url is not None:
            row.logo_url = logo_url
        row.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(row.to_dict())


organizers_bp.add_url_rule("/organizers", view_func=OrganizerListView.as_view("organizers_list"), methods=["GET"])
organizers_bp.add_url_rule("/organizers/<int:organizer_id>", view_func=OrganizerDetailView.as_view("organizers_detail"), methods=["GET", "PATCH"])
