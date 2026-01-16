from app.extensions import db
from datetime import datetime

class EventDeletionRequest(db.Model):
    __tablename__ = "EventDeletionRequest"
    
    request_id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('Event.event_id', ondelete='SET NULL'), nullable=True, index=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), nullable=False)
    reason = db.Column(db.Text)
    request_status = db.Column(db.Enum('PENDING', 'APPROVED', 'REJECTED'), default='PENDING', index=True)
    admin_note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('User.user_id'))
    
    # Relationships
    event = db.relationship('Event', backref='deletion_requests')
    organizer = db.relationship('User', foreign_keys=[organizer_id], backref='event_deletion_requests')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])
    
    def to_dict(self):
        return {
            'request_id': self.request_id,
            'event_id': self.event_id,
            'organizer_id': self.organizer_id,
            'reason': self.reason,
            'request_status': self.request_status,
            'admin_note': self.admin_note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by': self.reviewed_by
        }
