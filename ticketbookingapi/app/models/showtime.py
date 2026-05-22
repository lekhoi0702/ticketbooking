from app.extensions import db


class Showtime(db.Model):
    __tablename__ = "showtime"

    showtime_id = db.Column("ShowtimeID", db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column("EventID", db.Integer, db.ForeignKey("event.EventID"), nullable=False)
    venue_id = db.Column("VenueID", db.Integer, db.ForeignKey("venue.VenueID"), nullable=True)
    start_datetime = db.Column("StartDateTime", db.DateTime, nullable=False)
    end_datetime = db.Column("EndDateTime", db.DateTime, nullable=False)
    status = db.Column("Status", db.String(20), nullable=False, default="ACTIVE")
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    venue = db.relationship("Venue", lazy=True)

    def to_dict(self):
        return {
            "ShowtimeID": self.showtime_id,
            "EventID": self.event_id,
            "VenueID": self.venue_id,
            "StartDateTime": self.start_datetime.isoformat() if self.start_datetime else None,
            "EndDateTime": self.end_datetime.isoformat() if self.end_datetime else None,
            "Status": self.status,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
