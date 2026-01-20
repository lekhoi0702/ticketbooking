"""
Ticket-related validation schemas
"""

from marshmallow import Schema, fields, validate, validates_schema, ValidationError


class TicketSchema(Schema):
    """Ticket model schema for serialization"""
    ticket_id = fields.Int(dump_only=True)
    order_id = fields.Int(dump_only=True)
    ticket_type_id = fields.Int(dump_only=True)
    ticket_code = fields.Str(dump_only=True)
    ticket_status = fields.Str(
        dump_only=True,
        validate=validate.OneOf(['ACTIVE', 'USED', 'CANCELLED', 'REFUNDED'])
    )
    seat_id = fields.Int(dump_only=True, allow_none=True)
    price = fields.Decimal(as_string=True, dump_only=True)
    qr_code_url = fields.Str(dump_only=True, allow_none=True)
    holder_name = fields.Str(dump_only=True, allow_none=True)
    holder_email = fields.Email(dump_only=True, allow_none=True)
    checked_in_at = fields.DateTime(dump_only=True, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    deleted_at = fields.DateTime(dump_only=True)


class TicketTypeSchema(Schema):
    """Ticket type model schema"""
    ticket_type_id = fields.Int(dump_only=True)
    event_id = fields.Int(required=True)
    type_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str(allow_none=True)
    price = fields.Decimal(
        required=True,
        as_string=True,
        validate=validate.Range(min=0)
    )
    quantity = fields.Int(required=True, validate=validate.Range(min=1))
    sold_quantity = fields.Int(dump_only=True)
    sale_start = fields.DateTime(allow_none=True)
    sale_end = fields.DateTime(allow_none=True)
    max_per_order = fields.Int(missing=10, validate=validate.Range(min=1, max=100))
    is_active = fields.Bool(missing=True)
    created_at = fields.DateTime(dump_only=True)
    
    @validates_schema
    def validate_dates(self, data, **kwargs):
        """Validate sale dates"""
        if data.get('sale_start') and data.get('sale_end'):
            if data['sale_start'] >= data['sale_end']:
                raise ValidationError(
                    'Sale end must be after sale start',
                    field_name='sale_end'
                )
    
    @validates_schema
    def validate_max_per_order(self, data, **kwargs):
        """Validate max_per_order doesn't exceed quantity"""
        if data.get('max_per_order') and data.get('quantity'):
            if data['max_per_order'] > data['quantity']:
                raise ValidationError(
                    'Max per order cannot exceed total quantity',
                    field_name='max_per_order'
                )


class TicketTypeCreateSchema(Schema):
    """Ticket type creation schema"""
    event_id = fields.Int(required=True)
    type_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str(allow_none=True)
    price = fields.Decimal(
        required=True,
        as_string=True,
        validate=validate.Range(min=0)
    )
    quantity = fields.Int(required=True, validate=validate.Range(min=1))
    sale_start = fields.DateTime(allow_none=True)
    sale_end = fields.DateTime(allow_none=True)
    max_per_order = fields.Int(missing=10, validate=validate.Range(min=1, max=100))
    is_active = fields.Bool(missing=True)


class TicketCheckInSchema(Schema):
    """Ticket check-in schema"""
    ticket_code = fields.Str(required=True, validate=validate.Length(min=1, max=100))
