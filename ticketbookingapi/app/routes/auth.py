from datetime import datetime

from flask import Blueprint, request

from app.extensions import db
from app.models import User
from app.routes.helpers import ApiMethodView, parse_datetime

auth_bp = Blueprint("auth", __name__)


class AuthLoginView(ApiMethodView):
    def post(self):
        data = request.get_json() or {}
        email = data.get("Email")
        password = data.get("Password")
        required_role = (data.get("RequiredRole") or data.get("required_role") or "").strip().upper()
        if not email or not password:
            return self.fail("Email and Password are required", 400)

        user = User.query.filter_by(email=email, password=password).first()
        if not user:
            return self.fail("Invalid credentials", 401)

        role_name = ""
        if user.role is not None and getattr(user.role, "role_name", None):
            role_name = str(user.role.role_name).strip().lower()

        effective_role = "USER"
        if user.role_id == 1 or "admin" in role_name:
            effective_role = "ADMIN"
        elif user.role_id == 2 or "organizer" in role_name:
            effective_role = "ORGANIZER"

        if required_role and required_role != effective_role:
            return self.fail("Access denied for this role", 403)

        return self.ok(user.to_dict())


class AuthRegisterView(ApiMethodView):
    def post(self):
        data = request.get_json() or {}
        required_fields = ["Password", "RoleID", "Email", "Phone", "FullName", "CreateID"]

        for field in required_fields:
            if field not in data:
                return self.fail(f"Missing field: {field}", 400)

        if User.query.filter_by(email=data["Email"]).first():
            return self.fail("Email already exists", 409)

        user = User(
            password=data["Password"],
            role_id=data["RoleID"],
            email=data["Email"],
            phone=data["Phone"],
            full_name=data["FullName"],
            status=data.get("Status", "Active"),
            create_id=data["CreateID"],
            create_date=parse_datetime(data.get("CreateDate")) or datetime.utcnow(),
            update_date=parse_datetime(data.get("UpdateDate")),
        )
        db.session.add(user)
        db.session.commit()

        return self.ok(user.to_dict(), 201)


class AuthChangePasswordView(ApiMethodView):
    def post(self):
        data = request.get_json() or {}
        user_id = data.get("UserID") or data.get("user_id")
        old_password = data.get("OldPassword") or data.get("old_password")
        new_password = data.get("NewPassword") or data.get("new_password")
        force = bool(data.get("Force") or data.get("force"))

        if not user_id and not force:
            return self.fail("UserID is required", 400)
        if not new_password:
            return self.fail("NewPassword is required", 400)

        user = None
        if user_id:
            user = User.query.filter_by(user_id=user_id).first()
        elif force:
            # Force mode can still resolve by Email if needed.
            email = data.get("Email") or data.get("email")
            if email:
                user = User.query.filter_by(email=email).first()

        if not user:
            return self.fail("User not found", 404)

        if not force:
            if not old_password:
                return self.fail("OldPassword is required", 400)
            if user.password != str(old_password):
                return self.fail("Current password is incorrect", 400)

        user.password = str(new_password)
        user.update_date = datetime.utcnow()
        db.session.commit()

        return self.ok({"UserID": user.user_id})


auth_bp.add_url_rule("/auth/login", view_func=AuthLoginView.as_view("auth_login"), methods=["POST"])
auth_bp.add_url_rule("/auth/register", view_func=AuthRegisterView.as_view("auth_register"), methods=["POST"])
auth_bp.add_url_rule("/auth/change-password", view_func=AuthChangePasswordView.as_view("auth_change_password"), methods=["POST"])
