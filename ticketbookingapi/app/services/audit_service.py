from flask import request
from app.extensions import db
from app.models.audit_log import AuditLog


class AuditService:
    """Service để ghi và truy vấn audit log"""
    
    # Action types (phải khớp với ENUM trong database)
    ACTION_INSERT = 'INSERT'
    ACTION_UPDATE = 'UPDATE'
    ACTION_DELETE = 'DELETE'
    
    # Table names (để dễ sử dụng)
    TABLE_EVENT = 'Event'
    TABLE_VENUE = 'Venue'
    TABLE_DISCOUNT = 'Discount'
    TABLE_TICKET_TYPE = 'TicketType'
    TABLE_ORDER = 'Order'
    TABLE_TICKET = 'Ticket'
    TABLE_USER = 'User'
    TABLE_CATEGORY = 'EventCategory'
    TABLE_BANNER = 'Banner'
    TABLE_SEAT = 'Seat'
    TABLE_ORGANIZER_INFO = 'OrganizerInfo'
    
    @staticmethod
    def get_client_info():
        """Lấy thông tin client từ request"""
        try:
            ip_address = request.remote_addr
            # Xử lý proxy
            if request.headers.get('X-Forwarded-For'):
                ip_address = request.headers.get('X-Forwarded-For').split(',')[0].strip()
            user_agent = request.headers.get('User-Agent', '')
            return ip_address, user_agent
        except:
            return None, None
    
    @classmethod
    def log(cls, user_id, action, table_name, record_id, 
            old_values=None, new_values=None):
        """
        Ghi một audit log entry
        
        Args:
            user_id: ID của user thực hiện
            action: Loại hành động (INSERT, UPDATE, DELETE)
            table_name: Tên bảng bị ảnh hưởng
            record_id: ID của record
            old_values: Dict chứa giá trị cũ
            new_values: Dict chứa giá trị mới
        """
        try:
            ip_address, user_agent = cls.get_client_info()
            
            log = AuditLog.log_action(
                user_id=user_id,
                action=action,
                table_name=table_name,
                record_id=record_id,
                old_values=old_values,
                new_values=new_values,
                ip_address=ip_address,
                user_agent=user_agent
            )
            return log
        except Exception as e:
            print(f"Error logging audit: {e}")
            return None
    
    @classmethod
    def log_insert(cls, user_id, table_name, record_id, new_values=None):
        """Shortcut để log hành động INSERT"""
        return cls.log(
            user_id=user_id,
            action=cls.ACTION_INSERT,
            table_name=table_name,
            record_id=record_id,
            new_values=new_values
        )
    
    @classmethod
    def log_update(cls, user_id, table_name, record_id, old_values=None, new_values=None):
        """Shortcut để log hành động UPDATE"""
        return cls.log(
            user_id=user_id,
            action=cls.ACTION_UPDATE,
            table_name=table_name,
            record_id=record_id,
            old_values=old_values,
            new_values=new_values
        )
    
    @classmethod
    def log_delete(cls, user_id, table_name, record_id, old_values=None):
        """Shortcut để log hành động DELETE"""
        return cls.log(
            user_id=user_id,
            action=cls.ACTION_DELETE,
            table_name=table_name,
            record_id=record_id,
            old_values=old_values
        )
    
    @staticmethod
    def get_logs(user_id=None, action=None, table_name=None, 
                 start_date=None, end_date=None, page=1, per_page=50):
        """
        Truy vấn audit logs với các filter
        """
        query = AuditLog.query
        
        if user_id:
            query = query.filter(AuditLog.changed_by == user_id)
        if action:
            query = query.filter(AuditLog.action == action)
        if table_name:
            query = query.filter(AuditLog.table_name == table_name)
        if start_date:
            query = query.filter(AuditLog.changed_at >= start_date)
        if end_date:
            query = query.filter(AuditLog.changed_at <= end_date)
        
        # Order by newest first
        query = query.order_by(AuditLog.changed_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return pagination
    
    @staticmethod
    def get_user_activity(user_id, limit=100):
        """Lấy danh sách hoạt động của một user"""
        logs = AuditLog.query.filter_by(changed_by=user_id)\
            .order_by(AuditLog.changed_at.desc())\
            .limit(limit)\
            .all()
        return logs
    
    @staticmethod
    def get_entity_history(table_name, record_id):
        """Lấy lịch sử thay đổi của một entity"""
        logs = AuditLog.query.filter_by(
            table_name=table_name,
            record_id=record_id
        ).order_by(AuditLog.changed_at.desc()).all()
        return logs
