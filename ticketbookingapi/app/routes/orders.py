from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.order import Order
from app.models.ticket import Ticket
from app.models.ticket_type import TicketType
from app.models.event import Event
from app.models.payment import Payment
from datetime import datetime
import random
import string

orders_bp = Blueprint("orders", __name__)

def generate_order_code():
    """Generate unique order code"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"ORD-{timestamp}-{random_str}"

def generate_ticket_code():
    """Generate unique ticket code"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"TKT-{timestamp}-{random_str}"

@orders_bp.route("/orders/create", methods=["POST"])
def create_order():
    """Create a new order with tickets and seats"""
    try:
        data = request.get_json()
        from app.models.seat import Seat
        
        # Validate required fields
        required_fields = ['user_id', 'customer_name', 'customer_email', 'customer_phone', 'tickets']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        tickets_data = data.get('tickets', [])
        if not tickets_data:
            return jsonify({
                'success': False,
                'message': 'At least one ticket is required'
            }), 400
        
        # Calculate total amount and validate ticket availability
        total_amount = 0
        ticket_types_to_update = []
        
        for ticket_item in tickets_data:
            ticket_type_id = ticket_item.get('ticket_type_id')
            quantity = ticket_item.get('quantity', 1)
            seat_ids = ticket_item.get('seat_ids', []) # optional seat selection
            
            ticket_type = TicketType.query.get(ticket_type_id)
            if not ticket_type:
                return jsonify({
                    'success': False,
                    'message': f'Ticket type {ticket_type_id} not found'
                }), 404
            
            # If seats are provided, quantity should match seat_ids length
            if seat_ids:
                if len(seat_ids) != quantity:
                    return jsonify({
                        'success': False,
                        'message': f'Quantity ({quantity}) does not match number of selected seats ({len(seat_ids)})'
                    }), 400
                
                # Check status each seat
                for seat_id in seat_ids:
                    seat = Seat.query.get(seat_id)
                    if not seat or seat.ticket_type_id != ticket_type_id:
                        return jsonify({'success': False, 'message': f'Ghế {seat_id} không hợp lệ'}), 400
                    if seat.status != 'AVAILABLE':
                        return jsonify({'success': False, 'message': f'Ghế {seat.row_name}{seat.seat_number} đã được đặt'}), 400
            
            # Check availability (for non-seat tickets)
            available = ticket_type.quantity - ticket_type.sold_quantity
            if available < quantity:
                return jsonify({
                    'success': False,
                    'message': f'Not enough tickets available for {ticket_type.type_name}. Only {available} left.'
                }), 400
            
            total_amount += float(ticket_type.price) * quantity
            ticket_types_to_update.append({
                'ticket_type': ticket_type,
                'quantity': quantity,
                'price': float(ticket_type.price),
                'seat_ids': seat_ids
            })
        
        # Apply discount if provided
        discount_amount = 0
        if data.get('discount_code'):
            # TODO: Implement discount code validation
            pass
        
        final_amount = total_amount - discount_amount
        
        # Create order
        order = Order(
            user_id=data.get('user_id'),
            order_code=generate_order_code(),
            total_amount=total_amount,
            final_amount=final_amount,
            order_status='PENDING',
            customer_name=data.get('customer_name'),
            customer_email=data.get('customer_email'),
            customer_phone=data.get('customer_phone')
        )
        
        db.session.add(order)
        db.session.flush()  # Get order_id
        
        # Create tickets
        created_tickets = []
        for ticket_info in ticket_types_to_update:
            ticket_type = ticket_info['ticket_type']
            quantity = ticket_info['quantity']
            price = ticket_info['price']
            seat_ids = ticket_info['seat_ids']
            
            for i in range(quantity):
                seat_id = seat_ids[i] if seat_ids and i < len(seat_ids) else None
                
                ticket = Ticket(
                    order_id=order.order_id,
                    ticket_type_id=ticket_type.ticket_type_id,
                    ticket_code=generate_ticket_code(),
                    ticket_status='ACTIVE',
                    seat_id=seat_id,
                    price=price,
                    holder_name=data.get('customer_name'),
                    holder_email=data.get('customer_email')
                )
                db.session.add(ticket)
                created_tickets.append(ticket)
                
                # Mark seat as BOOKED
                if seat_id:
                    seat = Seat.query.get(seat_id)
                    seat.status = 'BOOKED'
            
            # Update sold quantity
            ticket_type.sold_quantity += quantity
            
            # Update event sold tickets
            event = Event.query.get(ticket_type.event_id)
            if event:
                event.sold_tickets += quantity
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'data': {
                'order': order.to_dict(),
                'tickets_count': len(created_tickets),
                'payment_required': final_amount > 0
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@orders_bp.route("/orders/<int:order_id>", methods=["GET"])
def get_order(order_id):
    """Get order details"""
    try:
        order = Order.query.get(order_id)
        
        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404
        
        # Get tickets
        tickets = Ticket.query.filter_by(order_id=order_id).all()
        
        # Get payment info
        payment = Payment.query.filter_by(order_id=order_id).first()
        
        return jsonify({
            'success': True,
            'data': {
                'order': order.to_dict(),
                'tickets': [ticket.to_dict() for ticket in tickets],
                'payment': payment.to_dict() if payment else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@orders_bp.route("/orders/<string:order_code>/status", methods=["GET"])
def get_order_by_code(order_code):
    """Get order by order code"""
    try:
        order = Order.query.filter_by(order_code=order_code).first()
        
        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404
        
        tickets = Ticket.query.filter_by(order_id=order.order_id).all()
        payment = Payment.query.filter_by(order_id=order.order_id).first()
        
        # Get event info from first ticket
        event_info = None
        if tickets:
            ticket_type = TicketType.query.get(tickets[0].ticket_type_id)
            if ticket_type:
                event = Event.query.get(ticket_type.event_id)
                if event:
                    event_info = event.to_dict(include_details=True)
        
        return jsonify({
            'success': True,
            'data': {
                'order': order.to_dict(),
                'tickets': [ticket.to_dict() for ticket in tickets],
                'payment': payment.to_dict() if payment else None,
                'event': event_info
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@orders_bp.route("/orders/user/<int:user_id>", methods=["GET"])
def get_user_orders(user_id):
    """Get all orders for a user"""
    try:
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
        
        orders_data = []
        for order in orders:
            tickets = Ticket.query.filter_by(order_id=order.order_id).all()
            
            # Get event info
            event_info = None
            if tickets:
                ticket_type = TicketType.query.get(tickets[0].ticket_type_id)
                if ticket_type:
                    event = Event.query.get(ticket_type.event_id)
                    if event:
                        event_info = {
                            'event_id': event.event_id,
                            'event_name': event.event_name,
                            'start_datetime': event.start_datetime.isoformat() if event.start_datetime else None,
                            'banner_image_url': event.banner_image_url
                        }
            
            orders_data.append({
                'order': order.to_dict(),
                'tickets_count': len(tickets),
                'event': event_info
            })
        
        return jsonify({
            'success': True,
            'data': orders_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@orders_bp.route("/orders/<int:order_id>/cancel", methods=["POST"])
def cancel_order(order_id):
    """Cancel an order and refund tickets"""
    try:
        order = Order.query.get(order_id)
        
        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404
        
        if order.order_status == 'CANCELLED':
            return jsonify({
                'success': False,
                'message': 'Order is already cancelled'
            }), 400
        
        # Get tickets
        tickets = Ticket.query.filter_by(order_id=order_id).all()
        
        # Refund tickets to inventory
        from app.models.seat import Seat
        for ticket in tickets:
            ticket.ticket_status = 'CANCELLED'
            
            # Release seat if exists
            if ticket.seat_id:
                seat = Seat.query.get(ticket.seat_id)
                if seat:
                    seat.status = 'AVAILABLE'
            
            ticket_type = TicketType.query.get(ticket.ticket_type_id)
            if ticket_type:
                ticket_type.sold_quantity -= 1
                
                # Update event sold tickets
                event = Event.query.get(ticket_type.event_id)
                if event:
                    event.sold_tickets -= 1
        
        # Update order status
        order.order_status = 'CANCELLED'
        
        # Update payment if exists
        payment = Payment.query.filter_by(order_id=order_id).first()
        if payment:
            payment.payment_status = 'REFUNDED'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order cancelled successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
