from app.extensions import db


class Role(db.Model):
    __tablename__ = "role"

    role_id = db.Column("RoleID", db.Integer, primary_key=True, autoincrement=True)
    role_name = db.Column("RoleName", db.String(50), nullable=False)
    create_id = db.Column("CreateID", db.Integer, nullable=True)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    users = db.relationship("User", backref="role", lazy=True)

    def to_dict(self):
        return {
            "RoleID": self.role_id,
            "RoleName": self.role_name,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }

