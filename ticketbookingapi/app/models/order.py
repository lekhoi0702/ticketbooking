from app.extensions import db


class Order(db.Model):
    __tablename__ = "orders"

    order_id = db.Column("OrderID", db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column("UserID", db.Integer, db.ForeignKey("users.UserID"), nullable=False)
    event_id = db.Column("EventID", db.Integer, db.ForeignKey("event.EventID"), nullable=False)
    order_date = db.Column("OrderDate", db.DateTime, nullable=False)
    total_amount = db.Column("TotalAmount", db.Numeric(18, 2), nullable=False)
    status = db.Column("Status", db.String(50), nullable=False, default="Pending")
    order_code = db.Column("OrderCode", db.String(20), nullable=False, unique=True)
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    payments = db.relationship("Payment", backref="order", lazy=True)
    tickets = db.relationship("Ticket", backref="order", lazy=True)

    def to_dict(self):
        return {
            "OrderID": self.order_id,
            "UserID": self.user_id,
            "EventID": self.event_id,
            "OrderDate": self.order_date.isoformat() if self.order_date else None,
            "TotalAmount": float(self.total_amount) if self.total_amount is not None else None,
            "Status": self.status,
            "OrderCode": self.order_code,
            "CreateID": self.create_id,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
