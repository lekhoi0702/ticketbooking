from app.extensions import db

class Role(db.Model):
    __tablename__ = "Role"

    role_id = db.Column(db.BigInteger, primary_key=True)
    role_name = db.Column(db.String(50), nullable=False, unique=True)
