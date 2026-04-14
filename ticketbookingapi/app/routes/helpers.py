from datetime import datetime

from flask import jsonify
from flask.views import MethodView


class ApiMethodView(MethodView):
    def ok(self, data=None, status=200):
        return jsonify({"Success": True, "Data": data}), status

    def fail(self, message, status=400):
        return jsonify({"Success": False, "Message": message}), status


def parse_datetime(value):
    if value is None:
        return None
    if isinstance(value, str) and value.strip() == "":
        return None
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(value)
