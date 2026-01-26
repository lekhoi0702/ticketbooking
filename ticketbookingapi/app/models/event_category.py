from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7


class EventCategory(db.Model):
    __tablename__ = "EventCategory"

    category_id = db.Column(db.BigInteger, primary_key=True)
    category_name = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, index=True, nullable=True)
    created_at = db.Column(db.DateTime, default=now_gmt7)
    created_by = db.Column(
        db.BigInteger,
        db.ForeignKey('User.user_id', ondelete='SET NULL'),
        nullable=True,
        index=True,
    )

    # Relationships
    events = db.relationship('Event', backref='category', lazy=True)
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_categories', lazy=True)

    def to_dict(self):
        d = {
            'category_id': self.category_id,
            'category_name': self.category_name,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'created_by': self.created_by,
        }
        if self.creator:
            d['created_by_name'] = self.creator.full_name
        else:
            d['created_by_name'] = None
        return d
