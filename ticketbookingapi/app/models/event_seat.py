from app.extensions import db


class EventSeat(db.Model):
    __tablename__ = "eventseat"

    event_seat_id = db.Column("EventSeatID", db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column("EventID", db.Integer, db.ForeignKey("event.EventID"), nullable=False)
    seat_id = db.Column("SeatID", db.Integer, db.ForeignKey("seat.SeatID"), nullable=False)
    status = db.Column("Status", db.String(50), nullable=False, default="AVAILABLE")
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    __table_args__ = (
        db.UniqueConstraint("EventID", "SeatID", name="uq_eventseat_event_seat"),
    )

    def to_dict(self):
        return {
            "EventSeatID": self.event_seat_id,
            "EventID": self.event_id,
            "SeatID": self.seat_id,
            "Status": self.status,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
