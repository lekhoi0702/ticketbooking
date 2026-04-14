from app.extensions import db


class EventQRCode(db.Model):
    __tablename__ = "eventqrcode"

    qrcode_id = db.Column("QRCodeID", db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column("EventID", db.Integer, db.ForeignKey("event.EventID"), nullable=False)
    qrcode_url = db.Column("QRCodeURL", db.String(255), nullable=False)
    create_id = db.Column("CreateID", db.Integer, nullable=False)
    create_date = db.Column("CreateDate", db.DateTime, nullable=False)
    update_date = db.Column("UpdateDate", db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "QRCodeID": self.qrcode_id,
            "EventID": self.event_id,
            "QRCodeURL": self.qrcode_url,
            "CreateID": self.create_id,
            "CreateDate": self.create_date.isoformat() if self.create_date else None,
            "UpdateDate": self.update_date.isoformat() if self.update_date else None,
        }
