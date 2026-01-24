"""
Advertisement Model
Manages advertisement banners for display on the website
"""
from datetime import datetime
from app.extensions import db
from app.utils.datetime_utils import now_gmt7


class Advertisement(db.Model):
    """Advertisement model for managing ad banners"""
    
    __tablename__ = 'Advertisement'
    
    # Position constants
    POSITION_HOME_BETWEEN_SECTIONS = 'HOME_BETWEEN_SECTIONS'
    POSITION_EVENT_DETAIL_SIDEBAR = 'EVENT_DETAIL_SIDEBAR'
    POSITION_HOME_TOP = 'HOME_TOP'
    POSITION_HOME_BOTTOM = 'HOME_BOTTOM'
    
    ad_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False, comment='Advertisement title')
    image_url = db.Column(db.String(500), nullable=False, comment='Image URL')
    link_url = db.Column(db.String(500), nullable=True, comment='Click destination URL')
    position = db.Column(
        db.Enum(
            POSITION_HOME_BETWEEN_SECTIONS,
            POSITION_EVENT_DETAIL_SIDEBAR,
            POSITION_HOME_TOP,
            POSITION_HOME_BOTTOM,
            name='ad_position_enum'
        ),
        nullable=False,
        comment='Display position'
    )
    display_order = db.Column(db.Integer, default=0, comment='Display order (lower = higher priority)')
    is_active = db.Column(db.Boolean, default=True, comment='Active status')
    start_date = db.Column(db.DateTime, nullable=True, comment='Start display date')
    end_date = db.Column(db.DateTime, nullable=True, comment='End display date')
    click_count = db.Column(db.Integer, default=0, comment='Number of clicks')
    view_count = db.Column(db.Integer, default=0, comment='Number of views')
    created_by = db.Column(db.BigInteger, db.ForeignKey('User.user_id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=now_gmt7)
    updated_at = db.Column(db.DateTime, default=now_gmt7, onupdate=now_gmt7)
    
    # Relationships
    creator = db.relationship('User', foreign_keys=[created_by], backref='advertisements')
    
    def to_dict(self):
        """Convert advertisement to dictionary"""
        return {
            'ad_id': self.ad_id,
            'title': self.title,
            'image_url': self.image_url,
            'link_url': self.link_url,
            'position': self.position,
            'display_order': self.display_order,
            'is_active': self.is_active,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'click_count': self.click_count,
            'view_count': self.view_count,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def is_currently_active(self):
        """Check if advertisement is currently active based on dates"""
        if not self.is_active:
            return False
        
        now = now_gmt7()
        
        # Check start date
        if self.start_date and now < self.start_date:
            return False
        
        # Check end date
        if self.end_date and now > self.end_date:
            return False
        
        return True
    
    def increment_view_count(self):
        """Increment view count"""
        self.view_count += 1
        db.session.commit()
    
    def increment_click_count(self):
        """Increment click count"""
        self.click_count += 1
        db.session.commit()
    
    def __repr__(self):
        return f'<Advertisement {self.ad_id}: {self.title} ({self.position})>'
