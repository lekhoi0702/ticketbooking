from app.extensions import db


class TicketTypeSeat(db.Model):
    __tablename__ = "tickettypeseat"

    ticket_type_seat_id = db.Column("TicketTypeSeatID", db.Integer, primary_key=True, autoincrement=True)
    ticket_type_id = db.Column("TicketTypeID", db.Integer, db.ForeignKey("tickettype.TicketTypeID"), nullable=False)
    seat_id = db.Column("SeatID", db.Integer, db.ForeignKey("seat.SeatID"), nullable=False)
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "TicketTypeSeatID": self.ticket_type_seat_id,
            "TicketTypeID": self.ticket_type_id,
            "SeatID": self.seat_id,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
