from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.event import Event
from app.models.ticket_type import TicketType
from app.models.order import Order
from app.models.ticket import Ticket
from app.models.payment import Payment
from app.models.venue import Venue
from sqlalchemy import func, and_, or_
from datetime import datetime
import os
from werkzeug.utils import secure_filename
import json

organizer_bp = Blueprint("organizer", __name__)

# Configuration for file uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@organizer_bp.route("/organizer/dashboard", methods=["GET"])
def get_dashboard_stats():
    """Get dashboard statistics for organizer"""
    try:
        # For now, we'll use a default manager_id (you should implement authentication)
        manager_id = request.args.get('manager_id', 1, type=int)
        
        # Get events managed by this organizer
        events = Event.query.filter_by(manager_id=manager_id).all()
        event_ids = [e.event_id for e in events]
        
        # Calculate total revenue from orders (join through Ticket and TicketType)
        total_revenue = db.session.query(func.sum(Order.total_amount)).join(
            Ticket, Order.order_id == Ticket.order_id
        ).join(
            TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
        ).filter(
            TicketType.event_id.in_(event_ids),
            Order.order_status == 'PAID'
        ).scalar() or 0
        
        # Calculate total tickets sold
        total_tickets_sold = db.session.query(func.sum(Event.sold_tickets)).filter(
            Event.manager_id == manager_id
        ).scalar() or 0
        
        # Count ongoing events
        ongoing_events = Event.query.filter(
            Event.manager_id == manager_id,
            Event.status.in_(['PUBLISHED', 'ONGOING'])
        ).count()
        
        # Get recent orders (distinct to avoid multiple rows for same order due to multiple tickets)
        recent_orders = db.session.query(
            Order.order_id,
            Order.order_code,
            Order.total_amount,
            Order.order_status,
            Order.created_at,
            Event.event_name,
            Order.customer_name,
            Order.customer_email,
            Payment.payment_method
        ).join(
            Ticket, Order.order_id == Ticket.order_id
        ).join(
            TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
        ).join(
            Event, TicketType.event_id == Event.event_id
        ).outerjoin(
            Payment, Order.order_id == Payment.order_id
        ).filter(
            Event.manager_id == manager_id
        ).distinct().order_by(Order.created_at.desc()).limit(10).all()
        
        orders_list = []
        for order in recent_orders:
            orders_list.append({
                'order_id': order.order_id,
                'order_code': order.order_code,
                'event_name': order.event_name,
                'customer_name': order.customer_name,
                'customer_email': order.customer_email,
                'total_amount': float(order.total_amount),
                'status': order.order_status,
                'payment_method': order.payment_method,
                'created_at': order.created_at.isoformat() if order.created_at else None
            })
        
        return jsonify({
            'success': True,
            'data': {
                'total_revenue': float(total_revenue),
                'total_tickets_sold': int(total_tickets_sold),
                'ongoing_events': ongoing_events,
                'recent_orders': orders_list
            }
        }), 200
        
    except Exception as e:
        import traceback
        print(traceback.format_exc()) # Log it
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/events", methods=["GET"])
def get_organizer_events():
    """Get all events managed by organizer"""
    try:
        manager_id = request.args.get('manager_id', 1, type=int)
        status = request.args.get('status')
        
        query = Event.query.filter_by(manager_id=manager_id)
        
        if status:
            query = query.filter_by(status=status)
        
        events = query.order_by(Event.created_at.desc()).all()
        
        events_list = []
        for event in events:
            sold = event.sold_tickets or 0
            total = event.total_capacity or 0
            events_list.append({
                **event.to_dict(include_details=True),
                'tickets_sold_percentage': (sold / total * 100) if total > 0 else 0
            })
        
        return jsonify({
            'success': True,
            'data': events_list
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/events", methods=["POST"])
def create_event():
    """Create a new event"""
    try:
        data = request.form
        manager_id = data.get('manager_id', 1, type=int)
        
        # Handle file upload
        banner_image_url = None
        if 'banner_image' in request.files:
            file = request.files['banner_image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Add timestamp to filename to make it unique
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                
                # Ensure upload folder exists
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                banner_image_url = f"/uploads/{filename}"
        
        # Validate venue status
        venue_id = int(data.get('venue_id'))
        venue = Venue.query.get(venue_id)
        if not venue:
            return jsonify({'success': False, 'message': 'Không tìm thấy địa điểm'}), 404
        if venue.status != 'ACTIVE':
            return jsonify({'success': False, 'message': f'Địa điểm "{venue.venue_name}" đang trong quá trình bảo trì hoặc không sẵn sàng.'}), 400

        # Create new event
        new_event = Event(
            category_id=int(data.get('category_id')),
            venue_id=int(data.get('venue_id')),
            manager_id=manager_id,
            event_name=data.get('event_name'),
            description=data.get('description'),
            start_datetime=datetime.fromisoformat(data.get('start_datetime')),
            end_datetime=datetime.fromisoformat(data.get('end_datetime')),
            sale_start_datetime=datetime.fromisoformat(data.get('sale_start_datetime')) if data.get('sale_start_datetime') else None,
            sale_end_datetime=datetime.fromisoformat(data.get('sale_end_datetime')) if data.get('sale_end_datetime') else None,
            banner_image_url=banner_image_url,
            total_capacity=int(data.get('total_capacity', 0)),
            status='PENDING_APPROVAL',
            is_featured=data.get('is_featured', 'false').lower() == 'true'
        )
        
        db.session.add(new_event)
        db.session.flush()  # Get the event_id
        
        # Create ticket types if provided
        ticket_types_data = request.form.getlist('ticket_types')
        if ticket_types_data:
            import json
            for tt_json in ticket_types_data:
                tt_data = json.loads(tt_json)
                ticket_type = TicketType(
                    event_id=new_event.event_id,
                    type_name=tt_data.get('type_name'),
                    price=float(tt_data.get('price')),
                    quantity=int(tt_data.get('quantity')),
                    sold_quantity=0,
                    description=tt_data.get('description')
                )
                db.session.add(ticket_type)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Event created successfully',
            'data': new_event.to_dict(include_details=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/events/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    """Update an existing event"""
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({
                'success': False,
                'message': 'Event not found'
            }), 404
        
        data = request.form
        
        # Handle file upload
        if 'banner_image' in request.files:
            file = request.files['banner_image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                event.banner_image_url = f"/uploads/{filename}"
        
        # Update event fields
        if data.get('event_name'):
            event.event_name = data.get('event_name')
        if data.get('description'):
            event.description = data.get('description')
        if data.get('category_id'):
            event.category_id = int(data.get('category_id'))
        if data.get('venue_id'):
            event.venue_id = int(data.get('venue_id'))
        if data.get('start_datetime'):
            event.start_datetime = datetime.fromisoformat(data.get('start_datetime'))
        if data.get('end_datetime'):
            event.end_datetime = datetime.fromisoformat(data.get('end_datetime'))
        if data.get('sale_start_datetime'):
            event.sale_start_datetime = datetime.fromisoformat(data.get('sale_start_datetime'))
        if data.get('sale_end_datetime'):
            event.sale_end_datetime = datetime.fromisoformat(data.get('sale_end_datetime'))
        if data.get('total_capacity'):
            event.total_capacity = int(data.get('total_capacity'))
        if data.get('status'):
            new_status = data.get('status')
            if new_status == 'PUBLISHED' and event.status != 'APPROVED':
                return jsonify({'success': False, 'message': 'Sự kiện cần được Admin phê duyệt trước khi đăng'}), 400
            event.status = new_status

        if 'is_featured' in data:
            event.is_featured = data.get('is_featured', 'false').lower() == 'true'

        # Handle Ticket Types if provided
        ticket_types_data = request.form.getlist('ticket_types')
        if ticket_types_data:
            for tt_json in ticket_types_data:
                tt_data = json.loads(tt_json)
                tt_id = tt_data.get('ticket_type_id')
                
                if tt_id:
                    # Update existing ticket type
                    tt = TicketType.query.get(tt_id)
                    if tt and tt.event_id == event_id:
                        if 'type_name' in tt_data:
                            tt.type_name = tt_data.get('type_name')
                        if 'price' in tt_data:
                            tt.price = float(tt_data.get('price'))
                        if 'description' in tt_data:
                            tt.description = tt_data.get('description')
                else:
                    # Create new ticket type
                    new_tt = TicketType(
                        event_id=event_id,
                        type_name=tt_data.get('type_name'),
                        price=float(tt_data.get('price', 0)),
                        quantity=int(tt_data.get('quantity', 0)),
                        description=tt_data.get('description', '')
                    )
                    db.session.add(new_tt)

        event.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Event updated successfully',
            'data': event.to_dict(include_details=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    """Request event deletion - all deletions require admin approval"""
    try:
        from app.models.event_deletion_request import EventDeletionRequest
        
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({
                'success': False,
                'message': 'Event not found'
            }), 404
        
        # Get request data
        data = request.get_json() or {}
        reason = data.get('reason', '')
        manager_id = data.get('manager_id', 1)
        
        # Check if event is still PUBLISHED
        if event.status == 'PUBLISHED':
            return jsonify({
                'success': False,
                'message': 'Không thể xóa sự kiện đang công khai. Vui lòng chuyển sự kiện về trạng thái "Bản nháp" trước khi xóa.',
                'action_required': 'UNPUBLISH'
            }), 400
        
        # Check if deletion request already exists
        existing_request = EventDeletionRequest.query.filter_by(
            event_id=event_id,
            request_status='PENDING'
        ).first()
        
        if existing_request:
            return jsonify({
                'success': False,
                'message': 'Đã có yêu cầu xóa sự kiện này đang chờ phê duyệt từ Admin.'
            }), 400
        
        # Count active orders (if any)
        active_orders = db.session.query(Order).join(
            Ticket, Order.order_id == Ticket.order_id
        ).join(
            TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
        ).filter(
            TicketType.event_id == event_id,
            Order.order_status.in_(['PAID', 'PENDING', 'CANCELLATION_PENDING'])
        ).count()
        
        # ALL deletions require admin approval
        deletion_request = EventDeletionRequest(
            event_id=event_id,
            organizer_id=manager_id,
            reason=reason,
            request_status='PENDING'
        )
        
        db.session.add(deletion_request)
        db.session.commit()
        
        message_text = f'Yêu cầu xóa sự kiện đã được gửi đến Admin để phê duyệt.'
        if active_orders > 0:
            message_text = f'Sự kiện có {active_orders} đơn hàng chưa hủy. ' + message_text
        
        return jsonify({
            'success': True,
            'requires_approval': True,
            'message': message_text,
            'data': {
                'request_id': deletion_request.request_id,
                'active_orders': active_orders
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/events/<int:event_id>/ticket-types", methods=["GET"])
def get_event_ticket_types(event_id):
    """Get ticket types for an event"""
    try:
        ticket_types = TicketType.query.filter_by(event_id=event_id).all()
        
        return jsonify({
            'success': True,
            'data': [tt.to_dict() for tt in ticket_types]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/events/<int:event_id>/ticket-types", methods=["POST"])
def create_ticket_type(event_id):
    """Create a new ticket type for an event"""
    try:
        data = request.get_json()
        
        ticket_type = TicketType(
            event_id=event_id,
            type_name=data.get('type_name'),
            price=float(data.get('price')),
            quantity=int(data.get('quantity')),
            sold_quantity=0,
            description=data.get('description')
        )
        
        db.session.add(ticket_type)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ticket type created successfully',
            'data': ticket_type.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/ticket-types/<int:ticket_type_id>", methods=["PUT"])
def update_ticket_type(ticket_type_id):
    """Update a ticket type"""
    try:
        ticket_type = TicketType.query.get(ticket_type_id)
        
        if not ticket_type:
            return jsonify({
                'success': False,
                'message': 'Ticket type not found'
            }), 404
        
        data = request.get_json()
        
        if data.get('type_name'):
            ticket_type.type_name = data.get('type_name')
        if data.get('price') is not None:
            ticket_type.price = float(data.get('price'))
        if data.get('quantity') is not None:
            ticket_type.quantity = int(data.get('quantity'))
        if data.get('description') is not None:
            ticket_type.description = data.get('description')
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ticket type updated successfully',
            'data': ticket_type.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/ticket-types/<int:ticket_type_id>", methods=["DELETE"])
def delete_ticket_type(ticket_type_id):
    """Delete a ticket type"""
    try:
        ticket_type = TicketType.query.get(ticket_type_id)
        
        if not ticket_type:
            return jsonify({
                'success': False,
                'message': 'Ticket type not found'
            }), 404
        
        # Check if any tickets have been sold
        if ticket_type.sold_quantity > 0:
            return jsonify({
                'success': False,
                'message': 'Cannot delete ticket type with sold tickets'
            }), 400
        
        db.session.delete(ticket_type)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ticket type deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/events/<int:event_id>/orders", methods=["GET"])
def get_event_orders(event_id):
    """Get all orders for a specific event"""
    try:
        # Verify event exists and belongs to organizer
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'success': False, 'message': 'Event not found'}), 404
        
        # Get all orders for this event through tickets
        orders = db.session.query(Order).join(
            Ticket, Order.order_id == Ticket.order_id
        ).join(
            TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
        ).filter(
            TicketType.event_id == event_id
        ).distinct().all()
        
        # Format orders with additional info
        orders_data = []
        for order in orders:
            # Get tickets for this order in this event
            tickets = db.session.query(Ticket).join(
                TicketType
            ).filter(
                Ticket.order_id == order.order_id,
                TicketType.event_id == event_id
            ).all()
            
            order_dict = order.to_dict()
            order_dict['tickets_count'] = len(tickets)
            order_dict['tickets'] = [t.to_dict() for t in tickets]
            orders_data.append(order_dict)
        
        return jsonify({
            'success': True,
            'data': orders_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/orders/<int:order_id>/refund/approve", methods=["POST"])
def approve_refund(order_id):
    """Approve refund request, cancel order and DELETE tickets"""
    try:
        from app.models.seat import Seat
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'message': 'Order not found'}), 404
        
        # Verify order is in cancellation pending status
        if order.order_status != 'CANCELLATION_PENDING':
            return jsonify({
                'success': False,
                'message': 'Order is not pending cancellation'
            }), 400
        
        # Get all tickets for this order
        tickets = Ticket.query.filter_by(order_id=order_id).all()
        
        # Update order status
        order.order_status = 'CANCELLED'
        
        # DELETE all tickets and release seats
        for ticket in tickets:
            # Release seat if exists
            if ticket.seat_id:
                seat = Seat.query.get(ticket.seat_id)
                if seat:
                    seat.status = 'AVAILABLE'
            
            # Update ticket type sold quantity
            ticket_type = TicketType.query.get(ticket.ticket_type_id)
            if ticket_type:
                ticket_type.sold_quantity = max(0, ticket_type.sold_quantity - 1)
                
                # Update event sold tickets count
                if ticket_type.event:
                    ticket_type.event.sold_tickets = max(0, ticket_type.event.sold_tickets - 1)
            
            # DELETE the ticket
            db.session.delete(ticket)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Refund approved successfully. Tickets have been deleted.'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/orders/<int:order_id>/refund/reject", methods=["POST"])
def reject_refund(order_id):
    """Reject refund request and restore order to PAID status"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'message': 'Order not found'}), 404
        
        # Verify order is in cancellation pending status
        if order.order_status != 'CANCELLATION_PENDING':
            return jsonify({
                'success': False,
                'message': 'Order is not pending cancellation'
            }), 400
        
        # Restore order status to PAID
        order.order_status = 'PAID'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Refund request rejected'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@organizer_bp.route("/organizer/venues", methods=["GET"])
def get_organizer_venues():
    """Get all venues managed by organizer"""
    try:
        manager_id = request.args.get('manager_id', 1, type=int)
        
        venues = Venue.query.filter_by(manager_id=manager_id).all()
        
        return jsonify({
            'success': True,
            'data': [v.to_dict() for v in venues]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/venues", methods=["POST"])
def create_organizer_venue():
    """Create a new venue"""
    try:
        data = request.get_json()
        manager_id = data.get('manager_id', 1)
        
        new_venue = Venue(
            venue_name=data.get('venue_name'),
            address=data.get('address'),
            city=data.get('city'),
            capacity=int(data.get('capacity', 0)),
            manager_id=manager_id,
            vip_seats=int(data.get('vip_seats', 0)),
            standard_seats=int(data.get('standard_seats', 0)),
            economy_seats=int(data.get('economy_seats', 0)),
            contact_phone=data.get('contact_phone'),
            seat_map_template=data.get('seat_map_template'),
            status='ACTIVE'
        )
        
        db.session.add(new_venue)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Venue created successfully',
            'data': new_venue.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_bp.route("/organizer/venues/<int:venue_id>", methods=["GET"])
def get_organizer_venue(venue_id):
    """Get a single venue"""
    try:
        venue = Venue.query.get(venue_id)
        if not venue:
            return jsonify({'success': False, 'message': 'Venue not found'}), 404
            
        return jsonify({
            'success': True,
            'data': venue.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/venues/<int:venue_id>", methods=["PUT"])
def update_organizer_venue(venue_id):
    """Update venue details"""
    try:
        venue = Venue.query.get(venue_id)
        if not venue:
            return jsonify({'success': False, 'message': 'Venue not found'}), 404
        
        data = request.get_json()
        
        if 'venue_name' in data: venue.venue_name = data['venue_name']
        if 'address' in data: venue.address = data['address']
        if 'city' in data: venue.city = data['city']
        if 'contact_phone' in data: venue.contact_phone = data['contact_phone']
        if 'capacity' in data: venue.capacity = int(data['capacity'])
        if 'vip_seats' in data: venue.vip_seats = int(data['vip_seats'])
        if 'standard_seats' in data: venue.standard_seats = int(data['standard_seats'])
        if 'economy_seats' in data: venue.economy_seats = int(data['economy_seats'])
        if 'status' in data: venue.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Venue updated successfully',
            'data': venue.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/venues/<int:venue_id>/seats", methods=["PUT"])
def update_venue_seats(venue_id):
    """Update seat map for venue"""
    try:
        venue = Venue.query.get(venue_id)
        if not venue:
            return jsonify({'success': False, 'message': 'Venue not found'}), 404
            
        data = request.get_json()
        
        if 'seat_map_template' in data:
            venue.seat_map_template = data['seat_map_template']
            
        if 'capacity' in data:
            venue.capacity = data['capacity']
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Seat map updated successfully',
            'data': venue.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/tickets/search", methods=["GET"])
def search_tickets():
    """Search tickets by code, customer email, event, or status"""
    try:
        manager_id = request.args.get('manager_id', 1, type=int)
        query_text = request.args.get('q', '')
        event_id = request.args.get('event_id', type=int)
        status = request.args.get('status')
        
        # Get events managed by this organizer
        organizer_events = Event.query.filter_by(manager_id=manager_id).all()
        org_event_ids = [e.event_id for e in organizer_events]
        
        # Start building the query
        query = db.session.query(Ticket).join(
            TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
        )
        
        # Filter by organizer's events
        if event_id:
            # If specific event requested, ensure it belongs to organizer
            if event_id not in org_event_ids:
                return jsonify({'success': True, 'data': []}), 200
            query = query.filter(TicketType.event_id == event_id)
        else:
            # Otherwise search all organizer's events
            query = query.filter(TicketType.event_id.in_(org_event_ids))
            
        # Filter by status if provided
        if status and status != 'ALL':
            query = query.filter(Ticket.ticket_status == status)
            
        # Filter by search text if provided
        if query_text:
            query = query.filter(
                or_(
                    Ticket.ticket_code.like(f'%{query_text}%'),
                    Ticket.holder_email.like(f'%{query_text}%'),
                    Ticket.holder_name.like(f'%{query_text}%')
                )
            )
            
        tickets = query.all()
        
        results = []
        for ticket in tickets:
            tt = TicketType.query.get(ticket.ticket_type_id)
            evt = Event.query.get(tt.event_id)
            t_data = ticket.to_dict()
            t_data['event_name'] = evt.event_name
            t_data['ticket_type_name'] = tt.type_name
            results.append(t_data)
            
        return jsonify({
            'success': True,
            'data': results
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/tickets/check-in", methods=["POST"])
def check_in_ticket():
    """Check in a ticket"""
    try:
        data = request.get_json()
        ticket_code = data.get('ticket_code')
        manager_id = data.get('manager_id', 1)
        
        ticket = Ticket.query.filter_by(ticket_code=ticket_code).first()
        
        if not ticket:
            return jsonify({'success': False, 'message': 'Ticket not found'}), 404
            
        # Verify ownership
        tt = TicketType.query.get(ticket.ticket_type_id)
        evt = Event.query.get(tt.event_id)
        
        if evt.manager_id != manager_id:
             return jsonify({'success': False, 'message': 'Unauthorized access to this ticket'}), 403
             
        if ticket.ticket_status == 'USED':
             return jsonify({
                 'success': False, 
                 'message': 'Vé đã được sử dụng trước đó',
                 'checked_in_at': ticket.checked_in_at
             }), 400
             
        if ticket.ticket_status != 'ACTIVE':
             return jsonify({'success': False, 'message': f'Vé không hợp lệ (Trạng thái: {ticket.ticket_status})'}), 400
             
        # Perform check-in
        ticket.ticket_status = 'USED'
        ticket.checked_in_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Check-in thành công',
            'data': {
                'ticket_code': ticket.ticket_code,
                'holder_name': ticket.holder_name,
                'event_name': evt.event_name,
                'checked_in_at': ticket.checked_in_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/stats", methods=["GET"])
def get_organizer_stats():
    """Get dashboard statistics for organizer"""
    try:
        manager_id = request.args.get('manager_id', 1, type=int)

        # Revenue (Sum of price of sold tickets)
        total_revenue = db.session.query(func.sum(Ticket.price))\
            .join(TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id)\
            .join(Event, TicketType.event_id == Event.event_id)\
            .filter(Event.manager_id == manager_id)\
            .filter(Ticket.ticket_status.in_(['ACTIVE', 'USED']))\
            .scalar() or 0
            
        # Sold Tickets
        total_tickets_sold = db.session.query(func.count(Ticket.ticket_id))\
            .join(TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id)\
            .join(Event, TicketType.event_id == Event.event_id)\
            .filter(Event.manager_id == manager_id)\
            .filter(Ticket.ticket_status.in_(['ACTIVE', 'USED']))\
            .scalar() or 0
            
        # Refunded/Cancelled Tickets
        refunded_tickets = db.session.query(func.count(Ticket.ticket_id))\
            .join(TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id)\
            .join(Event, TicketType.event_id == Event.event_id)\
            .filter(Event.manager_id == manager_id)\
            .filter(Ticket.ticket_status.in_(['REFUNDED', 'CANCELLED']))\
            .scalar() or 0
            
        # Total Events
        total_events = Event.query.filter_by(manager_id=manager_id).count()

        # Best Selling Events (by calculated active tickets)
        best_selling_query = db.session.query(
            Event,
            func.count(Ticket.ticket_id).label('sold_count')
        ).join(TicketType, Event.event_id == TicketType.event_id)\
         .join(Ticket, TicketType.ticket_type_id == Ticket.ticket_type_id)\
         .filter(Event.manager_id == manager_id)\
         .filter(Ticket.ticket_status.in_(['ACTIVE', 'USED']))\
         .group_by(Event.event_id)\
         .order_by(func.count(Ticket.ticket_id).desc())\
         .limit(5).all()
        
        best_selling_data = [{
            'event_id': e.event_id,
            'event_name': e.event_name,
            'sold_tickets': count,
            'total_capacity': e.total_capacity,
            'fill_rate': round((count / e.total_capacity * 100), 1) if e.total_capacity > 0 else 0
        } for e, count in best_selling_query]

        # Highest Revenue Events
        revenue_query = db.session.query(
            Event.event_id, 
            Event.event_name, 
            func.sum(Ticket.price).label('revenue')
        ).join(TicketType, Event.event_id == TicketType.event_id)\
         .join(Ticket, TicketType.ticket_type_id == Ticket.ticket_type_id)\
         .filter(Event.manager_id == manager_id)\
         .filter(Ticket.ticket_status.in_(['ACTIVE', 'USED']))\
         .group_by(Event.event_id, Event.event_name)\
         .order_by(func.sum(Ticket.price).desc())\
         .limit(5).all()

        revenue_data = [{
            'event_id': r.event_id,
            'event_name': r.event_name,
            'revenue': float(r.revenue or 0)
        } for r in revenue_query]
        
        return jsonify({
            'success': True,
            'data': {
                'total_revenue': float(total_revenue),
                'total_tickets_sold': total_tickets_sold,
                'refunded_tickets': refunded_tickets,
                'total_events': total_events,
                'best_selling_events': best_selling_data,
                'revenue_events': revenue_data
            }
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/orders", methods=["GET"])
def get_organizer_orders():
    """Get list of orders containing tickets for organizer's events"""
    try:
        manager_id = request.args.get('manager_id', type=int)
        search = request.args.get('search', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('limit', 10, type=int)

        if not manager_id:
            return jsonify({'success': False, 'message': 'Missing manager_id'}), 400

        # Query Orders that have at least one ticket from this manager
        query = db.session.query(Order).join(Ticket).join(TicketType).join(Event)
        
        query = query.filter(Event.manager_id == manager_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(or_(
                Order.order_code.ilike(search_term),
                Order.customer_name.ilike(search_term),
                Order.customer_email.ilike(search_term),
                Order.customer_phone.ilike(search_term)
            ))
            
        # Group by Order to ensure uniqueness
        query = query.group_by(Order.order_id).order_by(Order.created_at.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        orders_data = []
        for order in pagination.items:
            # Filter tickets belonging to this manager
            relevant_tickets = [
                t for t in order.tickets 
                if t.ticket_type and t.ticket_type.event and t.ticket_type.event.manager_id == manager_id
            ]
            
            if not relevant_tickets: 
                continue

            org_revenue = sum(t.price for t in relevant_tickets)
            
            orders_data.append({
                'order_id': order.order_id,
                'order_code': order.order_code,
                'customer_name': order.customer_name or "Unknown",
                'customer_email': order.customer_email or "N/A",
                'customer_phone': order.customer_phone,
                'created_at': order.created_at.isoformat(),
                'status': order.order_status,
                'revenue': float(org_revenue),
                'ticket_count': len(relevant_tickets),
                'tickets': [{
                    'ticket_id': t.ticket_id,
                    'code': t.ticket_code,
                    'event': t.ticket_type.event.event_name,
                    'type': t.ticket_type.type_name,
                    'price': float(t.price),
                    'status': 'EXPIRED' if t.ticket_status == 'ACTIVE' and t.ticket_type.event.end_datetime < datetime.utcnow() else t.ticket_status
                } for t in relevant_tickets]
            })
            
        return jsonify({
            'success': True,
            'data': orders_data,
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'page': page,
                'limit': per_page
            }
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/profile/<int:user_id>", methods=["GET"])
def get_organizer_profile(user_id):
    """Get organizer profile information"""
    try:
        from app.models.organizer_info import OrganizerInfo
        from app.models.user import User
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        organizer_info = OrganizerInfo.query.filter_by(user_id=user_id).first()
        
        if not organizer_info:
            # Create default organizer info if doesn't exist
            organizer_info = OrganizerInfo(
                user_id=user_id,
                organization_name=user.full_name
            )
            db.session.add(organizer_info)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                **organizer_info.to_dict(),
                'user_email': user.email,
                'user_full_name': user.full_name
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/profile/<int:user_id>", methods=["PUT"])
def update_organizer_profile(user_id):
    """Update organizer profile information"""
    try:
        from app.models.organizer_info import OrganizerInfo
        
        organizer_info = OrganizerInfo.query.filter_by(user_id=user_id).first()
        
        if not organizer_info:
            return jsonify({'success': False, 'message': 'Organizer info not found'}), 404
        
        data = request.form
        
        # Update text fields (only essential fields remain)
        if data.get('organization_name'):
            organizer_info.organization_name = data.get('organization_name')
        if data.get('description'):
            organizer_info.description = data.get('description')
        if data.get('contact_phone'):
            organizer_info.contact_phone = data.get('contact_phone')
        
        # Handle logo upload
        if 'logo' in request.files:
            file = request.files['logo']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"organizer_{user_id}_logo_{timestamp}_{filename}"
                
                # Create organizer logo directory
                logo_folder = os.path.join(UPLOAD_FOLDER, 'organizer', 'info', 'logo')
                os.makedirs(logo_folder, exist_ok=True)
                
                filepath = os.path.join(logo_folder, filename)
                file.save(filepath)
                organizer_info.logo_url = f"/uploads/organizer/info/logo/{filename}"
        
        organizer_info.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cập nhật thông tin thành công',
            'data': organizer_info.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500
