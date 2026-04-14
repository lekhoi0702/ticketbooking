from app.extensions import db


class Event(db.Model):
    __tablename__ = "event"

    event_id = db.Column("EventID", db.Integer, primary_key=True, autoincrement=True)
    event_name = db.Column("EventName", db.String(255), nullable=False)
    category_id = db.Column("CategoryID", db.Integer, db.ForeignKey("eventcategory.CategoryID"), nullable=False)
    venue_id = db.Column("VenueID", db.Integer, db.ForeignKey("venue.VenueID"), nullable=True)
    description = db.Column("Description", db.Text, nullable=True)
    start_date = db.Column("StartDate", db.DateTime, nullable=False)
    end_date = db.Column("EndDate", db.DateTime, nullable=False)
    status = db.Column("Status", db.String(50), nullable=False, default="Active")
    organizer_id = db.Column("OrganizerID", db.Integer, db.ForeignKey("organizer.OrganizerID"), nullable=False)
    featured_event = db.Column("FeaturedEvent", db.Boolean, nullable=False, default=False)
    image_url = db.Column("ImageURL", db.String(255), nullable=True)
    is_banner = db.Column("IsBanner", db.Boolean, nullable=False, default=False)
    is_featured_event = db.Column("IsFeaturedEvent", db.Boolean, nullable=False, default=False)
    is_favorite = db.Column("IsFavorite", db.Boolean, nullable=False, default=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    ticket_types = db.relationship("TicketType", backref="event", lazy=True)
    orders = db.relationship("Order", backref="event", lazy=True)
    venue = db.relationship("Venue", backref="events", lazy=True)

    def to_dict(self):
        return {
            "EventID": self.event_id,
            "EventName": self.event_name,
            "CategoryID": self.category_id,
            "VenueID": self.venue_id,
            "Description": self.description,
            "StartDate": self.start_date.isoformat() if self.start_date else None,
            "EndDate": self.end_date.isoformat() if self.end_date else None,
            "Status": self.status,
            "OrganizerID": self.organizer_id,
            "FeaturedEvent": self.featured_event,
            "ImageURL": self.image_url,
            "IsBanner": self.is_banner,
            "IsFeaturedEvent": self.is_featured_event,
            "IsFavorite": self.is_favorite,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
