from flask import Blueprint, jsonify, request, redirect
from app.extensions import db
from app.models.order import Order
from app.models.payment import Payment
from app.services.order_service import OrderService
from datetime import datetime
import hashlib
import hmac
import urllib.parse
import random
import string
import requests
import base64

payments_bp = Blueprint("payments", __name__)

# VNPay Configuration
VNPAY_TMN_CODE = "53A85ZOT"  
VNPAY_HASH_SECRET = "4QL0OQ8BXVB0SLF5KK7Y42AXDPJNOJ37"
VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"  
VNPAY_RETURN_URL = "http://localhost:5173/payment/vnpay-return"  
VNPAY_API_URL = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction"

# PayPal Configuration (Sandbox)
PAYPAL_CLIENT_ID = "AeTOaUYnQbxVMFhq3YhoikAnVA6riEn4V1WIBwOwy_B7H8WgrSIa-vp9pVCaGtIbKnZLfnEBWbQxg8rl"
PAYPAL_CLIENT_SECRET = "EKtF2cA-V7Tqc9C6uGssk6zZTiM_PU92LdgnGpaYZZoN_GNYfe5WgOpA2lfiTpq0oVNIPTVV0nRoISKl"
PAYPAL_BASE_URL = "https://api.sandbox.paypal.com"  # Sandbox URL
PAYPAL_RETURN_URL = "http://localhost:5173/payment/paypal-return"
PAYPAL_CANCEL_URL = "http://localhost:5173/payment/paypal-cancel"

# VietQR Configuration (Mock)
VIETQR_RETURN_URL = "http://localhost:5173/payment/vietqr-return"

# VietQR Configuration (Mock)
VIETQR_RETURN_URL = "http://localhost:5173/payment/vietqr-return"

