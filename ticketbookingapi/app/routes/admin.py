from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.event import Event
from app.models.user import User
from app.models.order import Order
from app.models.payment import Payment
from app.models.venue import Venue
from sqlalchemy import func
from datetime import datetime

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin/stats", methods=["GET"])
def get_admin_stats():
    """Lấy số liệu thống kê tổng quan cho Admin"""
    try:
        total_users = User.query.count()
        total_events = Event.query.count()
        
        # Doanh thu tổng từ các đơn hàng đã thanh toán
        total_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.order_status == 'PAID'
        ).scalar() or 0
        
        # Tổng số vé đã bán thành công
        total_tickets_sold = db.session.query(func.sum(Event.sold_tickets)).scalar() or 0
        
        return jsonify({
            'success': True,
            'data': {
                'total_users': total_users,
                'total_events': total_events,
                'total_revenue': float(total_revenue),
                'total_tickets_sold': int(total_tickets_sold)
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/users", methods=["GET"])
def get_all_users():
    """Lấy danh sách toàn bộ người dùng"""
    try:
        users = User.query.all()
        return jsonify({
            'success': True,
            'data': [user.to_dict() for user in users]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/users/create", methods=["POST"])
def admin_create_user():
    """Admin tạo người dùng mới (đặc biệt là nhà tổ chức)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['username', 'email', 'password', 'full_name', 'role']
        for field in required:
            if field not in data:
                return jsonify({'success': False, 'message': f'Thiếu trường: {field}'}), 400
        
        # Check if user exists
        if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
            return jsonify({'success': False, 'message': 'Username hoặc Email đã tồn tại'}), 400
            
        new_user = User(
            username=data['username'],
            email=data['email'],
            full_name=data['full_name'],
            role=data['role'],
            status='ACTIVE'
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã tạo người dùng thành công',
            'data': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/users/<int:user_id>/status", methods=["PUT"])
def update_user_status(user_id):
    """Cập nhật trạng thái/vai trò người dùng (Ví dụ: Khóa tài khoản)"""
    try:
        data = request.get_json()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
            
        if 'status' in data:
            user.is_active = data['status'] == 'ACTIVE' # Use is_active based on model
        if 'role' in data:
            # Map role names back to IDs if needed, or update role_id
            role_map = {'ADMIN': 1, 'ORGANIZER': 2, 'USER': 3}
            if data['role'] in role_map:
                user.role_id = role_map[data['role']]
            
        db.session.commit()
        return jsonify({'success': True, 'message': 'Cập nhật thành công'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/users/<int:user_id>/reset-password", methods=["POST"])
def reset_user_password(user_id):
    """Reset mật khẩu người dùng về mặc định 123456"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'Không tìm thấy người dùng'}), 404
        
        user.set_password('123456')
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã reset mật khẩu thành công về 123456'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/events", methods=["GET"])
def get_all_events():
    """Lấy danh sách toàn bộ sự kiện với thông tin nhà tổ chức"""
    try:
        events = Event.query.all()
        events_data = []
        for event in events:
            edata = event.to_dict(include_details=True)
            # Lấy tên nhà tổ chức (User)
            organizer = User.query.get(event.manager_id)
            edata['organizer_name'] = organizer.full_name if organizer else "Hệ thống"
            events_data.append(edata)
            
        return jsonify({
            'success': True,
            'data': events_data
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/events/<int:event_id>/status", methods=["PUT"])
def update_event_status(event_id):
    """Phê duyệt, từ chối hoặc set Featured cho sự kiện"""
    try:
        data = request.get_json()
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'success': False, 'message': 'Sự kiện không tồn tại'}), 404
            
        if 'status' in data:
            new_status = data.get('status')
            valid_statuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED']
            if new_status not in valid_statuses:
                return jsonify({'success': False, 'message': 'Trạng thái không hợp lệ'}), 400
            event.status = new_status
            
        if 'is_featured' in data:
            event.is_featured = bool(data.get('is_featured'))
            
        # Lưu ý: Ở đây có thể thêm logic gửi thông báo cho Organizer nếu bị từ chối
        
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Cập nhật sự kiện thành công',
            'data': event.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/orders", methods=["GET"])
def get_all_orders():
    """Lấy danh sách toàn bộ đơn hàng toàn hệ thống"""
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        orders_data = []
        for order in orders:
            odata = order.to_dict()
            payment = Payment.query.filter_by(order_id=order.order_id).first()
            odata['payment_method'] = payment.payment_method if payment else "N/A"
            
            # Lấy tên sự kiện (thông qua vé đầu tiên)
            # Lưu ý: Một đơn hàng có thể có nhiều vé cùng sự kiện
            from app.models.ticket import Ticket
            from app.models.ticket_type import TicketType
            ticket = Ticket.query.filter_by(order_id=order.order_id).first()
            if ticket:
                tt = TicketType.query.get(ticket.ticket_type_id)
                if tt:
                    evt = Event.query.get(tt.event_id)
                    odata['event_name'] = evt.event_name if evt else "N/A"
            
            orders_data.append(odata)
            
        return jsonify({
            'success': True,
            'data': orders_data
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
@admin_bp.route("/admin/users/<int:user_id>/toggle-lock", methods=["POST"])
def toggle_user_lock(user_id):
    """Khóa hoặc mở khóa tài khoản người dùng"""
    try:
        data = request.get_json()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'Không tìm thấy người dùng'}), 404
        
        is_locked = data.get('is_locked', False)
        # is_active = not is_locked
        user.is_active = not is_locked
        db.session.commit()
        
        status_text = "khóa" if is_locked else "mở khóa"
        return jsonify({
            'success': True,
            'message': f'Đã {status_text} tài khoản thành công',
            'data': {'is_active': user.is_active}
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/venues", methods=["GET"])
def admin_get_venues():
    """Lấy danh sách địa điểm để quản lý"""
    try:
        venues = Venue.query.all()
        return jsonify({
            'success': True,
            'data': [v.to_dict() for v in venues]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/venues/<int:venue_id>/seats", methods=["PUT"])
def admin_update_venue_seats(venue_id):
    """Thiết lập số lượng ghế và sơ đồ cho các khu vực của địa điểm"""
    try:
        data = request.get_json()
        venue = Venue.query.get(venue_id)
        if not venue:
            return jsonify({'success': False, 'message': 'Không tìm thấy địa điểm'}), 404
            
        # Update seat map template if provided
        if 'seat_map_template' in data:
            venue.seat_map_template = data['seat_map_template']
            
        # Update capacity if provided
        if 'capacity' in data:
            venue.capacity = data['capacity']
        
        # Backward compatibility for fixed columns if needed based on template
        if venue.seat_map_template and 'areas' in venue.seat_map_template:
            # We can optionally sync the first few areas to the legacy columns
            # But normally we just rely on the JSON now.
            pass
            
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Đã cập nhật sơ đồ ghế ngồi thành công',
            'data': venue.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
