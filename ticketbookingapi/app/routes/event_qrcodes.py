from flask import Blueprint, request

from app.models import EventQRCode
from app.routes.helpers import ApiMethodView

event_qrcodes_bp = Blueprint("event_qrcodes", __name__)


class EventQRCodeListView(ApiMethodView):
    def get(self):
        event_id = request.args.get("EventID", type=int)
        query = EventQRCode.query
        if event_id:
            query = query.filter_by(event_id=event_id)
        rows = query.order_by(EventQRCode.qrcode_id.desc()).all()
        return self.ok([row.to_dict() for row in rows])


event_qrcodes_bp.add_url_rule("/event-qrcodes", view_func=EventQRCodeListView.as_view("event_qrcodes_list"), methods=["GET"])
