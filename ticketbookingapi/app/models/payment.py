from app.extensions import db


class Payment(db.Model):
    __tablename__ = "payment"

    payment_id = db.Column("PaymentID", db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column("OrderID", db.Integer, db.ForeignKey("orders.OrderID"), nullable=False)
    payment_date = db.Column("PaymentDate", db.DateTime, nullable=False)
    amount = db.Column("Amount", db.Numeric(18, 2), nullable=False)
    payment_method = db.Column("PaymentMethod", db.String(50), nullable=False)
    status = db.Column("Status", db.String(50), nullable=False, default="Completed")
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "PaymentID": self.payment_id,
            "OrderID": self.order_id,
            "PaymentDate": self.payment_date.isoformat() if self.payment_date else None,
            "Amount": float(self.amount) if self.amount is not None else None,
            "PaymentMethod": self.payment_method,
            "Status": self.status,
            "CreateID": self.create_id,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
