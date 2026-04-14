from app.extensions import db


class Venue(db.Model):
    __tablename__ = "venue"

    venue_id = db.Column("VenueID", db.Integer, primary_key=True, autoincrement=True)
    venue_name = db.Column("VenueName", db.String(255), nullable=False)
    address = db.Column("Address", db.String(255), nullable=False)
    city = db.Column("City", db.String(100), nullable=False)
    status = db.Column("Status", db.String(50), nullable=False, default="Active")
    capacity = db.Column("Capacity", db.Integer, nullable=False)
    seat_map = db.Column("SeatMap", db.JSON, nullable=True)
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    seats = db.relationship("Seat", backref="venue", lazy=True)

    def to_dict(self):
        return {
            "VenueID": self.venue_id,
            "VenueName": self.venue_name,
            "Address": self.address,
            "City": self.city,
            "Status": self.status,
            "Capacity": self.capacity,
            "SeatMap": self.seat_map,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
