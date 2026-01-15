from flask import Blueprint, jsonify, request, redirect
from app.extensions import db
from app.models.order import Order
from app.models.payment import Payment
from datetime import datetime
import hashlib
import hmac
import urllib.parse
import random
import string

payments_bp = Blueprint("payments", __name__)

# VNPay Configuration
VNPAY_TMN_CODE = "53A85ZOT"  
VNPAY_HASH_SECRET = "4QL0OQ8BXVB0SLF5KK7Y42AXDPJNOJ37"
VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"  
VNPAY_RETURN_URL = "http://localhost:5173/payment/vnpay-return"  
VNPAY_API_URL = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction"

def generate_payment_code():
    """Generate unique payment code"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"PAY-{timestamp}-{random_str}"

@payments_bp.route("/payments/create", methods=["POST"])
def create_payment():
    """Create a payment record"""
    try:
        data = request.get_json()
        
        order_id = data.get('order_id')
        payment_method = data.get('payment_method')  # 'CASH' or 'VNPAY'
        
        if not order_id or not payment_method:
            return jsonify({
                'success': False,
                'message': 'order_id and payment_method are required'
            }), 400
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404
        
        # Check if payment already exists
        existing_payment = Payment.query.filter_by(order_id=order_id).first()
        if existing_payment:
            return jsonify({
                'success': False,
                'message': 'Payment already exists for this order',
                'data': existing_payment.to_dict()
            }), 400
        
        # Create payment record
        payment = Payment(
            order_id=order_id,
            payment_code=generate_payment_code(),
            payment_method=payment_method,
            amount=float(order.final_amount),
            payment_status='PENDING'
        )
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payment created successfully',
            'data': payment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/vnpay/create-url", methods=["POST"])
def create_vnpay_payment_url():
    """Create VNPay payment URL"""
    try:
        data = request.get_json()
        
        order_id = data.get('order_id')
        if not order_id:
            return jsonify({
                'success': False,
                'message': 'order_id is required'
            }), 400
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404
        
        # Create or get payment record
        payment = Payment.query.filter_by(order_id=order_id).first()
        if not payment:
            payment = Payment(
                order_id=order_id,
                payment_code=generate_payment_code(),
                payment_method='VNPAY',
                amount=float(order.final_amount),
                payment_status='PENDING'
            )
            db.session.add(payment)
            db.session.commit()
        
        # Build VNPay payment URL
        vnp_params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': VNPAY_TMN_CODE,
            'vnp_Amount': int(float(order.final_amount) * 100),  # VNPay requires amount in VND * 100
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': payment.payment_code,
            'vnp_OrderInfo': f'Thanh toan don hang {order.order_code}',
            'vnp_OrderType': 'billpayment',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': VNPAY_RETURN_URL,
            'vnp_IpAddr': request.remote_addr or '127.0.0.1',
            'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S')
        }
        
        # Sort parameters
        sorted_params = sorted(vnp_params.items())
        
        # Create hash data and query string
        hash_data = ""
        query_string = ""
        for i, (key, val) in enumerate(sorted_params):
            val_encoded = urllib.parse.quote_plus(str(val))
            if i > 0:
                hash_data += "&"
                query_string += "&"
            hash_data += f"{key}={val_encoded}"
            query_string += f"{key}={val_encoded}"
            
        # Create secure hash
        secure_hash = hmac.new(
            VNPAY_HASH_SECRET.encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        # Build final URL
        payment_url = f"{VNPAY_URL}?{query_string}&vnp_SecureHash={secure_hash}"
        
        return jsonify({
            'success': True,
            'data': {
                'payment_url': payment_url,
                'payment_code': payment.payment_code
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/vnpay/callback", methods=["GET"])
def vnpay_callback():
    """Handle VNPay IPN callback"""
    try:
        # Get all parameters
        vnp_params = dict(request.args)
        
        # Get secure hash
        vnp_secure_hash = vnp_params.pop('vnp_SecureHash', None)
        
        # Sort and create hash data
        sorted_params = sorted(vnp_params.items())
        hash_data = '&'.join([f"{key}={urllib.parse.quote_plus(str(val))}" for key, val in sorted_params])
        
        # Verify secure hash
        calculated_hash = hmac.new(
            VNPAY_HASH_SECRET.encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        if vnp_secure_hash != calculated_hash:
            return jsonify({
                'success': False,
                'message': 'Invalid signature'
            }), 400
        
        # Get payment info
        payment_code = vnp_params.get('vnp_TxnRef')
        response_code = vnp_params.get('vnp_ResponseCode')
        transaction_no = vnp_params.get('vnp_TransactionNo')
        
        payment = Payment.query.filter_by(payment_code=payment_code).first()
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Payment not found'
            }), 404
        
        # Update payment status
        if response_code == '00':
            payment.payment_status = 'SUCCESS'
            payment.transaction_id = transaction_no
            payment.paid_at = datetime.now()
            
            # Update order status
            order = Order.query.get(payment.order_id)
            if order:
                order.order_status = 'PAID'
                order.paid_at = datetime.now()
        else:
            payment.payment_status = 'FAILED'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payment processed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/cash/confirm", methods=["POST"])
def confirm_cash_payment():
    """Confirm cash payment (for admin/organizer)"""
    try:
        data = request.get_json()
        
        payment_id = data.get('payment_id')
        order_id = data.get('order_id')
        
        payment = None
        if payment_id:
            # Try as payment_id first
            payment = Payment.query.get(payment_id)
            if not payment:
                # If not found, frontend might have passed order_id in payment_id field
                payment = Payment.query.filter_by(order_id=payment_id, payment_method='CASH').first()
        elif order_id:
            payment = Payment.query.filter_by(order_id=order_id, payment_method='CASH').first()
            
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Không tìm thấy thông tin thanh toán tiền mặt cho đơn hàng này'
            }), 404
        
        if payment.payment_method != 'CASH':
            return jsonify({
                'success': False,
                'message': 'This endpoint is only for cash payments'
            }), 400
        
        # Update payment status
        payment.payment_status = 'SUCCESS'
        payment.paid_at = datetime.now()
        
        # Update order status
        order = Order.query.get(payment.order_id)
        if order:
            order.order_status = 'PAID'
            order.paid_at = datetime.now()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cash payment confirmed successfully',
            'data': payment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/<int:payment_id>", methods=["GET"])
def get_payment(payment_id):
    """Get payment details"""
    try:
        payment = Payment.query.get(payment_id)
        
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Payment not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': payment.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/order/<int:order_id>", methods=["GET"])
def get_payment_by_order(order_id):
    """Get payment by order ID"""
    try:
        payment = Payment.query.filter_by(order_id=order_id).first()
        
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Payment not found for this order'
            }), 404
        
        return jsonify({
            'success': True,
            'data': payment.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/vnpay/return", methods=["GET"])
def vnpay_return():
    """Verify VNPay payment return and update order status"""
    try:
        # Get all parameters
        vnp_params = dict(request.args)
        
        # Get secure hash
        vnp_secure_hash = vnp_params.pop('vnp_SecureHash', None)
        
        # Sort and create hash data
        sorted_params = sorted(vnp_params.items())
        hash_data = '&'.join([f"{key}={urllib.parse.quote_plus(str(val))}" for key, val in sorted_params])
        
        # Verify secure hash
        calculated_hash = hmac.new(
            VNPAY_HASH_SECRET.encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        if vnp_secure_hash != calculated_hash:
            return jsonify({
                'success': False,
                'message': 'Invalid signature'
            }), 400
        
        # Get payment info
        payment_code = vnp_params.get('vnp_TxnRef')
        response_code = vnp_params.get('vnp_ResponseCode')
        transaction_no = vnp_params.get('vnp_TransactionNo')
        
        payment = Payment.query.filter_by(payment_code=payment_code).first()
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Payment not found'
            }), 404
        
        # Get order
        order = Order.query.get(payment.order_id)
        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404
        
        # Update payment and order status
        print(f"VNPay Return: Code={payment_code}, Response={response_code}")
        if response_code == '00':
            payment.payment_status = 'SUCCESS'
            payment.transaction_id = transaction_no
            payment.paid_at = datetime.now()
            
            order.order_status = 'PAID'
            order.paid_at = datetime.now()
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Payment verified successfully',
                'data': {
                    'order_code': order.order_code,
                    'order_id': order.order_id,
                    'payment_status': payment.payment_status,
                    'order_status': order.order_status
                }
            }), 200
        else:
            payment.payment_status = 'FAILED'
            order.order_status = 'CANCELLED'
            
            db.session.commit()
            
            return jsonify({
                'success': False,
                'message': 'Payment failed',
                'data': {
                    'response_code': response_code
                }
            }), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

