from app.extensions import db


class Banner(db.Model):
    __tablename__ = "banner"

    banner_id = db.Column("BannerID", db.Integer, primary_key=True, autoincrement=True)
    title = db.Column("Title", db.String(255), nullable=True)
    image_url = db.Column("ImageURL", db.String(500), nullable=False)
    display_order = db.Column("DisplayOrder", db.Integer, nullable=False, default=0)
    is_active = db.Column("IsActive", db.Boolean, nullable=False, default=True)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "BannerID": self.banner_id,
            "Title": self.title,
            "ImageURL": self.image_url,
            "DisplayOrder": self.display_order,
            "IsActive": self.is_active,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
