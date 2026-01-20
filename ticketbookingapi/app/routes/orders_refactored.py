"""
Orders routes - REFACTORED VERSION
Order management with new architecture
"""

from flask import Blueprint, jsonify, request, g
from typing import Dict, Any

from app.schemas import OrderCreateSchema, OrderSchema, DiscountValidationSchema
from app.repositories import (
    OrderRepository, TicketRepository, TicketTypeRepository,
    DiscountRepository, UserRepository
)
from app.decorators import validate_schema, require_auth
from app.exceptions import (
    ResourceNotFoundException,
    InsufficientStockException,
    InvalidDiscountException,
    BusinessRuleException
)
from app.utils.logger import get_logger
from app.extensions import db
from app.services.order_service import OrderService

# Initialize
orders_bp = Blueprint("orders_refactored", __name__)
logger = get_logger(__name__)

order_repo = OrderRepository()
ticket_repo = TicketRepository()
ticket_type_repo = TicketTypeRepository()
discount_repo = DiscountRepository()
user_repo = UserRepository()


@orders_bp.route("/orders/create", methods=["POST"])
@require_auth
@validate_schema(OrderCreateSchema())
def create_order():
    """
    Create a new order with tickets
    
    Request Body:
        {
            "items": [
                {
                    "ticket_type_id": 1,
                    "quantity": 2,
                    "seat_ids": [1, 2] (optional)
                }
            ],
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "customer_phone": "+84901234567",
            "discount_code": "SALE10" (optional)
        }
    
    Response:
        {
            "success": true,
            "message": "Order created successfully",
            "data": {
                "order": {...},
                "tickets_count": 2,
                "payment_required": true
            }
        }
    """
    try:
        data = request.validated_data
        user = g.current_user
        
        logger.info(f"Creating order for user: {user.user_id}")
        
        # Use existing OrderService for complex order creation logic
        # (This maintains backward compatibility with existing business logic)
        order_data = {
            'user_id': user.user_id,
            'items': data['items'],
            'customer_name': data['customer_name'],
            'customer_email': data['customer_email'],
            'customer_phone': data['customer_phone'],
            'discount_code': data.get('discount_code')
        }
        
        order, created_tickets, payment_required = OrderService.create_order(order_data)
        
        logger.info(f"Order created successfully: {order.order_id}")
        
        # Serialize response
        order_schema = OrderSchema()
        order_data = order_schema.dump(order)
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'data': {
                'order': order_data,
                'tickets_count': len(created_tickets),
                'payment_required': payment_required
            }
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        logger.warning(f"Order creation failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_CREATION_ERROR',
                'message': str(e)
            }
        }), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Order creation error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_CREATION_ERROR',
                'message': 'An error occurred while creating order'
            }
        }), 500


@orders_bp.route("/orders/<int:order_id>", methods=["GET"])
@require_auth
def get_order(order_id: int):
    """
    Get order details by ID
    
    Response:
        {
            "success": true,
            "data": {
                "order": {...},
                "tickets": [...],
                "payment": {...}
            }
        }
    """
    try:
        user = g.current_user
        
        logger.info(f"Fetching order {order_id} for user {user.user_id}")
        
        # Get order
        order = order_repo.get_by_id(order_id, raise_if_not_found=False)
        
        if not order or order.deleted_at:
            raise ResourceNotFoundException('Order', order_id)
        
        # Check ownership (unless admin)
        if user.role_id != 3 and order.user_id != user.user_id:
            raise BusinessRuleException('You do not have permission to view this order')
        
        # Use OrderService for detailed order data
        data = OrderService.get_order_details(order_id)
        
        if not data:
            raise ResourceNotFoundException('Order', order_id)
        
        logger.info(f"Order fetched successfully: {order_id}")
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except (ResourceNotFoundException, BusinessRuleException) as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error fetching order {order_id}: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'FETCH_ORDER_ERROR',
                'message': 'An error occurred while fetching order'
            }
        }), 500


@orders_bp.route("/orders/<string:order_code>/status", methods=["GET"])
def get_order_by_code(order_code: str):
    """
    Get order by order code (public endpoint for payment callback)
    
    Response:
        {
            "success": true,
            "data": {...}
        }
    """
    try:
        logger.info(f"Fetching order by code: {order_code}")
        
        # Get order
        order = order_repo.get_by_order_code(order_code)
        
        if not order:
            raise ResourceNotFoundException('Order', order_code)
        
        # Use OrderService for detailed data
        data = OrderService.get_order_by_code(order_code)
        
        if not data:
            raise ResourceNotFoundException('Order', order_code)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except ResourceNotFoundException as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error fetching order {order_code}: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'FETCH_ORDER_ERROR',
                'message': 'An error occurred while fetching order'
            }
        }), 500


