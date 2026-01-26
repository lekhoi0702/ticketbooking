from flask import Blueprint, jsonify, request, g
from app.extensions import db
from app.models.event import Event
from app.models.user import User
from app.models.order import Order
from app.models.payment import Payment
from app.models.venue import Venue
from app.models.event_category import EventCategory
from app.models.discount import Discount
from app.decorators.auth import optional_auth
from sqlalchemy import func
from datetime import datetime, timedelta
from app.utils.datetime_utils import now_gmt7

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
    """Reset mật khẩu người dùng - generate random password"""
    try:
        from app.utils.password_utils import generate_temporary_password
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'Không tìm thấy người dùng'}), 404
        
        # Generate secure random password
        new_password = generate_temporary_password()
        user.set_password(new_password)
        user.must_change_password = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã reset mật khẩu thành công',
            'data': {
                'new_password': new_password,
                'user_id': user_id,
                'email': user.email,
                'full_name': user.full_name
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/events", methods=["GET"])
def get_all_events():
    """Lấy danh sách sự kiện: cùng nhóm (nhiều ngày diễn) chỉ trả 1 record đại diện."""
    try:
        min_per_group = (
            db.session.query(Event.group_id, func.min(Event.event_id).label("min_id"))
            .filter(Event.group_id.isnot(None))
            .group_by(Event.group_id)
            .subquery()
        )
        base = (
            Event.query.outerjoin(min_per_group, Event.group_id == min_per_group.c.group_id)
            .filter(
                (Event.group_id.is_(None))
                | ((Event.group_id.isnot(None)) & (Event.event_id == min_per_group.c.min_id))
            )
            .order_by(Event.created_at.desc())
        )
        events = base.all()
        events_data = []
        for event in events:
            try:
                edata = event.to_dict(include_details=True)
                # Lấy tên nhà tổ chức (User)
                if event.manager_id:
                    organizer = User.query.get(event.manager_id)
                    edata['organizer_name'] = organizer.full_name if organizer else "Hệ thống"
                else:
                    edata['organizer_name'] = "Hệ thống"
                events_data.append(edata)
            except Exception as e:
                # Log error but continue processing other events
                print(f"Error processing event {event.event_id}: {str(e)}")
                continue
            
        return jsonify({
            'success': True,
            'data': events_data
        }), 200
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route("/admin/events/<int:event_id>/showtimes", methods=["GET"])
def get_event_showtimes(event_id):
    """Lấy tất cả các ngày diễn (showtimes) trong cùng nhóm với event_id"""
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'success': False, 'message': 'Sự kiện không tồn tại'}), 404
        
        if not event.group_id:
            edata = event.to_dict(include_details=True)
            if event.manager_id:
                organizer = User.query.get(event.manager_id)
                edata['organizer_name'] = organizer.full_name if organizer else "Hệ thống"
            else:
                edata['organizer_name'] = "Hệ thống"
            return jsonify({'success': True, 'data': [edata]}), 200
        
        showtimes = Event.query.filter(
            Event.group_id == event.group_id
        ).order_by(Event.start_datetime.asc()).all()
        
        showtimes_data = []
        for st in showtimes:
            try:
                st_data = st.to_dict(include_details=True)
                if st.manager_id:
                    organizer = User.query.get(st.manager_id)
                    st_data['organizer_name'] = organizer.full_name if organizer else "Hệ thống"
                else:
                    st_data['organizer_name'] = "Hệ thống"
                showtimes_data.append(st_data)
            except Exception as e:
                print(f"Error processing showtime {st.event_id}: {str(e)}")
                continue
        
        return jsonify({'success': True, 'data': showtimes_data}), 200
    except Exception as e:
        import traceback
        print(traceback.format_exc())
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
            valid_statuses = ['DRAFT', 'PENDING_APPROVAL', 'REJECTED', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'PENDING_DELETION', 'DELETED']
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
        from sqlalchemy.orm import selectinload
        
        orders = Order.query.options(
            joinedload(Order.payment),
            selectinload(Order.tickets).selectinload(Ticket.ticket_type).selectinload(TicketType.event)
        ).order_by(Order.created_at.desc()).limit(500).all()  # Limit to last 500 orders
        
        orders_data = []
        for order in orders:
            try:
                odata = order.to_dict()
                
                # Payment method from relationship
                odata['payment_method'] = order.payment.payment_method if order.payment else "N/A"
                
                # Get event name from first ticket (already loaded via eager loading)
                if order.tickets and len(order.tickets) > 0:
                    ticket = order.tickets[0]
                    if ticket and ticket.ticket_type and ticket.ticket_type.event:
                        odata['event_name'] = ticket.ticket_type.event.event_name
                    else:
                        odata['event_name'] = "N/A"
                else:
                    odata['event_name'] = "N/A"
                
                orders_data.append(odata)
            except Exception as e:
                # Log error but continue processing other orders
                print(f"Error processing order {order.order_id}: {str(e)}")
                continue
            
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
            
        if order.order_status != 'REFUND_PENDING':
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

