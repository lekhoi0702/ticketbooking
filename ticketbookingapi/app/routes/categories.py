from datetime import datetime

from flask import Blueprint, request

from app.extensions import db
from app.models import EventCategory
from app.routes.helpers import ApiMethodView

categories_bp = Blueprint("categories", __name__)


class CategoryListView(ApiMethodView):
    def get(self):
        return self.ok([row.to_dict() for row in EventCategory.query.all()])

    def post(self):
        data = request.get_json(silent=True) or {}
        category_name = data.get("CategoryName") or data.get("category_name")
        status = data.get("Status") or data.get("status") or "ACTIVE"
        create_id = data.get("CreateID") or data.get("create_id") or 1

        if not category_name:
            return self.fail("CategoryName is required", 400)

        try:
            create_id = int(create_id)
        except (TypeError, ValueError):
            create_id = 1

        category = EventCategory(
            category_name=category_name,
            status=str(status).upper(),
            create_id=create_id,
            create_date=datetime.utcnow(),
            update_date=None,
        )
        db.session.add(category)
        db.session.commit()
        return self.ok(category.to_dict(), 201)


class CategoryDetailView(ApiMethodView):
    def put(self, category_id):
        category = EventCategory.query.filter_by(category_id=category_id).first()
        if not category:
            return self.fail("Not found", 404)

        data = request.get_json(silent=True) or {}
        category_name = data.get("CategoryName") or data.get("category_name")
        status = data.get("Status") or data.get("status")

        if category_name is not None:
            category.category_name = category_name
        if status is not None:
            category.status = str(status).upper()

        category.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(category.to_dict())

    def delete(self, category_id):
        category = EventCategory.query.filter_by(category_id=category_id).first()
        if not category:
            return self.fail("Not found", 404)

        db.session.delete(category)
        db.session.commit()
        return self.ok({"Deleted": True})


categories_bp.add_url_rule("/categories", view_func=CategoryListView.as_view("categories_list"), methods=["GET", "POST"])
categories_bp.add_url_rule("/categories/<int:category_id>", view_func=CategoryDetailView.as_view("categories_detail"), methods=["PUT", "DELETE"])
