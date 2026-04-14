from datetime import datetime
import random
import string

from flask import Blueprint, request

from app.extensions import db
from app.models import User
from app.routes.helpers import ApiMethodView

users_bp = Blueprint("users", __name__)


def _generate_temp_password(length=10):
    alphabet = string.ascii_letters + string.digits
    return "".join(random.choice(alphabet) for _ in range(length))


class UserListView(ApiMethodView):
    def get(self):
        return self.ok([row.to_dict() for row in User.query.all()])


class UserDetailView(ApiMethodView):
    def get(self, user_id):
        user = User.query.filter_by(user_id=user_id).first()
        if not user:
            return self.fail("Not found", 404)
        return self.ok(user.to_dict())

    def patch(self, user_id):
        user = User.query.filter_by(user_id=user_id).first()
        if not user:
            return self.fail("Not found", 404)

        data = request.get_json(silent=True) or {}
        status = data.get("Status") or data.get("status")
        password = data.get("Password") or data.get("password")
        full_name = data.get("FullName") or data.get("full_name")
        phone = data.get("Phone") or data.get("phone")
        email = data.get("Email") or data.get("email")

        if status is not None:
            user.status = str(status)
        if password is not None:
            user.password = str(password)
        if full_name is not None:
            user.full_name = full_name
        if phone is not None:
            user.phone = phone
        if email is not None:
            user.email = email

        user.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(user.to_dict())


class UserResetPasswordView(ApiMethodView):
    def post(self, user_id):
        user = User.query.filter_by(user_id=user_id).first()
        if not user:
            return self.fail("Not found", 404)

        temp_password = _generate_temp_password()
        user.password = temp_password
        user.update_date = datetime.utcnow()
        db.session.commit()

        return self.ok(
            {
                "UserID": user.user_id,
                "Email": user.email,
                "FullName": user.full_name,
                "NewPassword": temp_password,
            }
        )


users_bp.add_url_rule("/users", view_func=UserListView.as_view("users_list"), methods=["GET"])
users_bp.add_url_rule("/users/<int:user_id>", view_func=UserDetailView.as_view("users_detail"), methods=["GET", "PATCH"])
users_bp.add_url_rule("/users/<int:user_id>/reset-password", view_func=UserResetPasswordView.as_view("users_reset_password"), methods=["POST"])
