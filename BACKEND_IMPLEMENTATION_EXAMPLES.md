# 🔧 BACKEND REFACTORING IMPLEMENTATION GUIDE

## 📂 NEW FILE STRUCTURE

```
ticketbookingapi/app/
├── exceptions/           # ❌ NEW
├── dto/                  # ❌ NEW  
├── schemas/              # ❌ NEW
├── repositories/         # ❌ NEW
├── middleware/           # ❌ NEW
└── utils/decorators.py   # ❌ NEW
```

---

## 1️⃣ EXCEPTION HANDLING

### File: `app/exceptions/__init__.py`
```python
"""Custom exception hierarchy for the application"""

class AppException(Exception):
    """Base exception for all application errors"""
    status_code = 500
    message = "Internal server error"
    
    def __init__(self, message=None, details=None):
        self.message = message or self.message
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self):
        return {
            'error': self.__class__.__name__,
            'message': self.message,
            'details': self.details
        }


class ValidationError(AppException):
    """Raised when input validation fails"""
    status_code = 400
    message = "Validation error"


class NotFoundError(AppException):
    """Raised when resource is not found"""
    status_code = 404
    message = "Resource not found"


class UnauthorizedError(AppException):
    """Raised when authentication fails"""
    status_code = 401
    message = "Authentication required"


class ForbiddenError(AppException):
    """Raised when user lacks permission"""
    status_code = 403
    message = "Access forbidden"


class ConflictError(AppException):
    """Raised when resource conflict occurs"""
    status_code = 409
    message = "Resource conflict"


class BusinessLogicError(AppException):
    """Raised when business rule is violated"""
    status_code = 422
    message = "Business logic error"
```

### File: `app/__init__.py` (ADD ERROR HANDLER)
```python
from app.exceptions import AppException

def create_app():
    app = Flask(__name__)
    # ... existing setup ...
    
    # Register global error handler
    @app.errorhandler(AppException)
    def handle_app_exception(error):
        """Handle all custom application exceptions"""
        return jsonify(error.to_dict()), error.status_code
    
    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({
            'error': 'NotFound',
            'message': 'Endpoint not found'
        }), 404
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        db.session.rollback()
        return jsonify({
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
    
    return app
```

---

## 2️⃣ REPOSITORY PATTERN

### File: `app/repositories/base_repository.py`
```python
"""Base repository with common CRUD operations"""
from typing import TypeVar, Generic, Optional, List, Type
from sqlalchemy.orm import Query
from app.extensions import db

T = TypeVar('T')

class BaseRepository(Generic[T]):
    """Base repository implementing common database operations"""
    
    def __init__(self, model: Type[T]):
        self.model = model
    
    def find_by_id(self, id: int) -> Optional[T]:
        """Find entity by ID"""
        return self.model.query.get(id)
    
    def find_all(self, filters: dict = None, 
                 order_by=None, 
                 limit: int = None, 
                 offset: int = None) -> List[T]:
        """Find all entities with optional filtering"""
        query = self.model.query
        
        if filters:
            query = query.filter_by(**filters)
        
        if order_by:
            query = query.order_by(order_by)
        
        if offset:
            query = query.offset(offset)
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def count(self, filters: dict = None) -> int:
        """Count entities with optional filtering"""
        query = self.model.query
        
        if filters:
            query = query.filter_by(**filters)
        
        return query.count()
    
    def save(self, entity: T) -> T:
        """Save (insert or update) entity"""
        db.session.add(entity)
        db.session.flush()
        return entity
    
    def delete(self, entity: T) -> None:
        """Delete entity"""
        db.session.delete(entity)
        db.session.flush()
    
    def commit(self):
        """Commit current transaction"""
        db.session.commit()
    
    def rollback(self):
        """Rollback current transaction"""
        db.session.rollback()
```

