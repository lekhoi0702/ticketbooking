from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.event import Event
from app.models.user import User
from app.models.order import Order
from app.models.payment import Payment
from app.models.venue import Venue
from app.models.event_category import EventCategory
from app.models.discount import Discount
from app.models.audit_log import AuditLog
from app.services.audit_service import AuditService
from sqlalchemy import func
from datetime import datetime, timedelta

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
        
        # Validate required fields (removed username)
        required = ['email', 'password', 'full_name', 'role']
        for field in required:
            if field not in data:
                return jsonify({'success': False, 'message': f'Thiếu trường: {field}'}), 400
        
        # Check if email exists
        if User.query.filter(User.email == data['email']).first():
            return jsonify({'success': False, 'message': 'Email đã tồn tại'}), 400
        
        # Map role string to role_id
        role_map = {'ADMIN': 1, 'ORGANIZER': 2, 'USER': 3}
        role_id = role_map.get(data['role'], 3)  # Default to USER if invalid
            
        new_user = User(
            email=data['email'],
            full_name=data['full_name'],
            role_id=role_id,
            is_active=True
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
        events = Event.query.order_by(Event.created_at.desc()).all()
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
            if new_status == 'APPROVED':
                 new_status = 'PUBLISHED'
            
            valid_statuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'PENDING_DELETION', 'DELETED']
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

@admin_bp.route("/admin/events/<int:event_id>", methods=["DELETE"])
def admin_delete_event(event_id):
    """Admin xóa sự kiện (đặc biệt là xử lý yêu cầu PENDING_DELETION)"""
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'success': False, 'message': 'Sự kiện không tồn tại'}), 404
            
        # Kiểm tra vé đã bán (giống organizer)
        if event.sold_tickets > 0:
            return jsonify({
                'success': False,
                'message': 'Không thể xóa sự kiện đã có vé được bán'
            }), 400
            
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã xóa sự kiện thành công'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/orders", methods=["GET"])
def get_all_orders():
    """Lấy danh sách toàn bộ đơn hàng toàn hệ thống - Optimized"""
    try:
        from app.models.ticket import Ticket
        from app.models.ticket_type import TicketType
        from sqlalchemy.orm import joinedload
        
        # Use eager loading to prevent N+1 queries
        orders = Order.query.options(
            joinedload(Order.payment)
        ).order_by(Order.created_at.desc()).limit(500).all()  # Limit to last 500 orders
        
        orders_data = []
        for order in orders:
            odata = order.to_dict()
            
            # Payment method from relationship
            odata['payment_method'] = order.payment.payment_method if order.payment else "N/A"
            
            # Get event name from first ticket (optimized single query)
            ticket = Ticket.query.filter_by(order_id=order.order_id).first()
            if ticket:
                tt = TicketType.query.get(ticket.ticket_type_id)
                if tt and tt.event:
                    odata['event_name'] = tt.event.event_name
                else:
                    odata['event_name'] = "N/A"
            else:
                odata['event_name'] = "N/A"
            
            orders_data.append(odata)
            
        return jsonify({
            'success': True,
            'data': orders_data
        }), 200
    except Exception as e:
        import traceback
        print(traceback.format_exc())
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

@admin_bp.route("/admin/venues/<int:venue_id>/status", methods=["PUT"])
def admin_update_venue_status(venue_id):
    """Cập nhật trạng thái địa điểm (ACTIVE, MAINTENANCE, INACTIVE)"""
    try:
        from sqlalchemy import text
        data = request.get_json()
        venue = Venue.query.get(venue_id)
        if not venue:
            return jsonify({'success': False, 'message': 'Không tìm thấy địa điểm'}), 404
            
        if 'status' in data:
            new_status = data['status']
            if new_status not in ['ACTIVE', 'MAINTENANCE', 'INACTIVE']:
                return jsonify({'success': False, 'message': 'Trạng thái không hợp lệ'}), 400
            
            # Check if trying to set status to MAINTENANCE
            if new_status == 'MAINTENANCE':
                # Check for published events using this venue
                published_event_check = text("""
                    SELECT COUNT(*) as event_count 
                    FROM Event 
                    WHERE venue_id = :venue_id AND status = 'PUBLISHED'
                """)
                event_result = db.session.execute(published_event_check, {"venue_id": venue_id})
                published_event_count = event_result.fetchone()[0]
                
                if published_event_count > 0:
                    return jsonify({
                        'success': False, 
                        'message': f'Không thể chuyển địa điểm sang chế độ bảo trì vì đã có {published_event_count} sự kiện đang được công bố (PUBLISHED) sử dụng địa điểm này. Vui lòng hủy công bố hoặc chuyển các sự kiện sang địa điểm khác trước.'
                    }), 400
            
            venue.status = new_status
            
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Đã cập nhật trạng thái địa điểm thành {venue.status}',
            'data': venue.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/orders/<int:order_id>/cancellation", methods=["POST"])
