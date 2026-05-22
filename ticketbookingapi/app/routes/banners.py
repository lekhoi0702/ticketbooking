from datetime import datetime
import os
from uuid import uuid4

from flask import Blueprint, request
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.banner import Banner
from app.routes.helpers import ApiMethodView


banners_bp = Blueprint("banners", __name__)


def _uploads_banner_dir():
    current_app_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.dirname(current_app_dir)
    api_root = os.path.dirname(app_dir)
    path = os.path.join(api_root, "uploads", "banner")
    os.makedirs(path, exist_ok=True)
    return path


def _save_upload(file_storage):
    if not file_storage or not file_storage.filename:
        return None
    original = secure_filename(file_storage.filename)
    _, ext = os.path.splitext(original)
    generated = f"banner_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid4().hex[:8]}{ext.lower()}"
    abs_path = os.path.join(_uploads_banner_dir(), generated)
    file_storage.save(abs_path)
    return f"/uploads/banner/{generated}"


class BannerListView(ApiMethodView):
    def get(self):
        rows = Banner.query.order_by(Banner.display_order.asc(), Banner.banner_id.asc()).all()
        return self.ok([row.to_dict() for row in rows])

    def post(self):
        payload = request.get_json(silent=True) or {}
        title = payload.get("Title") or payload.get("title") or ""
        image_url = payload.get("ImageURL") or payload.get("image_url") or payload.get("image") or ""
        display_order = payload.get("DisplayOrder") or payload.get("display_order") or 0
        is_active = payload.get("IsActive")
        if is_active is None:
            is_active = payload.get("is_active", True)

        if not image_url:
            return self.fail("image_url is required", 400)

        row = Banner(
            title=title,
            image_url=image_url,
            display_order=int(display_order),
            is_active=bool(is_active),
            create_date=datetime.utcnow(),
            update_date=datetime.utcnow(),
        )
        db.session.add(row)
        db.session.commit()
        return self.ok(row.to_dict(), 201)


class BannerDetailView(ApiMethodView):
    def put(self, banner_id):
        row = Banner.query.filter_by(banner_id=banner_id).first()
        if not row:
            return self.fail("Not found", 404)

        payload = request.get_json(silent=True) or {}
        if "Title" in payload or "title" in payload:
            row.title = payload.get("Title") or payload.get("title") or ""
        if "ImageURL" in payload or "image_url" in payload or "image" in payload:
            row.image_url = payload.get("ImageURL") or payload.get("image_url") or payload.get("image") or ""
        if "DisplayOrder" in payload or "display_order" in payload:
            row.display_order = int(payload.get("DisplayOrder") or payload.get("display_order") or 0)
        if "IsActive" in payload or "is_active" in payload:
            val = payload.get("IsActive")
            if val is None:
                val = payload.get("is_active")
            row.is_active = bool(val)

        row.update_date = datetime.utcnow()
        db.session.commit()
        return self.ok(row.to_dict())

    def delete(self, banner_id):
        row = Banner.query.filter_by(banner_id=banner_id).first()
        if not row:
            return self.fail("Not found", 404)
        db.session.delete(row)
        db.session.commit()
        return self.ok({"Deleted": True})


class BannerPublicView(ApiMethodView):
    def get(self):
        limit = request.args.get("limit")
        query = Banner.query.filter_by(is_active=True).order_by(Banner.display_order.asc(), Banner.banner_id.asc())
        if limit:
            try:
                query = query.limit(max(int(limit), 0))
            except Exception:
                pass
        rows = query.all()
        return self.ok([row.to_dict() for row in rows])


class BannerUploadView(ApiMethodView):
    def post(self):
        file_storage = request.files.get("image") or request.files.get("banner_image")
        saved = _save_upload(file_storage)
        if not saved:
            return self.fail("image file is required", 400)
        return self.ok({"ImageURL": saved}, 201)


banners_bp.add_url_rule("/banners", view_func=BannerListView.as_view("banners_list"), methods=["GET", "POST"])
banners_bp.add_url_rule("/banners/<int:banner_id>", view_func=BannerDetailView.as_view("banners_detail"), methods=["PUT", "DELETE"])
banners_bp.add_url_rule("/banners/public", view_func=BannerPublicView.as_view("banners_public"), methods=["GET"])
banners_bp.add_url_rule("/banners/upload", view_func=BannerUploadView.as_view("banners_upload"), methods=["POST"])