def generate_payment_code():
    """Generate unique payment code"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"PAY-{timestamp}-{random_str}"

def get_paypal_access_token():
    """Get PayPal OAuth access token"""
    auth_string = f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}"
    auth_bytes = auth_string.encode('ascii')
    auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
    
    headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Basic {auth_b64}'
    }
    
    data = {'grant_type': 'client_credentials'}
    
    response = requests.post(
        f"{PAYPAL_BASE_URL}/v1/oauth2/token",
        headers=headers,
        data=data
    )
    
    if response.status_code == 200:
        return response.json()['access_token']
    else:
        raise Exception(f"Failed to get PayPal access token: {response.text}")

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
                # Mark seats as BOOKED when payment succeeds
                OrderService.mark_seats_as_booked(order.order_id)
        else:
            payment.payment_status = 'FAILED'
            # Release seats and update quantities when payment fails
            order = Order.query.get(payment.order_id)
            if order:
                OrderService.release_seats_for_failed_order(order.order_id)
        
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
            # Mark seats as BOOKED when payment succeeds
            OrderService.mark_seats_as_booked(order.order_id)
        
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
            # Mark seats as BOOKED when payment succeeds
            OrderService.mark_seats_as_booked(order.order_id)
            
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
            # Release seats and update quantities
            OrderService.release_seats_for_failed_order(order.order_id)
            
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

@payments_bp.route("/payments/paypal/create-order", methods=["POST"])
def create_paypal_order():
    """Create PayPal payment order"""
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
                payment_method='PAYPAL',
                amount=float(order.final_amount),
                payment_status='PENDING'
            )
            db.session.add(payment)
            db.session.commit()
        
        # Get PayPal access token
        access_token = get_paypal_access_token()
        
        # Create PayPal order
        paypal_order_data = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": payment.payment_code,
                    "description": f"Ticket booking - Order {order.order_code}",
                    "amount": {
                        "currency_code": "USD",
                        "value": f"{order.final_amount:.2f}"
                    }
                }
            ],
            "application_context": {
                "brand_name": "Ticket Booking",
                "landing_page": "NO_PREFERENCE",
                "user_action": "PAY_NOW",
                "return_url": PAYPAL_RETURN_URL,
                "cancel_url": PAYPAL_CANCEL_URL
            }
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        response = requests.post(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders",
            headers=headers,
            json=paypal_order_data
        )
        
        if response.status_code in [200, 201]:
            paypal_order = response.json()
            
            # Find approval URL
            approval_url = None
            for link in paypal_order.get('links', []):
                if link.get('rel') == 'approve':
                    approval_url = link.get('href')
                    break
            
            if not approval_url:
                return jsonify({
                    'success': False,
                    'message': 'Failed to get PayPal approval URL'
                }), 500
            
            # Store PayPal order ID in transaction_id temporarily
            payment.transaction_id = paypal_order.get('id')
            db.session.commit()
            
            return jsonify({
                'success': True,
                'data': {
                    'payment_url': approval_url,
                    'payment_code': payment.payment_code,
                    'paypal_order_id': paypal_order.get('id')
                }
            }), 200
        else:
            # Better error handling
            error_detail = response.text
            try:
                error_json = response.json()
                error_detail = error_json.get('message', error_detail)
                if 'details' in error_json:
                    error_detail += f" - {error_json['details']}"
            except:
                pass
            
            return jsonify({
                'success': False,
                'message': f'Failed to create PayPal order: {error_detail}',
                'status_code': response.status_code,
                'debug_id': response.headers.get('Paypal-Debug-Id', 'N/A')
            }), response.status_code
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"PayPal create order error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/paypal/return", methods=["GET"])
def paypal_return():
    """Handle PayPal return URL and verify payment"""
    try:
        token = request.args.get('token')
        payer_id = request.args.get('PayerID')
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Missing payment token'
            }), 400
        
        # Get PayPal access token
        access_token = get_paypal_access_token()
        
        # Get order details from PayPal
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        response = requests.get(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders/{token}",
            headers=headers
        )
        
        if response.status_code != 200:
            return jsonify({
                'success': False,
                'message': 'Failed to verify PayPal order'
            }), 400
        
        paypal_order = response.json()
        status = paypal_order.get('status')
        
        # Find payment by PayPal order ID
        payment = Payment.query.filter_by(transaction_id=token).first()
        
        if not payment:
            # Try to find by reference_id in purchase_units
            purchase_units = paypal_order.get('purchase_units', [])
            reference_id = None
            if purchase_units:
                reference_id = purchase_units[0].get('reference_id')
            
            if reference_id:
                payment = Payment.query.filter_by(payment_code=reference_id).first()
        
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Payment not found'
            }), 404
        
        order = Order.query.get(payment.order_id)
        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404
        
        # If order is already approved, capture it
        if status == 'APPROVED':
            # Capture the payment
            capture_response = requests.post(
                f"{PAYPAL_BASE_URL}/v2/checkout/orders/{token}/capture",
                headers=headers
            )
            
            if capture_response.status_code in [200, 201]:
                capture_data = capture_response.json()
                capture_status = capture_data.get('status')
                
                if capture_status == 'COMPLETED':
                    # Get transaction ID
                    purchase_units = capture_data.get('purchase_units', [])
                    transaction_id = None
                    if purchase_units:
                        captures = purchase_units[0].get('payments', {}).get('captures', [])
                        if captures:
                            transaction_id = captures[0].get('id')
                    
                    payment.payment_status = 'SUCCESS'
                    payment.transaction_id = transaction_id or token
                    payment.paid_at = datetime.now()
                    
                    order.order_status = 'PAID'
                    order.paid_at = datetime.now()
                    # Mark seats as BOOKED when payment succeeds
                    OrderService.mark_seats_as_booked(order.order_id)
                    
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
                    # Release seats and update quantities
                    OrderService.release_seats_for_failed_order(order.order_id)
                    db.session.commit()
                    
                    return jsonify({
                        'success': False,
                        'message': f'Payment capture failed: {capture_status}'
                    }), 400
            else:
                return jsonify({
                    'success': False,
                    'message': f'Failed to capture payment: {capture_response.text}'
                }), 500
        elif status == 'COMPLETED':
            # Already completed
            payment.payment_status = 'SUCCESS'
            payment.paid_at = datetime.now()
            
            order.order_status = 'PAID'
            order.paid_at = datetime.now()
            # Mark seats as BOOKED when payment succeeds
            OrderService.mark_seats_as_booked(order.order_id)
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Payment already completed',
                'data': {
                    'order_code': order.order_code,
                    'order_id': order.order_id,
                    'payment_status': payment.payment_status,
                    'order_status': order.order_status
                }
            }), 200
        else:
            payment.payment_status = 'FAILED'
            # Release seats and update quantities
            OrderService.release_seats_for_failed_order(order.order_id)
            db.session.commit()
            
            return jsonify({
                'success': False,
                'message': f'Payment status: {status}'
            }), 400
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"PayPal return error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/paypal/cancel", methods=["GET"])
def paypal_cancel():
    """Handle PayPal cancel URL"""
    try:
        token = request.args.get('token')
        
        if token:
            # Find payment and mark as failed
            payment = Payment.query.filter_by(transaction_id=token).first()
            if payment:
                payment.payment_status = 'FAILED'
                # Release seats and update quantities
                OrderService.release_seats_for_failed_order(payment.order_id)
                db.session.commit()
        
        return jsonify({
            'success': False,
            'message': 'Payment was cancelled by user'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/vietqr/create-qr", methods=["POST"])
def create_vietqr_qr():
    """Create VietQR payment QR code (Mock)"""
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
        
        # Get event from order's tickets to check for VietQR image
        from app.models.ticket import Ticket
        from app.models.ticket_type import TicketType
        from app.models.event import Event
        
        ticket = Ticket.query.filter_by(order_id=order_id).first()
        vietqr_image_url = None
        
        if ticket:
            ticket_type = TicketType.query.get(ticket.ticket_type_id)
            if ticket_type:
                event = Event.query.get(ticket_type.event_id)
                if event and event.vietqr_image_url:
                    vietqr_image_url = event.vietqr_image_url
        
        # Create or get payment record
        payment = Payment.query.filter_by(order_id=order_id).first()
        if not payment:
            payment = Payment(
                order_id=order_id,
                payment_code=generate_payment_code(),
                payment_method='VIETQR',
                amount=float(order.final_amount),
                payment_status='PENDING'
            )
            db.session.add(payment)
            db.session.commit()
        
        # If organizer uploaded QR image, use it; otherwise generate mock QR code data
        if vietqr_image_url:
            # Use organizer's uploaded QR image
            return jsonify({
                'success': True,
                'data': {
                    'payment_code': payment.payment_code,
                    'vietqr_image_url': vietqr_image_url,
                    'amount': float(order.final_amount),
                    'order_code': order.order_code,
                    'expires_in': 900  # 15 minutes
                }
            }), 200
        else:
            # Generate mock QR code data (fallback)
            qr_data = {
                'accountNo': '970422',  # Mock account number
                'accountName': 'TICKET BOOKING',
                'amount': float(order.final_amount),
                'addInfo': f'Thanh toan don hang {order.order_code}',
                'template': 'compact2'
            }
            
            # Generate QR code string (mock format)
            qr_content = f"00020101021238570010A00000072701270006{qr_data['accountNo']}0208QRIBFTTA53037045406{int(qr_data['amount'] * 100):08d}5802VN62{len(qr_data['addInfo']):02d}{qr_data['addInfo']}6304"
            
            return jsonify({
                'success': True,
                'data': {
                    'payment_code': payment.payment_code,
                    'qr_content': qr_content,
                    'qr_data': qr_data,
                    'amount': float(order.final_amount),
                    'order_code': order.order_code,
                    'expires_in': 900  # 15 minutes
                }
            }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"VietQR create QR error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/vietqr/check-status", methods=["POST"])
def check_vietqr_status():
    """Check VietQR payment status (Mock - simulate payment check)"""
    try:
        data = request.get_json()
        
        payment_code = data.get('payment_code')
        if not payment_code:
            return jsonify({
                'success': False,
                'message': 'payment_code is required'
            }), 400
        
        payment = Payment.query.filter_by(payment_code=payment_code).first()
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Payment not found'
            }), 404
        
        order = Order.query.get(payment.order_id)
        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404
        
        # Mock: In real implementation, this would check with VietQR API
        # For demo, we return current status
        return jsonify({
            'success': True,
            'data': {
                'payment_status': payment.payment_status,
                'order_status': order.order_status,
                'payment_code': payment.payment_code,
                'order_code': order.order_code
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@payments_bp.route("/payments/vietqr/verify", methods=["POST"])
def verify_vietqr_payment():
    """Verify VietQR payment (Mock - simulate payment verification)"""
    try:
        data = request.get_json()
        
        payment_code = data.get('payment_code')
        if not payment_code:
            return jsonify({
                'success': False,
                'message': 'payment_code is required'
            }), 400
        
        payment = Payment.query.filter_by(payment_code=payment_code).first()
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Payment not found'
            }), 404
        
        order = Order.query.get(payment.order_id)
        if not order:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404
        
        # Mock: Simulate payment verification
        # In real implementation, this would verify with VietQR API
        # For demo, we'll mark as success if still pending
        if payment.payment_status == 'PENDING':
            payment.payment_status = 'SUCCESS'
            payment.transaction_id = f"VIETQR-{payment_code}"
            payment.paid_at = datetime.now()
            
            order.order_status = 'PAID'
            order.paid_at = datetime.now()
            # Mark seats as BOOKED when payment succeeds
            OrderService.mark_seats_as_booked(order.order_id)
            
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
        elif payment.payment_status == 'SUCCESS':
            return jsonify({
                'success': True,
                'message': 'Payment already verified',
                'data': {
                    'order_code': order.order_code,
                    'order_id': order.order_id,
                    'payment_status': payment.payment_status,
                    'order_status': order.order_status
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Payment status: {payment.payment_status}'
            }), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

