from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class Banner(db.Model):
    __tablename__ = "Banner"

    banner_id = db.Column(db.BigInteger, primary_key=True)
    image = db.Column(db.String(1000), nullable=False)
    title = db.Column(db.String(255), nullable=True)
    url = db.Column(db.String(1000), nullable=True)
    # In DB, is_active is nullable default NULL (tri-state). Keep nullable=True.
    is_active = db.Column(db.Boolean, default=None, nullable=True)
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'banner_id': self.banner_id,
            'image': self.image,
            'title': self.title,
            'url': self.url,
            'is_active': self.is_active,
            'display_order': self.display_order,
        }