@orders_bp.route("/orders/user/<int:user_id>", methods=["GET"])
@require_auth
def get_user_orders(user_id: int):
    """
    Get all orders for a user
    
    Response:
        {
            "success": true,
            "data": [...]
        }
    """
    try:
        current_user = g.current_user
        
        # Check permission (own orders or admin)
        if current_user.role_id != 3 and current_user.user_id != user_id:
            raise BusinessRuleException('You do not have permission to view these orders')
        
        logger.info(f"Fetching orders for user: {user_id}")
        
        # Use OrderService for detailed order data
        data = OrderService.get_user_orders(user_id)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except BusinessRuleException as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error fetching user orders: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'FETCH_ORDERS_ERROR',
                'message': 'An error occurred while fetching orders'
            }
        }), 500


@orders_bp.route("/orders/<int:order_id>/cancel", methods=["POST"])
@require_auth
def cancel_order(order_id: int):
    """
    Cancel an order
    
    Response:
        {
            "success": true,
            "message": "Order cancelled successfully"
        }
    """
    try:
        user = g.current_user
        
        logger.info(f"Cancelling order {order_id} by user {user.user_id}")
        
        # Get order
        order = order_repo.get_by_id(order_id, raise_if_not_found=False)
        
        if not order or order.deleted_at:
            raise ResourceNotFoundException('Order', order_id)
        
        # Check ownership
        if user.role_id != 3 and order.user_id != user.user_id:
            raise BusinessRuleException('You do not have permission to cancel this order')
        
        # Use OrderService for cancellation logic
        is_cancelled, message = OrderService.cancel_order(order_id)
        
        # Commit changes
        db.session.commit()
        
        logger.info(f"Order {order_id} cancelled: {message}")
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except (ResourceNotFoundException, BusinessRuleException) as e:
        db.session.rollback()
        return jsonify(e.to_dict()), e.status_code
    except ValueError as e:
        db.session.rollback()
        logger.warning(f"Order cancellation failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_CANCELLATION_ERROR',
                'message': str(e)
            }
        }), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error cancelling order: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'ORDER_CANCELLATION_ERROR',
                'message': 'An error occurred while cancelling order'
            }
        }), 500


@orders_bp.route("/tickets/user/<int:user_id>", methods=["GET"])
@require_auth
def get_user_tickets(user_id: int):
    """
    Get all tickets for a user (My Tickets page)
    
    Response:
        {
            "success": true,
            "data": [
                {
                    "ticket": {...},
                    "event": {...},
                    "order": {...}
                }
            ]
        }
    """
    try:
        current_user = g.current_user
        
        # Check permission
        if current_user.role_id != 3 and current_user.user_id != user_id:
            raise BusinessRuleException('You do not have permission to view these tickets')
        
        logger.info(f"Fetching tickets for user: {user_id}")
        
        # Use OrderService for detailed ticket data
        data = OrderService.get_user_tickets_details(user_id)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except BusinessRuleException as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error fetching user tickets: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'FETCH_TICKETS_ERROR',
                'message': 'An error occurred while fetching tickets'
            }
        }), 500


@orders_bp.route("/orders/validate-discount", methods=["POST"])
@validate_schema(DiscountValidationSchema())
def validate_discount():
    """
    Validate discount code before checkout
    
    Request Body:
        {
            "discount_code": "SALE10",
            "total_amount": 100000
        }
    
    Response:
        {
            "success": true,
            "message": "Discount code is valid",
            "discount_amount": 10000,
            "final_amount": 90000
        }
    """
    try:
        data = request.validated_data
        code = data['discount_code']
        total_amount = float(data['total_amount'])
        
        logger.info(f"Validating discount code: {code}")
        
        # Validate discount
        try:
            discount = discount_repo.validate_discount(code, total_amount)
            discount_amount = discount_repo.calculate_discount_amount(discount, total_amount)
            final_amount = total_amount - discount_amount
            
            logger.info(f"Discount valid: {code}, amount: {discount_amount}")
            
            return jsonify({
                'success': True,
                'message': 'Discount code is valid',
                'discount_amount': discount_amount,
                'final_amount': final_amount,
                'discount_details': {
                    'code': discount.discount_code,
                    'name': discount.discount_name,
                    'type': discount.discount_type,
                    'value': float(discount.discount_value)
                }
            }), 200
            
        except InvalidDiscountException as e:
            logger.warning(f"Invalid discount code: {code} - {str(e)}")
            return jsonify({
                'success': False,
                'message': e.message,
                'discount_amount': 0
            }), 200  # Return 200 but with success: false
        
    except Exception as e:
        logger.error(f"Error validating discount: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'DISCOUNT_VALIDATION_ERROR',
                'message': 'An error occurred while validating discount'
            }
        }), 500