def process_order_cancellation(order_id):
    """Phê duyệt hoặc từ chối yêu cầu hủy đơn hàng"""
    try:
        from app.models.ticket import Ticket
        from app.models.ticket_type import TicketType
        from app.models.seat import Seat
        
        data = request.get_json()
        action = data.get('action') # 'approve' or 'reject'
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'message': 'Đơn hàng không tồn tại'}), 404
            
        if order.order_status != 'CANCELLATION_PENDING':
            return jsonify({'success': False, 'message': 'Đơn hàng không ở trạng thái chờ hủy'}), 400
            
        if action == 'approve':
            # 1. Cập nhật trạng thái các vé và giải phóng ghế
            tickets = Ticket.query.filter_by(order_id=order_id).all()
            for ticket in tickets:
                ticket.ticket_status = 'CANCELLED'
                
                # Release seat if exists
                if ticket.seat_id:
                    seat = Seat.query.get(ticket.seat_id)
                    if seat:
                        seat.status = 'AVAILABLE'
                
                # Update sold quantity
                ticket_type = TicketType.query.get(ticket.ticket_type_id)
                if ticket_type:
                    ticket_type.sold_quantity -= 1
                    
                    # Update event sold tickets
                    event = Event.query.get(ticket_type.event_id)
                    if event:
                        event.sold_tickets -= 1
            
            # 2. Cập nhật trạng thái đơn hàng
            order.order_status = 'REFUNDED'
            
            # 3. Cập nhật trạng thái thanh toán
            payment = Payment.query.filter_by(order_id=order_id).first()
            if payment:
                payment.payment_status = 'REFUNDED'
                
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Đã phê duyệt hủy đơn hàng và hoàn tiền thành công'
            }), 200
            
        elif action == 'reject':
            # Quay lại trạng thái PAID
            order.order_status = 'PAID'
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Đã từ chối yêu cầu hủy đơn hàng'
            }), 200
            
        else:
            return jsonify({'success': False, 'message': 'Hành động không hợp lệ'}), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/categories", methods=["POST"])
