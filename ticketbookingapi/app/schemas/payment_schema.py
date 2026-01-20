"""
Payment-related validation schemas
"""

from marshmallow import Schema, fields, validate


class PaymentSchema(Schema):
    """Payment model schema for serialization"""
    payment_id = fields.Int(dump_only=True)
    order_id = fields.Int(dump_only=True)
    payment_code = fields.Str(dump_only=True)
    payment_method = fields.Str(
        dump_only=True,
        validate=validate.OneOf([
            'CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET',
            'MOMO', 'VNPAY', 'CASH'
        ])
    )
    transaction_id = fields.Str(dump_only=True)
    amount = fields.Decimal(as_string=True, dump_only=True)
    payment_status = fields.Str(
        dump_only=True,
        validate=validate.OneOf(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'])
    )
    paid_at = fields.DateTime(dump_only=True)
    payment_date = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class PaymentCreateSchema(Schema):
    """Payment creation schema"""
    order_id = fields.Int(required=True)
    payment_method = fields.Str(
        required=True,
        validate=validate.OneOf([
            'CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET',
            'MOMO', 'VNPAY', 'CASH'
        ])
    )
    transaction_id = fields.Str(allow_none=True, validate=validate.Length(max=255))
    amount = fields.Decimal(required=True, as_string=True)


class PaymentCallbackSchema(Schema):
    """Payment gateway callback schema"""
    order_code = fields.Str(required=True)
    transaction_id = fields.Str(required=True)
    amount = fields.Decimal(required=True, as_string=True)
    status = fields.Str(required=True, validate=validate.OneOf(['SUCCESS', 'FAILED']))
    payment_method = fields.Str(required=True)
    signature = fields.Str(required=True)  # For security verification