### File: `app/repositories/order_repository.py`
```python
"""Order repository with specific queries"""
from typing import Optional, List
from datetime import datetime
from sqlalchemy import and_
from app.models.order import Order
from app.repositories.base_repository import BaseRepository

class OrderRepository(BaseRepository[Order]):
    """Repository for Order entity"""
    
    def __init__(self):
        super().__init__(Order)
    
    def find_by_code(self, order_code: str) -> Optional[Order]:
        """Find order by unique code"""
        return self.model.query.filter_by(
            order_code=order_code
        ).first()
    
    def find_by_user(self, user_id: int, 
                     status: str = None,
                     limit: int = None) -> List[Order]:
        """Find all orders for a user"""
        query = self.model.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(order_status=status)
        
        query = query.order_by(Order.created_at.desc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def find_pending_orders(self, older_than: datetime) -> List[Order]:
        """Find pending orders older than specified time"""
        return self.model.query.filter(
            and_(
                Order.order_status == 'PENDING',
                Order.created_at < older_than
            )
        ).all()
    
    def get_revenue_by_period(self, start_date: datetime, 
                              end_date: datetime) -> float:
        """Calculate total revenue for a period"""
        from sqlalchemy import func
        
        result = db.session.query(
            func.sum(Order.final_amount)
        ).filter(
            and_(
                Order.order_status == 'PAID',
                Order.paid_at >= start_date,
                Order.paid_at <= end_date
            )
        ).scalar()
        
        return float(result or 0)
```

### File: `app/repositories/event_repository.py`
```python
"""Event repository with specific queries"""
from typing import Optional, List
from datetime import datetime
from sqlalchemy import and_, or_
from app.models.event import Event
from app.repositories.base_repository import BaseRepository

class EventRepository(BaseRepository[Event]):
    """Repository for Event entity"""
    
    def __init__(self):
        super().__init__(Event)
    
    def find_published_events(self, 
                             category_id: int = None,
                             is_featured: bool = None,
                             limit: int = None,
                             offset: int = None) -> List[Event]:
        """Find published events with filters"""
        query = self.model.query.filter_by(status='PUBLISHED')
        
        if category_id:
            query = query.filter_by(category_id=category_id)
        
        if is_featured is not None:
            query = query.filter_by(is_featured=is_featured)
        
        query = query.order_by(Event.start_datetime.asc())
        
        if offset:
            query = query.offset(offset)
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def search_by_name(self, search_term: str, 
                       limit: int = 20) -> List[Event]:
        """Search events by name"""
        return self.model.query.filter(
            Event.event_name.like(f'%{search_term}%')
        ).filter_by(
            status='PUBLISHED'
        ).limit(limit).all()
    
    def find_upcoming_events(self, 
                            from_date: datetime = None,
                            limit: int = None) -> List[Event]:
        """Find upcoming events"""
        from_date = from_date or datetime.utcnow()
        
        query = self.model.query.filter(
            and_(
                Event.status == 'PUBLISHED',
                Event.start_datetime >= from_date
            )
        ).order_by(Event.start_datetime.asc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
```

---

## 3️⃣ REFACTORED SERVICE LAYER

