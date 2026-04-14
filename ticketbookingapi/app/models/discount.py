from app.extensions import db


class Discount(db.Model):
    __tablename__ = "discount"

    discount_id = db.Column("DiscountID", db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column("EventID", db.Integer, db.ForeignKey("event.EventID"), nullable=True)
    applies_all_events = db.Column("AppliesAllEvents", db.Boolean, nullable=False, default=False)
    code = db.Column("Code", db.String(50), nullable=False, unique=True)
    description = db.Column("Description", db.Text, nullable=True)
    discount_amount = db.Column("DiscountAmount", db.Numeric(18, 2), nullable=False)
    start_date = db.Column("StartDate", db.DateTime, nullable=False)
    end_date = db.Column("EndDate", db.DateTime, nullable=False)
    status = db.Column("Status", db.String(50), nullable=False, default="Active")
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "DiscountID": self.discount_id,
            "EventID": self.event_id,
            "AppliesAllEvents": bool(self.applies_all_events),
            "Code": self.code,
            "Description": self.description,
            "DiscountAmount": float(self.discount_amount) if self.discount_amount is not None else None,
            "StartDate": self.start_date.isoformat() if self.start_date else None,
            "EndDate": self.end_date.isoformat() if self.end_date else None,
            "Status": self.status,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
