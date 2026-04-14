from app.extensions import db


class Organizer(db.Model):
    __tablename__ = "organizer"

    organizer_id = db.Column("OrganizerID", db.Integer, primary_key=True, autoincrement=True)
    organizer_name = db.Column("OrganizerName", db.String(255), nullable=False)
    description = db.Column("Description", db.Text, nullable=True)
    logo_url = db.Column("LogoURL", db.String(255), nullable=True)
    create_id = db.Column("CreateID", db.Integer, db.ForeignKey("users.UserID"), nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    events = db.relationship("Event", backref="organizer", lazy=True)

    def to_dict(self):
        return {
            "OrganizerID": self.organizer_id,
            "OrganizerName": self.organizer_name,
            "Description": self.description,
            "LogoURL": self.logo_url,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
