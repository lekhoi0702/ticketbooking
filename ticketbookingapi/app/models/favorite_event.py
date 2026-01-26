from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class FavoriteEvent(db.Model):
    __tablename__ = "FavoriteEvent"

    user_id = db.Column(db.BigInteger, db.ForeignKey('User.user_id', ondelete='CASCADE'), primary_key=True)
    event_id = db.Column(db.BigInteger, db.ForeignKey('Event.event_id', ondelete='CASCADE'), primary_key=True)
    created_at = db.Column(db.DateTime, default=now_gmt7)

    # Relationships are handled via backrefs usually, or explicitly if needed
    user = db.relationship('User', backref=db.backref('favorites', lazy='dynamic', cascade='all, delete-orphan'))
    event = db.relationship('Event', backref=db.backref('favorited_by', lazy='dynamic', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'event_id': self.event_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
