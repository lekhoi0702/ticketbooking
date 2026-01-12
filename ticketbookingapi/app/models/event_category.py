from app.extensions import db
from datetime import datetime

class EventCategory(db.Model):
    __tablename__ = "EventCategory"

    category_id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    events = db.relationship('Event', backref='category', lazy=True)

    def to_dict(self):
        return {
            'category_id': self.category_id,
            'category_name': self.category_name,
            'is_active': self.is_active
        }
