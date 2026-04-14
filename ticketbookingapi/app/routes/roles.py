from flask import Blueprint

from app.models import Role
from app.routes.helpers import ApiMethodView

roles_bp = Blueprint("roles", __name__)


class RoleListView(ApiMethodView):
    def get(self):
        return self.ok([row.to_dict() for row in Role.query.all()])


roles_bp.add_url_rule("/roles", view_func=RoleListView.as_view("roles_list"), methods=["GET"])
