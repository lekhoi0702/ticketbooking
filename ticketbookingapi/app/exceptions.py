"""
Custom exception hierarchy for TicketBooking API
Provides structured error handling with proper HTTP status codes
"""

from typing import Optional, Dict, Any


class APIException(Exception):
    """Base exception for all API errors"""
    status_code = 500
    message = "An error occurred"
    error_code = "INTERNAL_ERROR"
    
    def __init__(
        self,
        message: Optional[str] = None,
        status_code: Optional[int] = None,
        error_code: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None
    ):
        super().__init__()
        if message is not None:
            self.message = message
        if status_code is not None:
            self.status_code = status_code
        if error_code is not None:
            self.error_code = error_code
        self.payload = payload or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for JSON response"""
        rv = {
            'success': False,
            'error': {
                'code': self.error_code,
                'message': self.message,
                **self.payload
            }
        }
        return rv
    
    def __str__(self):
        return f"{self.error_code}: {self.message}"


# ============================================
# 4xx Client Errors
# ============================================

class BadRequestException(APIException):
    """400 Bad Request"""
    status_code = 400
    message = "Yêu cầu không hợp lệ"
    error_code = "BAD_REQUEST"


class ValidationException(BadRequestException):
    """400 Validation Error"""
    message = "Dữ liệu không hợp lệ"
    error_code = "VALIDATION_ERROR"
    
    def __init__(self, errors: Dict[str, Any], message: Optional[str] = None):
        super().__init__(
            message=message or self.message,
            payload={'errors': errors}
        )


class UnauthorizedException(APIException):
    """401 Unauthorized"""
    status_code = 401
    message = "Vui lòng đăng nhập"
    error_code = "UNAUTHORIZED"


class InvalidCredentialsException(UnauthorizedException):
    """401 Invalid credentials"""
    message = "Email hoặc mật khẩu không đúng"
    error_code = "INVALID_CREDENTIALS"


class TokenExpiredException(UnauthorizedException):
    """401 Token expired"""
    message = "Phiên đăng nhập đã hết hạn"
    error_code = "TOKEN_EXPIRED"


class InvalidTokenException(UnauthorizedException):
    """401 Invalid token"""
    message = "Token không hợp lệ"
    error_code = "INVALID_TOKEN"


class ForbiddenException(APIException):
    """403 Forbidden"""
    status_code = 403
    message = "Bạn không có quyền truy cập tài nguyên này"
    error_code = "FORBIDDEN"


class InsufficientPermissionException(ForbiddenException):
    """403 Insufficient permissions"""
    message = "Insufficient permissions for this action"
    error_code = "INSUFFICIENT_PERMISSION"


class NotFoundException(APIException):
    """404 Not Found"""
    status_code = 404
    message = "Không tìm thấy tài nguyên"
    error_code = "NOT_FOUND"


class ResourceNotFoundException(NotFoundException):
    """404 Specific resource not found"""
    def __init__(self, resource_type: str, resource_id: Any):
        super().__init__(
            message=f"{resource_type} with ID {resource_id} not found",
            payload={'resource_type': resource_type, 'resource_id': str(resource_id)}
        )


class ConflictException(APIException):
    """409 Conflict"""
    status_code = 409
    message = "Xung đột tài nguyên"
    error_code = "CONFLICT"


class DuplicateResourceException(ConflictException):
    """409 Duplicate resource"""
    def __init__(self, resource_type: str, field: str, value: Any):
        msg_map = {
            'email': 'Email này đã được sử dụng',
            'phone': 'Số điện thoại này đã được sử dụng',
        }
        message = msg_map.get(field, f"{resource_type} với {field} '{value}' đã tồn tại")
        super().__init__(
            message=message,
            error_code="DUPLICATE_RESOURCE",
            payload={'resource_type': resource_type, 'field': field, 'value': str(value)}
        )


class UnprocessableEntityException(APIException):
    """422 Unprocessable Entity"""
    status_code = 422
    message = "Unable to process request"
    error_code = "UNPROCESSABLE_ENTITY"


# ============================================
# 5xx Server Errors
# ============================================

class InternalServerException(APIException):
    """500 Internal Server Error"""
    status_code = 500
    message = "Internal server error"
    error_code = "INTERNAL_ERROR"


class DatabaseException(InternalServerException):
    """500 Database error"""
    message = "Database operation failed"
    error_code = "DATABASE_ERROR"


class ExternalServiceException(InternalServerException):
    """500 External service error"""
    message = "External service unavailable"
    error_code = "EXTERNAL_SERVICE_ERROR"


# ============================================
# Business Logic Exceptions
# ============================================

class BusinessRuleException(UnprocessableEntityException):
    """422 Business rule violation"""
    message = "Business rule violation"
    error_code = "BUSINESS_RULE_VIOLATION"


class InsufficientStockException(BusinessRuleException):
    """Insufficient ticket stock"""
    def __init__(self, available: int, requested: int):
        super().__init__(
            message=f"Insufficient tickets. Available: {available}, Requested: {requested}",
            error_code="INSUFFICIENT_STOCK",
            payload={'available': available, 'requested': requested}
        )


class InvalidDateRangeException(BusinessRuleException):
    """Invalid date range"""
    message = "Start date must be before end date"
    error_code = "INVALID_DATE_RANGE"


class SeatAlreadyBookedException(BusinessRuleException):
    """Seat already booked"""
    def __init__(self, seat_id: int):
        super().__init__(
            message=f"Seat {seat_id} is already booked",
            error_code="SEAT_ALREADY_BOOKED",
            payload={'seat_id': seat_id}
        )


class OrderAlreadyCancelledException(BusinessRuleException):
    """Order already cancelled"""
    message = "Order has already been cancelled"
    error_code = "ORDER_ALREADY_CANCELLED"


class OrderCannotBeCancelledException(BusinessRuleException):
    """Order cannot be cancelled"""
    def __init__(self, reason: str):
        super().__init__(
            message=f"Order cannot be cancelled: {reason}",
            error_code="ORDER_CANNOT_BE_CANCELLED",
            payload={'reason': reason}
        )


class InvalidDiscountException(BusinessRuleException):
    """Invalid discount code"""
    message = "Invalid or expired discount code"
    error_code = "INVALID_DISCOUNT"


class PaymentFailedException(BusinessRuleException):
    """Payment failed"""
    def __init__(self, reason: str):
        super().__init__(
            message=f"Payment failed: {reason}",
            error_code="PAYMENT_FAILED",
            payload={'reason': reason}
        )


class EventNotAvailableException(BusinessRuleException):
    """Event not available for booking"""
    message = "Event is not available for booking"
    error_code = "EVENT_NOT_AVAILABLE"


class TicketTypeNotAvailableException(BusinessRuleException):
    """Ticket type not available"""
    def __init__(self, ticket_type_id: int):
        super().__init__(
            message=f"Ticket type {ticket_type_id} is not available",
            error_code="TICKET_TYPE_NOT_AVAILABLE",
            payload={'ticket_type_id': ticket_type_id}
        )


# ============================================
# File Upload Exceptions
# ============================================

class FileUploadException(BadRequestException):
    """File upload error"""
    message = "File upload failed"
    error_code = "FILE_UPLOAD_ERROR"


class InvalidFileTypeException(FileUploadException):
    """Invalid file type"""
    def __init__(self, allowed_types: list):
        super().__init__(
            message=f"Invalid file type. Allowed types: {', '.join(allowed_types)}",
            error_code="INVALID_FILE_TYPE",
            payload={'allowed_types': allowed_types}
        )


class FileTooLargeException(FileUploadException):
    """File too large"""
    def __init__(self, max_size_mb: int):
        super().__init__(
            message=f"File too large. Maximum size: {max_size_mb}MB",
            error_code="FILE_TOO_LARGE",
            payload={'max_size_mb': max_size_mb}
        )


# ============================================
# Helper Functions
# ============================================

def register_error_handlers(app):
    """Register error handlers for Flask app"""
    from flask import jsonify
    import logging
    
    logger = logging.getLogger(__name__)
    
    @app.errorhandler(APIException)
    def handle_api_exception(error: APIException):
        """Handle custom API exceptions"""
        logger.warning(f"API Exception: {error}", exc_info=True)
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response
    
    @app.errorhandler(404)
    def handle_404(error):
        """Handle 404 Not Found"""
        return jsonify({
            'success': False,
            'error': {
                'code': 'NOT_FOUND',
                'message': 'Không tìm thấy tài nguyên'
            }
        }), 404

    @app.errorhandler(405)
    def handle_405(error):
        """Handle 405 Method Not Allowed"""
        return jsonify({
            'success': False,
            'error': {
                'code': 'METHOD_NOT_ALLOWED',
                'message': 'Phương thức không được phép cho đường dẫn này'
            }
        }), 405

    @app.errorhandler(500)
    def handle_500(error):
        """Handle 500 Internal Server Error"""
        logger.error(f"Internal Server Error: {error}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.'
            }
        }), 500

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Handle unexpected errors"""
        logger.critical(f"Unexpected Error: {error}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'UNEXPECTED_ERROR',
                'message': 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.'
            }
        }), 500
