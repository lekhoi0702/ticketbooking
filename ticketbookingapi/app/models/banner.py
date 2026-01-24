from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class Banner(db.Model):
    __tablename__ = "Banner"

    banner_id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(255), nullable=True)
    link = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=now_gmt7)

    def to_dict(self):
        return {
            'banner_id': self.banner_id,
            'image_url': self.image_url,
            'title': self.title,
            'link': self.link,
            'is_active': self.is_active,
            'order': self.order
        }
