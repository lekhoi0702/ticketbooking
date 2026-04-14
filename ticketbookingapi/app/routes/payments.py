from datetime import datetime

from flask import Blueprint, request
from sqlalchemy import or_

from app.extensions import db
from app.models import Order, Payment
from app.routes.helpers import ApiMethodView, parse_datetime

payments_bp = Blueprint("payments", __name__)


class PaymentListCreateView(ApiMethodView):
    def get(self):
        order_id = request.args.get("OrderID", type=int)
        query = Payment.query
        if order_id:
            query = query.filter_by(order_id=order_id)
        rows = query.order_by(Payment.payment_date.desc()).all()
        return self.ok([row.to_dict() for row in rows])

    def post(self):
        data = request.get_json() or {}
        required_fields = ["OrderID", "Amount", "PaymentMethod", "CreateID"]

        for field in required_fields:
            if field not in data:
                return self.fail(f"Missing field: {field}", 400)

        payment = Payment(
            order_id=data["OrderID"],
            payment_date=parse_datetime(data.get("PaymentDate")) or datetime.utcnow(),
            amount=data["Amount"],
            payment_method=data["PaymentMethod"],
            status=data.get("Status", "Completed"),
            create_id=data["CreateID"],
            update_date=parse_datetime(data.get("UpdateDate")),
        )
        db.session.add(payment)

        # Keep order status aligned with successful payment records.
        status = str(payment.status or "").strip().upper()
        if status in ("COMPLETED", "PAID", "SUCCESS"):
            order = Order.query.filter_by(order_id=payment.order_id).first()
            if order:
                order.status = "PAID"
                order.update_date = datetime.utcnow()

        db.session.commit()
        return self.ok(payment.to_dict(), 201)


class PaymentVNPayReturnView(ApiMethodView):
    def get(self):
        response_code = str(request.args.get("vnp_ResponseCode") or "")
        if response_code != "00":
            return self.fail("Thanh toán không thành công", 400)

        txn_ref = request.args.get("vnp_TxnRef") or request.args.get("order_code")
        order = None
        if txn_ref:
            conditions = [Order.order_code == str(txn_ref)]
            if str(txn_ref).isdigit():
                conditions.append(Order.order_id == int(txn_ref))
            order = Order.query.filter(or_(*conditions)).first()

        if not order:
            order = Order.query.order_by(Order.order_id.desc()).first()
        if not order:
            return self.fail("Không tìm thấy đơn hàng", 404)

        order.status = "PAID"
        order.update_date = datetime.utcnow()
        db.session.commit()

        return self.ok({"order_code": order.order_code})


class PaymentPayPalReturnView(ApiMethodView):
    def post(self):
        data = request.get_json(silent=True) or {}
        token = data.get("token") or data.get("Token")
        order = None

        if token:
            order = Order.query.filter_by(order_code=str(token)).first()

        if not order:
            order = Order.query.order_by(Order.order_id.desc()).first()
        if not order:
            return self.fail("Không tìm thấy đơn hàng", 404)

        order.status = "PAID"
        order.update_date = datetime.utcnow()
        db.session.commit()

        return self.ok({"order_code": order.order_code})


payments_bp.add_url_rule("/payments", view_func=PaymentListCreateView.as_view("payments_list_create"), methods=["GET", "POST"])
payments_bp.add_url_rule("/payments/vnpay/return", view_func=PaymentVNPayReturnView.as_view("payments_vnpay_return"), methods=["GET"])
payments_bp.add_url_rule("/payments/paypal/return", view_func=PaymentPayPalReturnView.as_view("payments_paypal_return"), methods=["POST"])
