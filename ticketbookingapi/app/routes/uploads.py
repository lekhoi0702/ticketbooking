import os

from flask import Blueprint, make_response, send_from_directory

from app.config import Config
from app.exceptions import NotFoundException
from app.routes.helpers import ApiMethodView
from app.utils.logger import get_logger

uploads_bp = Blueprint("uploads", __name__)
upload_logger = get_logger("ticketbooking.uploads")


class UploadFileView(ApiMethodView):
    def get(self, filename):
        current_app_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(current_app_dir)
        api_root = os.path.dirname(app_dir)
        uploads_dir = os.path.join(api_root, "uploads")

        full_path = os.path.join(uploads_dir, filename)
        if not os.path.exists(full_path):
            upload_logger.warning("File not found: %s", filename, extra={"file_path": filename})
            raise NotFoundException(message=f"File not found: {filename}")

        response = make_response(send_from_directory(uploads_dir, filename))

        if Config.FLASK_ENV == "production":
            allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
            if allowed_origins and allowed_origins[0]:
                response.headers["Access-Control-Allow-Origin"] = allowed_origins[0]
        else:
            response.headers["Access-Control-Allow-Origin"] = "*"

        lower_name = filename.lower()
        if lower_name.endswith(".svg"):
            response.headers["Content-Type"] = "image/svg+xml"
        elif lower_name.endswith((".jpg", ".jpeg")):
            response.headers["Content-Type"] = "image/jpeg"
        elif lower_name.endswith(".png"):
            response.headers["Content-Type"] = "image/png"
        elif lower_name.endswith(".webp"):
            response.headers["Content-Type"] = "image/webp"

        return response


uploads_bp.add_url_rule("/uploads/<path:filename>", view_func=UploadFileView.as_view("uploads_file"), methods=["GET"])
