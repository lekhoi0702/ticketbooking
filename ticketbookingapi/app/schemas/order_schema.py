"""
Order-related validation schemas
"""

from marshmallow import Schema, fields, validates, ValidationError, validate, validates_schema


class OrderItemSchema(Schema):
    """Order item (ticket type and quantity) schema"""
    ticket_type_id = fields.Int(required=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1, max=50))
    seat_ids = fields.List(fields.Int(), allow_none=True)


class OrderCreateSchema(Schema):
    """Order creation schema"""
    items = fields.List(
        fields.Nested(OrderItemSchema),
        required=True,
        validate=validate.Length(min=1, error='At least one item is required')
    )
    customer_name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    customer_email = fields.Email(required=True)
    customer_phone = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    discount_code = fields.Str(allow_none=True, validate=validate.Length(max=50))
    
    @validates('customer_phone')
    def validate_phone(self, value):
        """Validate phone number"""
        import re
        phone_pattern = r'^(\+84|0)[0-9]{9,10}$'
        if not re.match(phone_pattern, value):
            raise ValidationError('Invalid phone number format')


class OrderSchema(Schema):
    """Order model schema for serialization"""
    order_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    order_code = fields.Str(dump_only=True)
    total_amount = fields.Decimal(as_string=True, dump_only=True)
    final_amount = fields.Decimal(as_string=True, dump_only=True)
    order_status = fields.Str(
        dump_only=True,
        validate=validate.OneOf([
            'PENDING', 'PAID', 'CANCELLED', 'REFUNDED',
            'COMPLETED', 'REFUND_PENDING'
        ])
    )
    customer_name = fields.Str(dump_only=True)
    customer_email = fields.Email(dump_only=True)
    customer_phone = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    paid_at = fields.DateTime(dump_only=True)
    deleted_at = fields.DateTime(dump_only=True)


class OrderCancelSchema(Schema):
    """Order cancellation schema"""
    reason = fields.Str(allow_none=True, validate=validate.Length(max=500))


class DiscountValidationSchema(Schema):
    """Discount code validation schema"""
    discount_code = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    total_amount = fields.Decimal(required=True, as_string=True)