### File: `app/services/order_service.py` (REFACTORED)
```python
"""Order service with repository pattern"""
from typing import Tuple, Dict, List
from datetime import datetime
from app.exceptions import NotFoundError, ValidationError, BusinessLogicError
from app.repositories.order_repository import OrderRepository
from app.repositories.event_repository import EventRepository
from app.models.order import Order
from app.models.ticket import Ticket
from app.models.payment import Payment
import logging

logger = logging.getLogger(__name__)

class OrderService:
    """Business logic for order management"""
    
    def __init__(self, 
                 order_repo: OrderRepository = None,
                 event_repo: EventRepository = None):
        self.order_repo = order_repo or OrderRepository()
        self.event_repo = event_repo or EventRepository()
    
    def create_order(self, data: dict) -> Tuple[Order, List[Ticket], bool]:
        """
        Create a new order with tickets
        
        Args:
            data: Order creation data
            
        Returns:
            Tuple of (Order, List[Ticket], payment_required)
            
        Raises:
            ValidationError: If input data is invalid
            BusinessLogicError: If business rules are violated
        """
        # Validate required fields
        self._validate_order_data(data)
        
        try:
            # Generate unique order code
            order_code = self._generate_order_code()
            
            # Calculate amounts
            total_amount, tickets_data = self._calculate_order_total(data)
            discount_amount = self._apply_discount(data, tickets_data)
            final_amount = total_amount - discount_amount
            
            # Create order
            order = Order(
                user_id=data['user_id'],
                order_code=order_code,
                total_amount=total_amount,
                final_amount=final_amount,
                order_status='PENDING',
                customer_name=data['customer_name'],
                customer_email=data['customer_email'],
                customer_phone=data.get('customer_phone')
            )
            
            order = self.order_repo.save(order)
            
            # Create tickets
            tickets = self._create_tickets(order, tickets_data, data)
            
            # Update inventory
            self._update_inventory(tickets_data)
            
            # Commit transaction
            self.order_repo.commit()
            
            logger.info(f"Order created successfully: {order_code}", extra={
                'order_id': order.order_id,
                'user_id': data['user_id'],
                'total_amount': float(total_amount)
            })
            
            return order, tickets, (final_amount > 0)
            
        except Exception as e:
            self.order_repo.rollback()
            logger.error(f"Failed to create order: {str(e)}", extra={
                'user_id': data.get('user_id')
            })
            raise
    
    def get_order_details(self, order_id: int) -> Dict:
        """Get order with all related data"""
        order = self.order_repo.find_by_id(order_id)
        
        if not order:
            raise NotFoundError(f"Order with ID {order_id} not found")
        
        return {
            'order': order.to_dict(),
            'tickets': [t.to_dict() for t in order.tickets],
            'payment': order.payment.to_dict() if order.payment else None
        }
    
    def cancel_order(self, order_id: int) -> Tuple[bool, str]:
        """
        Cancel an order
        
        Returns:
            Tuple of (is_cancelled_immediately, message)
        """
        order = self.order_repo.find_by_id(order_id)
        
        if not order:
            raise NotFoundError(f"Order {order_id} not found")
        
        if order.order_status == 'CANCELLED':
            raise BusinessLogicError("Order already cancelled")
        
        if order.order_status == 'CANCELLATION_PENDING':
            raise BusinessLogicError("Cancellation request already pending")
        
        try:
            if order.order_status == 'PENDING':
                # Immediate cancellation for unpaid orders
                order.order_status = 'CANCELLED'
                self._release_inventory(order)
                self.order_repo.commit()
                
                logger.info(f"Order cancelled immediately: {order.order_code}")
                return True, "Order cancelled successfully"
            else:
                # Request cancellation for paid orders
                order.order_status = 'CANCELLATION_PENDING'
                self.order_repo.commit()
                
                logger.info(f"Cancellation requested for paid order: {order.order_code}")
                return False, "Cancellation request submitted"
                
        except Exception as e:
            self.order_repo.rollback()
            logger.error(f"Failed to cancel order {order_id}: {str(e)}")
            raise
    
    # Private helper methods
    
    def _validate_order_data(self, data: dict) -> None:
        """Validate order creation data"""
        required_fields = ['user_id', 'customer_name', 'customer_email', 'tickets']
        
        for field in required_fields:
            if field not in data or not data[field]:
                raise ValidationError(f"Missing required field: {field}")
        
        if not data['tickets']:
            raise ValidationError("At least one ticket is required")
    
    def _generate_order_code(self) -> str:
        """Generate unique order code"""
        import random
        import string
        
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"ORD-{timestamp}-{random_str}"
    
    def _calculate_order_total(self, data: dict) -> Tuple[float, List[Dict]]:
        """Calculate order total and validate ticket availability"""
        # Implementation here
        pass
    
    def _apply_discount(self, data: dict, tickets_data: List[Dict]) -> float:
        """Apply discount code if provided"""
        # Implementation here
        pass
    
    def _create_tickets(self, order: Order, 
                       tickets_data: List[Dict], 
                       data: dict) -> List[Ticket]:
        """Create ticket records for order"""
        # Implementation here
        pass
    
    def _update_inventory(self, tickets_data: List[Dict]) -> None:
        """Update ticket inventory after order"""
        # Implementation here
        pass
    
    def _release_inventory(self, order: Order) -> None:
        """Release inventory when order is cancelled"""
        # Implementation here
        pass
```

