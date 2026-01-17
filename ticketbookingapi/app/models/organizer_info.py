from app.extensions import db
from datetime import datetime

class OrganizerInfo(db.Model):
    __tablename__ = "OrganizerInfo"

    organizer_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), unique=True, nullable=False)
    organization_name = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.String(500), nullable=True)
    contact_phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship('User', backref=db.backref('organizer_info', uselist=False))

    def to_dict(self):
        return {
            'organizer_id': self.organizer_id,
            'user_id': self.user_id,
            'organization_name': self.organization_name,
            'description': self.description,
            'logo_url': self.logo_url,
            'contact_phone': self.contact_phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
