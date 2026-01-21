from app.extensions import db
from datetime import datetime

class AuditLog(db.Model):
    """Model để lưu trữ audit log cho các hành động của organizer"""
    __tablename__ = "AuditLog"

    audit_id = db.Column(db.BigInteger, primary_key=True)
    table_name = db.Column(db.String(50), nullable=False, index=True)  # Audited table name (Event, Venue, etc.)
    record_id = db.Column(db.Integer, nullable=False)  # ID of affected record
    action = db.Column(db.Enum('INSERT', 'UPDATE', 'DELETE'), nullable=False, index=True)
    old_values = db.Column(db.JSON, nullable=True)  # Old values before change
    new_values = db.Column(db.JSON, nullable=True)  # New values after change
    changed_by = db.Column(db.Integer, nullable=True, index=True)  # User ID who made the change
    changed_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, index=True)
    ip_address = db.Column(db.String(45), nullable=True)  # IP address of requester
    user_agent = db.Column(db.Text, nullable=True)  # Browser user agent
    
    # Virtual relationship to get user info
    @property
    def user(self):
        if self.changed_by:
            from app.models.user import User
            return User.query.get(self.changed_by)
        return None

    def to_dict(self):
        user = self.user
        return {
            'audit_id': self.audit_id,
            'table_name': self.table_name,
            'record_id': self.record_id,
            'action': self.action,
            'old_values': self.old_values,
            'new_values': self.new_values,
            'changed_by': self.changed_by,
            'user_name': user.full_name if user else None,
            'user_email': user.email if user else None,
            'changed_at': self.changed_at.isoformat() if self.changed_at else None,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent
        }

    @classmethod
    def log_action(cls, user_id, action, table_name, record_id, 
                   old_values=None, new_values=None, ip_address=None, user_agent=None):
        """
        Helper method để tạo audit log entry
        
        Args:
            user_id: ID của user thực hiện hành động
            action: Loại hành động (INSERT, UPDATE, DELETE)
            table_name: Tên bảng bị ảnh hưởng (Event, Venue, Discount, etc.)
            record_id: ID của record bị ảnh hưởng
            old_values: Dict chứa giá trị cũ trước khi thay đổi
            new_values: Dict chứa giá trị mới sau khi thay đổi
            ip_address: IP của client
            user_agent: User agent string
        """
        log = cls(
            changed_by=user_id,
            action=action,
            table_name=table_name,
            record_id=record_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(log)
        return log
