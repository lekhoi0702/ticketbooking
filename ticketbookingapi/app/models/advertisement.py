"""
Advertisement Model

Aligned with current DB schema in `ticketbookingdb.sql`.
"""
from app.extensions import db


class Advertisement(db.Model):
    __tablename__ = 'Advertisement'

    # Position constants (match DB enum)
    POSITION_HOME_BETWEEN_SECTIONS = 'HOME_BETWEEN_SECTIONS'
    POSITION_EVENT_DETAIL_SIDEBAR = 'EVENT_DETAIL_SIDEBAR'
    POSITION_HOME_TOP = 'HOME_TOP'
    POSITION_HOME_BOTTOM = 'HOME_BOTTOM'

    ad_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    image = db.Column(db.String(1000), nullable=False)  # Image URL
    url = db.Column(db.String(1000), nullable=True)  # Click destination URL
    position = db.Column(
        db.Enum(
            POSITION_HOME_BETWEEN_SECTIONS,
            POSITION_EVENT_DETAIL_SIDEBAR,
            POSITION_HOME_TOP,
            POSITION_HOME_BOTTOM,
        ),
        nullable=False,
    )
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'ad_id': self.ad_id,
            'image': self.image,
            'url': self.url,
            'position': self.position,
            'display_order': self.display_order,
            'is_active': self.is_active,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
        }
