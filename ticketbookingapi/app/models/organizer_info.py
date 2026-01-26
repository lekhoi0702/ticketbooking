from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class OrganizerInfo(db.Model):
    __tablename__ = "OrganizerInfo"

    organizer_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('User.user_id'), unique=True, nullable=False)
    organization_name = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.String(1000), nullable=True)
    contact_phone = db.Column(db.String(30), nullable=True)
    # DB defaults are NULL; keep nullable and don't force python defaults.
    created_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, nullable=True)

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
