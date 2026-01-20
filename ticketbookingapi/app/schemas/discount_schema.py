"""
Discount-related validation schemas
"""

from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from datetime import datetime


class DiscountSchema(Schema):
    """Discount model schema for serialization"""
    discount_id = fields.Int(dump_only=True)
    discount_code = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    discount_name = fields.Str(required=True, validate=validate.Length(min=3, max=255))
    discount_type = fields.Str(
        required=True,
        validate=validate.OneOf(['PERCENTAGE', 'FIXED_AMOUNT'])
    )
    discount_value = fields.Decimal(
        required=True,
        as_string=True,
        validate=validate.Range(min=0)
    )
    max_discount_amount = fields.Decimal(allow_none=True, as_string=True)
    min_order_amount = fields.Decimal(missing=0, as_string=True)
    usage_limit = fields.Int(allow_none=True, validate=validate.Range(min=1))
    used_count = fields.Int(dump_only=True)
    start_date = fields.DateTime(required=True)
    end_date = fields.DateTime(required=True)
    is_active = fields.Bool(missing=True)
    created_at = fields.DateTime(dump_only=True)
    manager_id = fields.Int(dump_only=True)
    event_id = fields.Int(allow_none=True)
    
    @validates_schema
    def validate_dates(self, data, **kwargs):
        """Validate discount dates"""
        if data['start_date'] >= data['end_date']:
            raise ValidationError(
                'End date must be after start date',
                field_name='end_date'
            )
    
    @validates_schema
    def validate_discount_value(self, data, **kwargs):
        """Validate discount value based on type"""
        if data['discount_type'] == 'PERCENTAGE':
            if float(data['discount_value']) > 100:
                raise ValidationError(
                    'Percentage discount cannot exceed 100',
                    field_name='discount_value'
                )


class DiscountCreateSchema(Schema):
    """Discount creation schema"""
    discount_code = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    discount_name = fields.Str(required=True, validate=validate.Length(min=3, max=255))
    discount_type = fields.Str(
        required=True,
        validate=validate.OneOf(['PERCENTAGE', 'FIXED_AMOUNT'])
    )
    discount_value = fields.Decimal(
        required=True,
        as_string=True,
        validate=validate.Range(min=0)
    )
    max_discount_amount = fields.Decimal(allow_none=True, as_string=True)
    min_order_amount = fields.Decimal(missing=0, as_string=True)
    usage_limit = fields.Int(allow_none=True, validate=validate.Range(min=1))
    start_date = fields.DateTime(required=True)
    end_date = fields.DateTime(required=True)
    is_active = fields.Bool(missing=True)
    event_id = fields.Int(allow_none=True)
    
    @validates_schema
    def validate_dates(self, data, **kwargs):
        """Validate discount dates"""
        if data['start_date'] >= data['end_date']:
            raise ValidationError(
                'End date must be after start date',
                field_name='end_date'
            )
        
        if data['start_date'] < datetime.now():
            raise ValidationError(
                'Start date must be in the future',
                field_name='start_date'
            )
    
    @validates_schema
    def validate_discount_value(self, data, **kwargs):
        """Validate discount value based on type"""
        if data['discount_type'] == 'PERCENTAGE':
            if float(data['discount_value']) > 100:
                raise ValidationError(
                    'Percentage discount cannot exceed 100',
                    field_name='discount_value'
                )


class DiscountUpdateSchema(Schema):
    """Discount update schema"""
    discount_name = fields.Str(validate=validate.Length(min=3, max=255))
    discount_type = fields.Str(validate=validate.OneOf(['PERCENTAGE', 'FIXED_AMOUNT']))
    discount_value = fields.Decimal(as_string=True, validate=validate.Range(min=0))
    max_discount_amount = fields.Decimal(allow_none=True, as_string=True)
    min_order_amount = fields.Decimal(as_string=True)
    usage_limit = fields.Int(allow_none=True, validate=validate.Range(min=1))
    start_date = fields.DateTime()
    end_date = fields.DateTime()
    is_active = fields.Bool()
    event_id = fields.Int(allow_none=True)
