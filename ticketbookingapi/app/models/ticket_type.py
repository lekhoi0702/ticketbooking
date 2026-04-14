from app.extensions import db


class TicketType(db.Model):
    __tablename__ = "tickettype"

    ticket_type_id = db.Column("TicketTypeID", db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column("EventID", db.Integer, db.ForeignKey("event.EventID"), nullable=False)
    type_name = db.Column("TypeName", db.String(50), nullable=False)
    price = db.Column("Price", db.Numeric(18, 2), nullable=False)
    sale_start_date = db.Column("SaleStartDate", db.DateTime, nullable=True)
    sale_end_date = db.Column("SaleEndDate", db.DateTime, nullable=True)
    status = db.Column("Status", db.String(50), nullable=False, default="Active")
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    tickets = db.relationship("Ticket", backref="ticket_type", lazy=True)

    def to_dict(self):
        return {
            "TicketTypeID": self.ticket_type_id,
            "EventID": self.event_id,
            "TypeName": self.type_name,
            "Price": float(self.price) if self.price is not None else None,
            "SaleStartDate": self.sale_start_date.isoformat() if self.sale_start_date else None,
            "SaleEndDate": self.sale_end_date.isoformat() if self.sale_end_date else None,
            "Status": self.status,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
