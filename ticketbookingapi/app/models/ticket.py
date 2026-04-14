from app.extensions import db


class Ticket(db.Model):
    __tablename__ = "ticket"

    ticket_id = db.Column("TicketID", db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column("OrderID", db.Integer, db.ForeignKey("orders.OrderID"), nullable=False)
    seat_id = db.Column("SeatID", db.Integer, db.ForeignKey("seat.SeatID"), nullable=False)
    ticket_type_id = db.Column("TicketTypeID", db.Integer, db.ForeignKey("tickettype.TicketTypeID"), nullable=False)
    ticket_price = db.Column("TicketPrice", db.Numeric(18, 2), nullable=False)
    status = db.Column("Status", db.String(50), nullable=False, default="Active")
    ticket_qrcode = db.Column("TicketQRCode", db.String(255), nullable=False, unique=True)
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "TicketID": self.ticket_id,
            "OrderID": self.order_id,
            "SeatID": self.seat_id,
            "TicketTypeID": self.ticket_type_id,
            "TicketPrice": float(self.ticket_price) if self.ticket_price is not None else None,
            "Status": self.status,
            "TicketQRCode": self.ticket_qrcode,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