@admin_bp.route("/admin/categories", methods=["GET"])
def admin_get_categories():
    """Get all event categories (admin: includes inactive, created_by, created_at)"""
    try:
        categories = EventCategory.query.order_by(EventCategory.category_id).all()
        return jsonify({
            'success': True,
            'data': [c.to_dict() for c in categories]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route("/admin/categories", methods=["POST"])
@optional_auth
def admin_create_category():
    """Create a new event category"""
    try:
        data = request.get_json()
        if 'category_name' not in data:
            return jsonify({'success': False, 'message': 'Category name is required'}), 400
            
        # Check duplicate
        if EventCategory.query.filter_by(category_name=data['category_name']).first():
            return jsonify({'success': False, 'message': 'Category name already exists'}), 400

        created_by = None
        if hasattr(g, 'current_user') and g.current_user:
            created_by = g.current_user.user_id
            
        category = EventCategory(
            category_name=data['category_name'],
            is_active=True,
            created_by=created_by,
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
        
        # Check if events exist in this category (including DELETED status)
        from app.models.event import Event
        from sqlalchemy import text
        
        # Check using raw SQL to be absolutely sure
        check_query = text("SELECT COUNT(*) as cnt FROM Event WHERE category_id = :cat_id")
        result = db.session.execute(check_query, {"cat_id": category_id})
        event_count = result.fetchone()[0]
        
        if event_count > 0:
            return jsonify({
                'success': False, 
                'message': f'Không thể xóa danh mục này vì đang có {event_count} sự kiện sử dụng. Vui lòng chuyển các sự kiện sang danh mục khác trước khi xóa.'
            }), 400
        
        # Try to delete
        try:
            db.session.delete(category)
            db.session.flush()  # Flush to catch any constraint errors early
            db.session.commit()
        except Exception as db_error:
            db.session.rollback()
            import traceback
            error_trace = traceback.format_exc()
            print(f"[ERROR] Database error deleting category {category_id}: {error_trace}")
            # Check if it's a foreign key constraint error
            error_msg = str(db_error).lower()
            if 'foreign key' in error_msg or 'constraint' in error_msg:
                return jsonify({
                    'success': False,
                    'message': 'Không thể xóa danh mục này do có ràng buộc dữ liệu. Vui lòng kiểm tra lại các sự kiện liên quan.'
                }), 400
            raise  # Re-raise if it's a different error
        
        return jsonify({
            'success': True,
            'message': 'Category deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"[ERROR] Failed to delete category {category_id}: {error_trace}")
        return jsonify({
            'success': False, 
            'message': f'Lỗi khi xóa danh mục: {str(e)}'
        }), 500


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
            elif d.end_date and d.end_date < now_gmt7():
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
            elif d.end_date and d.end_date < now_gmt7():
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

