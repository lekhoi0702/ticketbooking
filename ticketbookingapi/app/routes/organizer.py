from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.event import Event
from app.models.ticket_type import TicketType
from app.models.order import Order
from app.models.ticket import Ticket
from app.models.payment import Payment
from app.models.venue import Venue
from sqlalchemy import func, and_
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
    """Delete an event"""
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({
                'success': False,
                'message': 'Event not found'
            }), 404
        
        # Check if there are any sold tickets
        if event.sold_tickets > 0:
            return jsonify({
                'success': False,
                'message': 'Cannot delete event with sold tickets'
            }), 400
        
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Event deleted successfully'
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
