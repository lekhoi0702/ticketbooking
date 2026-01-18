from flask import Blueprint, jsonify, request
from app.extensions import db
from app.services.order_service import OrderService
from app.models.ticket_type import TicketType

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/orders/create", methods=["POST"])
def create_order():
    """Create a new order with tickets and seats"""
    try:
        data = request.get_json()
        order, created_tickets, payment_required = OrderService.create_order(data)
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'data': {
                'order': order.to_dict(),
                'tickets_count': len(created_tickets),
                'payment_required': payment_required
            }
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@orders_bp.route("/orders/<int:order_id>", methods=["GET"])
def get_order(order_id):
    """Get order details"""
    try:
        data = OrderService.get_order_details(order_id)
        if not data:
            return jsonify({'success': False, 'message': 'Order not found'}), 404
        
        return jsonify({'success': True, 'data': data}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@orders_bp.route("/orders/<string:order_code>/status", methods=["GET"])
def get_order_by_code(order_code):
    """Get order by order code"""
    try:
        data = OrderService.get_order_by_code(order_code)
        if not data:
            return jsonify({'success': False, 'message': 'Order not found'}), 404
            
        return jsonify({'success': True, 'data': data}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@orders_bp.route("/orders/user/<int:user_id>", methods=["GET"])
def get_user_orders(user_id):
    """Get all orders for a user with full details"""
    try:
        data = OrderService.get_user_orders(user_id)
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@orders_bp.route("/orders/<int:order_id>/cancel", methods=["POST"])
def cancel_order(order_id):
    """Request order cancellation or cancel immediately if pending"""
    try:
        is_cancelled_now, message = OrderService.cancel_order(order_id)
        
        # Commit manually here since service modified objects but service's cancel_order does not explicit commit (it returns status)
        # Wait, I need to check my service implementation.
        # My service implementation for cancel_order did NOT commit?
        # Let's check the service content I wrote.
        # Line 392 of OrderService: order.order_status = 'CANCELLED' ... return True, msg
        # It does NOT invoke db.session.commit().
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': message}), 200
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@orders_bp.route("/tickets/user/<int:user_id>", methods=["GET"])
def get_user_tickets(user_id):
    """Get all tickets for a user (for MyTickets page)"""
    try:
        data = OrderService.get_user_tickets_details(user_id)
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@orders_bp.route("/orders/validate-discount", methods=["POST"])
def check_discount():
    """Validate discount code before checkout"""
    try:
        data = request.get_json()
        code = data.get('code')
        items = data.get('items', [])
        
        if not code or not items:
             return jsonify({'success': False, 'message': 'Missing data'}), 400
             
        detailed_items = []
        for it in items:
            tt = TicketType.query.get(it.get('ticket_type_id'))
            if tt:
                detailed_items.append({
                    'ticket_type': tt,
                    'quantity': it.get('quantity', 1),
                    'price': float(tt.price)
                })
                
        is_valid, amount, msg, _ = OrderService.validate_and_calculate_discount(code, detailed_items)
        
        return jsonify({
            'success': is_valid,
            'message': msg,
            'discount_amount': amount
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