---

## 4️⃣ VALIDATION SCHEMAS

### File: `app/schemas/order_schema.py`
```python
"""Marshmallow schemas for order validation"""
from marshmallow import Schema, fields, validate, validates, ValidationError

class TicketItemSchema(Schema):
    """Schema for individual ticket in order"""
    ticket_type_id = fields.Int(required=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1, max=10))
    seat_ids = fields.List(fields.Int(), missing=[])

class CreateOrderSchema(Schema):
    """Schema for creating new order"""
    user_id = fields.Int(required=True)
    customer_name = fields.Str(
        required=True, 
        validate=validate.Length(min=1, max=255)
    )
    customer_email = fields.Email(required=True)
    customer_phone = fields.Str(
        validate=validate.Regexp(r'^\+?[0-9]{10,15}$', error='Invalid phone number'),
        missing=None
    )
    tickets = fields.List(
        fields.Nested(TicketItemSchema),
        required=True,
        validate=validate.Length(min=1)
    )
    discount_code = fields.Str(missing=None)
    
    @validates('tickets')
    def validate_tickets(self, tickets):
        """Validate tickets list"""
        if not tickets:
            raise ValidationError("At least one ticket is required")

class OrderResponseSchema(Schema):
    """Schema for order response"""
    order_id = fields.Int()
    order_code = fields.Str()
    total_amount = fields.Decimal(as_string=True)
    final_amount = fields.Decimal(as_string=True)
    order_status = fields.Str()
    customer_name = fields.Str()
    customer_email = fields.Str()
    created_at = fields.DateTime()
```

### File: `app/routes/orders.py` (REFACTORED)
```python
"""Order routes with validation"""
from flask import Blueprint, jsonify, request
from marshmallow import ValidationError as MarshmallowValidationError
from app.services.order_service import OrderService
from app.schemas.order_schema import CreateOrderSchema, OrderResponseSchema
from app.exceptions import NotFoundError, ValidationError

orders_bp = Blueprint("orders", __name__)
order_service = OrderService()
create_order_schema = CreateOrderSchema()
order_response_schema = OrderResponseSchema()

@orders_bp.route("/orders/create", methods=["POST"])
def create_order():
    """Create a new order with tickets and seats"""
    try:
        # Validate input
        data = create_order_schema.load(request.get_json())
        
        # Process order
        order, created_tickets, payment_required = order_service.create_order(data)
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'data': {
                'order': order_response_schema.dump(order),
                'tickets_count': len(created_tickets),
                'payment_required': payment_required
            }
        }), 201
        
    except MarshmallowValidationError as e:
        return jsonify({
            'success': False,
            'error': 'ValidationError',
            'message': 'Invalid input data',
            'details': e.messages
        }), 400

@orders_bp.route("/orders/<int:order_id>", methods=["GET"])
def get_order(order_id):
    """Get order details"""
    data = order_service.get_order_details(order_id)
    return jsonify({'success': True, 'data': data}), 200

@orders_bp.route("/orders/<int:order_id>/cancel", methods=["POST"])
def cancel_order(order_id):
    """Cancel an order"""
    is_cancelled, message = order_service.cancel_order(order_id)
    return jsonify({
        'success': True,
        'cancelled_immediately': is_cancelled,
        'message': message
    }), 200
```

---

## 5️⃣ DECORATORS & MIDDLEWARE

