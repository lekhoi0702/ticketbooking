from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column("UserID", db.Integer, primary_key=True, autoincrement=True)
    password = db.Column("Password", db.String(255), nullable=False)
    role_id = db.Column("RoleID", db.Integer, db.ForeignKey("role.RoleID"), nullable=False)
    email = db.Column("Email", db.String(255), nullable=False)
    phone = db.Column("Phone", db.String(20), nullable=False)
    full_name = db.Column("FullName", db.String(255), nullable=False)
    status = db.Column("Status", db.String(50), nullable=False, default="Active")
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    orders = db.relationship("Order", backref="user", lazy=True)

    def to_dict(self):
        role_name = self.role.role_name if self.role is not None else None
        return {
            "UserID": self.user_id,
            "Password": self.password,
            "RoleID": self.role_id,
            "RoleName": role_name,
            "Email": self.email,
            "Phone": self.phone,
            "FullName": self.full_name,
            "Status": self.status,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
