"""
Event-related validation schemas
"""

from marshmallow import Schema, fields, validates, ValidationError, validate, validates_schema
from datetime import datetime


class EventSchema(Schema):
    """Event model schema for serialization"""
    event_id = fields.Int(dump_only=True)
    category_id = fields.Int(required=True)
    venue_id = fields.Int(required=True)
    manager_id = fields.Int(dump_only=True)
    event_name = fields.Str(required=True, validate=validate.Length(min=3, max=500))
    description = fields.Str(allow_none=True)
    start_datetime = fields.DateTime(required=True)
    end_datetime = fields.DateTime(required=True)
    banner_image_url = fields.Str(allow_none=True, validate=validate.Length(max=500))
    total_capacity = fields.Int(required=True, validate=validate.Range(min=1))
    sold_tickets = fields.Int(dump_only=True)
    status = fields.Str(
        dump_only=True,
        validate=validate.OneOf([
            'DRAFT', 'PENDING_APPROVAL', 'REJECTED',
            'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'
        ])
    )
    is_featured = fields.Bool(missing=False)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    group_id = fields.Str(allow_none=True, validate=validate.Length(max=100))
    deleted_at = fields.DateTime(dump_only=True)
    
    @validates_schema
    def validate_dates(self, data, **kwargs):
        """Validate date relationships"""
        if 'start_datetime' in data and 'end_datetime' in data:
            if data['start_datetime'] >= data['end_datetime']:
                raise ValidationError(
                    'End datetime must be after start datetime',
                    field_name='end_datetime'
                )


class EventCreateSchema(Schema):
    """Event creation schema"""
    category_id = fields.Int(required=True, error_messages={'required': 'Category is required'})
    venue_id = fields.Int(required=True, error_messages={'required': 'Venue is required'})
    event_name = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=500),
        error_messages={'required': 'Event name is required'}
    )
    description = fields.Str(allow_none=True)
    start_datetime = fields.DateTime(
        required=True,
        error_messages={'required': 'Start datetime is required'}
    )
    end_datetime = fields.DateTime(
        required=True,
        error_messages={'required': 'End datetime is required'}
    )
    banner_image_url = fields.Str(allow_none=True, validate=validate.Length(max=500))
    total_capacity = fields.Int(
        required=True,
        validate=validate.Range(min=1, error='Capacity must be at least 1')
    )
    is_featured = fields.Bool(missing=False)
    group_id = fields.Str(allow_none=True, validate=validate.Length(max=100))
    
    @validates_schema
    def validate_dates(self, data, **kwargs):
        """Validate date relationships"""
        # Validate start < end
        if data['start_datetime'] >= data['end_datetime']:
            raise ValidationError(
                'End datetime must be after start datetime',
                field_name='end_datetime'
            )
        
        # Validate start datetime is in the future
        from app.utils.datetime_utils import now_gmt7
        if data['start_datetime'] < now_gmt7():
            raise ValidationError(
                'Start datetime must be in the future',
                field_name='start_datetime'
            )


class EventUpdateSchema(Schema):
    """Event update schema"""
    category_id = fields.Int()
    venue_id = fields.Int()
    event_name = fields.Str(validate=validate.Length(min=3, max=500))
    description = fields.Str(allow_none=True)
    start_datetime = fields.DateTime()
    end_datetime = fields.DateTime()
    banner_image_url = fields.Str(allow_none=True, validate=validate.Length(max=500))
    total_capacity = fields.Int(validate=validate.Range(min=1))
    is_featured = fields.Bool()
    status = fields.Str(
        validate=validate.OneOf([
            'DRAFT', 'PENDING_APPROVAL', 'REJECTED',
            'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'
        ])
    )
    
    @validates_schema
    def validate_dates(self, data, **kwargs):
        """Validate date relationships"""
        if 'start_datetime' in data and 'end_datetime' in data:
            if data['start_datetime'] >= data['end_datetime']:
                raise ValidationError(
                    'End datetime must be after start datetime',
                    field_name='end_datetime'
                )


class EventFilterSchema(Schema):
    """Event filter/search schema"""
    category_id = fields.Int(allow_none=True)
    city = fields.Str(allow_none=True)
    status = fields.Str(
        allow_none=True,
        validate=validate.OneOf([
            'DRAFT', 'PENDING_APPROVAL', 'REJECTED',
            'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'
        ])
    )
    is_featured = fields.Bool(allow_none=True)
    start_date_from = fields.DateTime(allow_none=True)
    start_date_to = fields.DateTime(allow_none=True)
    search = fields.Str(allow_none=True, validate=validate.Length(max=255))
    page = fields.Int(missing=1, validate=validate.Range(min=1))
    per_page = fields.Int(missing=20, validate=validate.Range(min=1, max=100))