### File: `app/utils/decorators.py`
```python
"""Utility decorators for routes"""
from functools import wraps
from flask import request, jsonify
import jwt
from app.exceptions import UnauthorizedError, ForbiddenError
from app.config import Config

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            raise UnauthorizedError("Authentication required")
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            payload = jwt.decode(
                token, 
                Config.SECRET_KEY, 
                algorithms=['HS256']
            )
            
            request.user_id = payload.get('user_id')
            request.user_role = payload.get('role')
            
        except jwt.ExpiredSignatureError:
            raise UnauthorizedError("Token has expired")
        except jwt.InvalidTokenError:
            raise UnauthorizedError("Invalid token")
        
        return f(*args, **kwargs)
    
    return decorated_function

def require_role(*allowed_roles):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        @require_auth
        def decorated_function(*args, **kwargs):
            user_role = request.user_role
            
            if user_role not in allowed_roles:
                raise ForbiddenError(f"Requires one of roles: {', '.join(allowed_roles)}")
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator

# Usage example:
# @orders_bp.route("/orders/<int:order_id>/admin-cancel", methods=["POST"])
# @require_role('ADMIN', 'ORGANIZER')
# def admin_cancel_order(order_id):
#     ...
```

---

## 6️⃣ ENVIRONMENT CONFIGURATION

### File: `.env.example`
```bash
# Application
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database
DATABASE_URL=mysql+pymysql://user:password@host:port/database
DB_SSL_CA=path/to/ca-cert.pem

# VNPay Configuration
VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payment/vnpay-return

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_ENABLED=True
RATE_LIMIT_DEFAULT=100 per hour
```

### File: `app/config.py` (REFACTORED)
```python
"""Application configuration"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key_123')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    ssl_ca_path = os.path.join(basedir, 'CA_cert.pem')
    
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {
            'ssl_verify_cert': True,
            'ssl_verify_identity': True,
            'ssl_ca': ssl_ca_path
        },
        'pool_recycle': 280,
        'pool_pre_ping': True,
        'pool_size': 10,
        'max_overflow': 20
    }
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # VNPay
    VNPAY_TMN_CODE = os.getenv('VNPAY_TMN_CODE')
    VNPAY_HASH_SECRET = os.getenv('VNPAY_HASH_SECRET')
    VNPAY_URL = os.getenv('VNPAY_URL')
    VNPAY_RETURN_URL = os.getenv('VNPAY_RETURN_URL')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/app.log')
```

---

## ✅ MIGRATION CHECKLIST

### Step 1: Create New Structure
- [ ] Create `app/exceptions/` directory
- [ ] Create `app/repositories/` directory
- [ ] Create `app/schemas/` directory
- [ ] Create `.env` file from `.env.example`

### Step 2: Implement Core Components
- [ ] Implement exception hierarchy
- [ ] Implement BaseRepository
- [ ] Implement specific repositories
- [ ] Add error handlers to `app/__init__.py`

### Step 3: Refactor Services
- [ ] Refactor OrderService to use repository
- [ ] Refactor EventService to use repository
- [ ] Add proper logging
- [ ] Add transaction management

### Step 4: Update Routes
- [ ] Create validation schemas
- [ ] Update routes to use schemas
- [ ] Remove direct DB access from routes
- [ ] Test all endpoints

### Step 5: Configuration
- [ ] Move secrets to environment variables
- [ ] Update config.py to use env vars
- [ ] Test with different environments

---

## 🧪 TESTING EXAMPLES

### File: `tests/unit/test_order_service.py`
```python
"""Unit tests for OrderService"""
import pytest
from unittest.mock import Mock, patch
from app.services.order_service import OrderService
from app.exceptions import NotFoundError, ValidationError

@pytest.fixture
def mock_order_repo():
    return Mock()

@pytest.fixture
def order_service(mock_order_repo):
    return OrderService(order_repo=mock_order_repo)

def test_get_order_details_success(order_service, mock_order_repo):
    # Arrange
    mock_order = Mock()
    mock_order.to_dict.return_value = {'order_id': 1}
    mock_order.tickets = []
    mock_order.payment = None
    mock_order_repo.find_by_id.return_value = mock_order
    
    # Act
    result = order_service.get_order_details(1)
    
    # Assert
    assert result['order']['order_id'] == 1
    mock_order_repo.find_by_id.assert_called_once_with(1)

def test_get_order_details_not_found(order_service, mock_order_repo):
    # Arrange
    mock_order_repo.find_by_id.return_value = None
    
    # Act & Assert
    with pytest.raises(NotFoundError):
        order_service.get_order_details(999)
```

---

**Next**: Implement Frontend API Client (see separate document)
