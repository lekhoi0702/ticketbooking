from app.extensions import db


class Seat(db.Model):
    __tablename__ = "seat"

    seat_id = db.Column("SeatID", db.Integer, primary_key=True, autoincrement=True)
    venue_id = db.Column("VenueID", db.Integer, db.ForeignKey("venue.VenueID"), nullable=False)
    seat_number = db.Column("SeatNumber", db.String(20), nullable=False)
    row_number = db.Column("RowNumber", db.String(20), nullable=False)
    status = db.Column("Status", db.String(50), nullable=False, default="Available")
    area = db.Column("Area", db.String(100), nullable=True)
    x_position = db.Column("XPosition", db.Integer, nullable=True)
    y_position = db.Column("YPosition", db.Integer, nullable=True)
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    tickets = db.relationship("Ticket", backref="seat", lazy=True)

    def to_dict(self):
        return {
            "SeatID": self.seat_id,
            "VenueID": self.venue_id,
            "SeatNumber": self.seat_number,
            "RowNumber": self.row_number,
            "Status": self.status,
            "Area": self.area,
            "XPosition": self.x_position,
            "YPosition": self.y_position,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