def admin_create_category():
    """Create a new event category"""
    try:
        data = request.get_json()
        if 'category_name' not in data:
            return jsonify({'success': False, 'message': 'Category name is required'}), 400
            
        # Check duplicate
        if EventCategory.query.filter_by(category_name=data['category_name']).first():
            return jsonify({'success': False, 'message': 'Category name already exists'}), 400
            
        category = EventCategory(
            category_name=data['category_name'],
            is_active=True
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Category created successfully',
            'data': category.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/categories/<int:category_id>", methods=["PUT"])
def admin_update_category(category_id):
    """Update an existing category"""
    try:
        data = request.get_json()
        category = EventCategory.query.get(category_id)
        if not category:
            return jsonify({'success': False, 'message': 'Category not found'}), 404
            
        if 'category_name' in data:
            # Check duplicate if name changed
            if data['category_name'] != category.category_name:
                if EventCategory.query.filter_by(category_name=data['category_name']).first():
                    return jsonify({'success': False, 'message': 'Category name already exists'}), 400
            category.category_name = data['category_name']
            
        if 'status' in data:
            category.is_active = (data['status'] == 'ACTIVE')
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Category updated successfully',
            'data': category.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/categories/<int:category_id>", methods=["DELETE"])
def admin_delete_category(category_id):
    """Delete a category"""
    try:
        category = EventCategory.query.get(category_id)
        if not category:
            return jsonify({'success': False, 'message': 'Category not found'}), 404
            
        # Check if events exist in this category
        if category.events:
            return jsonify({
                'success': False, 
                'message': 'Cannot delete category with existing events. Please reassign items first.'
            }), 400
            
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Category deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route("/admin/discounts", methods=["GET"])
def admin_get_all_discounts():
    """Lấy danh sách tất cả mã giảm giá (có thể lọc theo event_id)"""
    try:
        event_id = request.args.get('event_id', type=int)
        
        query = Discount.query
        if event_id:
            query = query.filter_by(event_id=event_id)
        
        discounts = query.order_by(Discount.created_at.desc()).all()
        
        result = []
        for d in discounts:
            item = {
                'discount_id': d.discount_id,
                'discount_code': d.discount_code,
                'discount_name': d.discount_name,
                'discount_type': d.discount_type,
                'discount_value': float(d.discount_value) if d.discount_value else 0,
                'max_discount_amount': float(d.max_discount_amount) if d.max_discount_amount else None,
                'min_order_amount': float(d.min_order_amount) if d.min_order_amount else 0,
                'usage_limit': d.usage_limit,
                'used_count': d.used_count or 0,
                'start_date': d.start_date.isoformat() if d.start_date else None,
                'end_date': d.end_date.isoformat() if d.end_date else None,
                'is_active': d.is_active,
                'created_at': d.created_at.isoformat() if d.created_at else None,
            }
            
            # Status logic
            if not d.is_active:
                item['status'] = 'INACTIVE'
            elif d.end_date and d.end_date < datetime.utcnow():
                item['status'] = 'EXPIRED'
            elif d.usage_limit and d.used_count >= d.usage_limit:
                item['status'] = 'USED_UP'
            else:
                item['status'] = 'ACTIVE'
            
            # Event info
            if d.event_id:
                ev = Event.query.get(d.event_id)
                item['event_id'] = d.event_id
                item['event_name'] = ev.event_name if ev else 'Sự kiện đã xóa'
            else:
                item['event_id'] = None
                item['event_name'] = 'Tất cả sự kiện'
            
            # Organizer info
            if d.manager_id:
                organizer = User.query.get(d.manager_id)
                item['organizer_name'] = organizer.full_name if organizer else 'N/A'
            else:
                item['organizer_name'] = 'Hệ thống'
            
            result.append(item)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route("/admin/events/<int:event_id>/discounts", methods=["GET"])
def admin_get_event_discounts(event_id):
    """Lấy danh sách mã giảm giá của một sự kiện cụ thể"""
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'success': False, 'message': 'Sự kiện không tồn tại'}), 404
        
        discounts = Discount.query.filter_by(event_id=event_id).order_by(Discount.created_at.desc()).all()
        
        result = []
        for d in discounts:
            item = {
                'discount_id': d.discount_id,
                'discount_code': d.discount_code,
                'discount_name': d.discount_name,
                'discount_type': d.discount_type,
                'discount_value': float(d.discount_value) if d.discount_value else 0,
                'max_discount_amount': float(d.max_discount_amount) if d.max_discount_amount else None,
                'min_order_amount': float(d.min_order_amount) if d.min_order_amount else 0,
                'usage_limit': d.usage_limit,
                'used_count': d.used_count or 0,
                'start_date': d.start_date.isoformat() if d.start_date else None,
                'end_date': d.end_date.isoformat() if d.end_date else None,
                'is_active': d.is_active,
            }
            
            # Status
            if not d.is_active:
                item['status'] = 'INACTIVE'
            elif d.end_date and d.end_date < datetime.utcnow():
                item['status'] = 'EXPIRED'
            elif d.usage_limit and d.used_count >= d.usage_limit:
                item['status'] = 'USED_UP'
            else:
                item['status'] = 'ACTIVE'
            
            result.append(item)
        
        return jsonify({
            'success': True,
            'data': result,
            'event': {
                'event_id': event.event_id,
                'event_name': event.event_name
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ============== AUDIT LOG ENDPOINTS ==============

@admin_bp.route("/admin/audit-logs", methods=["GET"])
def get_audit_logs():
    """
    Lấy danh sách audit logs với các filter
    Query params:
        - user_id: Filter theo user (changed_by)
        - action: Filter theo loại action (INSERT, UPDATE, DELETE)
        - table_name: Filter theo tên bảng (Event, Venue, Discount, etc.)
        - start_date: Lọc từ ngày (ISO format)
        - end_date: Lọc đến ngày (ISO format)
        - page: Trang hiện tại (default 1)
        - per_page: Số record mỗi trang (default 50)
    """
    try:
        # Get query params
        user_id = request.args.get('user_id', type=int)
        action = request.args.get('action')
        table_name = request.args.get('table_name') or request.args.get('entity_type')
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # Build query
        query = AuditLog.query
        
        if user_id:
            query = query.filter(AuditLog.changed_by == user_id)
        if action:
            query = query.filter(AuditLog.action == action)
        if table_name:
            query = query.filter(AuditLog.table_name == table_name)
        
        # Date filters
        if start_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str.replace('Z', ''))
                query = query.filter(AuditLog.changed_at >= start_date)
            except ValueError:
                pass
        
        if end_date_str:
            try:
                end_date = datetime.fromisoformat(end_date_str.replace('Z', ''))
                # Add 1 day to include the end date
                end_date = end_date + timedelta(days=1)
                query = query.filter(AuditLog.changed_at < end_date)
            except ValueError:
                pass
        
        # Order by newest first
        query = query.order_by(AuditLog.changed_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        logs_data = [log.to_dict() for log in pagination.items]
        
        return jsonify({
            'success': True,
            'data': logs_data,
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'page': page,
                'per_page': per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route("/admin/audit-logs/stats", methods=["GET"])
def get_audit_logs_stats():
    """Lấy thống kê tổng quan về audit logs"""
    try:
        # Count by action type
        action_counts = db.session.query(
            AuditLog.action,
            func.count(AuditLog.audit_id)
        ).group_by(AuditLog.action).all()
        
        # Count by table name
        table_counts = db.session.query(
            AuditLog.table_name,
            func.count(AuditLog.audit_id)
        ).group_by(AuditLog.table_name).all()
        
        # Recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_count = AuditLog.query.filter(AuditLog.changed_at >= week_ago).count()
        
        # Today's activity
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_count = AuditLog.query.filter(AuditLog.changed_at >= today_start).count()
        
        # Top active users (join with User table)
        top_users = db.session.query(
            AuditLog.changed_by,
            func.count(AuditLog.audit_id).label('action_count')
        ).filter(
            AuditLog.changed_at >= week_ago
        ).group_by(
            AuditLog.changed_by
        ).order_by(
            func.count(AuditLog.audit_id).desc()
        ).limit(10).all()
        
        # Get user info for top users
        top_users_data = []
        for user_id, action_count in top_users:
            if user_id:
                user = User.query.get(user_id)
                top_users_data.append({
                    'user_id': user_id,
                    'user_name': user.full_name if user else 'Unknown',
                    'user_email': user.email if user else 'Unknown',
                    'action_count': action_count
                })
        
        return jsonify({
            'success': True,
            'data': {
                'action_counts': {action: count for action, count in action_counts},
                'entity_counts': {table: count for table, count in table_counts},
                'recent_count': recent_count,
                'today_count': today_count,
                'top_users': top_users_data
            }
        }), 200
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route("/admin/audit-logs/user/<int:user_id>", methods=["GET"])
def get_user_audit_logs(user_id):
    """Lấy audit logs của một user cụ thể"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # Get user info
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Get logs
        pagination = AuditLog.query.filter_by(changed_by=user_id)\
            .order_by(AuditLog.changed_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'user': {
                'user_id': user.user_id,
                'email': user.email,
                'full_name': user.full_name
            },
            'data': [log.to_dict() for log in pagination.items],
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'page': page,
                'per_page': per_page
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route("/admin/audit-logs/entity/<string:table_name>/<int:record_id>", methods=["GET"])
def get_entity_audit_logs(table_name, record_id):
    """Lấy lịch sử thay đổi của một entity cụ thể"""
    try:
        logs = AuditLog.query.filter_by(
            table_name=table_name,
            record_id=record_id
        ).order_by(AuditLog.changed_at.desc()).all()
        
        return jsonify({
            'success': True,
            'table_name': table_name,
            'record_id': record_id,
            'data': [log.to_dict() for log in logs]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route("/admin/audit-logs/actions", methods=["GET"])
def get_audit_log_action_types():
    """Lấy danh sách các loại action để hiển thị trong filter dropdown"""
    try:
        actions = db.session.query(AuditLog.action).distinct().all()
        table_names = db.session.query(AuditLog.table_name).distinct().all()
        
        return jsonify({
            'success': True,
            'data': {
                'actions': [a[0] for a in actions if a[0]],
                'entity_types': [t[0] for t in table_names if t[0]]
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route("/admin/audit-logs/organizers", methods=["GET"])
def get_organizer_audit_logs():
    """
    Lấy audit logs của tất cả organizers
    Query params:
        - table_name: Filter theo tên bảng (Event, Venue, TicketType, etc.) - optional
        - action: Filter theo loại action (INSERT, UPDATE, DELETE) - optional
        - page: Trang hiện tại (default 1)
        - per_page: Số record mỗi trang (default 50)
    """
    # #region agent log
    import json
    try:
        with open(r'c:\Users\khoi.le\Desktop\ticketbooking\.cursor\debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({'location':'admin.py:841','message':'get_organizer_audit_logs entry','data':{'page':request.args.get('page',1,type=int),'per_page':request.args.get('per_page',50,type=int),'table_name':request.args.get('table_name')},'timestamp':int(__import__('time').time()*1000),'sessionId':'debug-session','runId':'run1','hypothesisId':'A'})+'\n')
    except: pass
    # #endregion
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        table_name = request.args.get('table_name')  # Optional filter by table name
        action = request.args.get('action')  # Optional filter by action
        
        # Get all organizer user IDs (role_id = 2)
        organizer_ids = [u.user_id for u in User.query.filter_by(role_id=2).all()]
        # #region agent log
        try:
            with open(r'c:\Users\khoi.le\Desktop\ticketbooking\.cursor\debug.log', 'a', encoding='utf-8') as f:
                f.write(json.dumps({'location':'admin.py:849','message':'Organizer IDs found','data':{'organizerCount':len(organizer_ids),'organizerIds':organizer_ids[:5],'table_name':table_name,'action':action},'timestamp':int(__import__('time').time()*1000),'sessionId':'debug-session','runId':'run1','hypothesisId':'B'})+'\n')
        except: pass
        # #endregion
        
        if not organizer_ids:
            # #region agent log
            try:
                with open(r'c:\Users\khoi.le\Desktop\ticketbooking\.cursor\debug.log', 'a', encoding='utf-8') as f:
                    f.write(json.dumps({'location':'admin.py:851','message':'No organizers found','data':{},'timestamp':int(__import__('time').time()*1000),'sessionId':'debug-session','runId':'run1','hypothesisId':'C'})+'\n')
            except: pass
            # #endregion
            return jsonify({
                'success': True,
                'data': [],
                'pagination': {'total': 0, 'pages': 0, 'page': page, 'per_page': per_page}
            }), 200
        
        # Build query with filters
        query = AuditLog.query.filter(
            AuditLog.changed_by.in_(organizer_ids)
        )
        
        # Add table_name filter if provided
        if table_name:
            query = query.filter(AuditLog.table_name == table_name)
        
        # Add action filter if provided
        if action:
            query = query.filter(AuditLog.action == action)
        
        # Get logs with pagination
        pagination = query.order_by(
            AuditLog.changed_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        # #region agent log
        try:
            logs_dicts = [log.to_dict() for log in pagination.items]
            with open(r'c:\Users\khoi.le\Desktop\ticketbooking\.cursor\debug.log', 'a', encoding='utf-8') as f:
                f.write(json.dumps({'location':'admin.py:863','message':'Before return','data':{'total':pagination.total,'itemsCount':len(pagination.items),'firstLogKeys':list(logs_dicts[0].keys()) if logs_dicts else None},'timestamp':int(__import__('time').time()*1000),'sessionId':'debug-session','runId':'run1','hypothesisId':'D'})+'\n')
        except: pass
        # #endregion
        
        return jsonify({
            'success': True,
            'data': [log.to_dict() for log in pagination.items],
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'page': page,
                'per_page': per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
    except Exception as e:
        # #region agent log
        try:
            import traceback
            with open(r'c:\Users\khoi.le\Desktop\ticketbooking\.cursor\debug.log', 'a', encoding='utf-8') as f:
                f.write(json.dumps({'location':'admin.py:876','message':'Exception caught','data':{'error':str(e),'traceback':traceback.format_exc()[:500]},'timestamp':int(__import__('time').time()*1000),'sessionId':'debug-session','runId':'run1','hypothesisId':'E'})+'\n')
        except: pass
        # #endregion
        import traceback
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500