from app.extensions import db


class EventCategory(db.Model):
    __tablename__ = "eventcategory"

    category_id = db.Column("CategoryID", db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column("CategoryName", db.String(50), nullable=False)
    status = db.Column("Status", db.String(50), nullable=False, default="Active")
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    events = db.relationship("Event", backref="category", lazy=True)

    def to_dict(self):
        return {
            "CategoryID": self.category_id,
            "CategoryName": self.category_name,
            "Status": self.status,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
