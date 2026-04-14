from flask import Blueprint

from app.routes.helpers import ApiMethodView

health_bp = Blueprint("health", __name__)


class HealthView(ApiMethodView):
    def get(self):
        return self.ok({"Status": "OK", "Message": "API is running"})


health_bp.add_url_rule("/health", view_func=HealthView.as_view("health"), methods=["GET"])
