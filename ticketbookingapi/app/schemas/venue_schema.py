"""
Venue-related validation schemas
"""

from marshmallow import Schema, fields, validate


class VenueSchema(Schema):
    """Venue model schema for serialization"""
    venue_id = fields.Int(dump_only=True)
    venue_name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    address = fields.Str(required=True, validate=validate.Length(min=5, max=500))
    city = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    capacity = fields.Int(required=True, validate=validate.Range(min=1))
    seat_map_template = fields.Raw(allow_none=True)  # JSON field
    contact_phone = fields.Str(allow_none=True, validate=validate.Length(max=20))
    is_active = fields.Bool(dump_only=True)
    status = fields.Str(dump_only=True, validate=validate.OneOf(['ACTIVE', 'INACTIVE', 'MAINTENANCE']))
    created_at = fields.DateTime(dump_only=True)
    vip_seats = fields.Int(missing=0, validate=validate.Range(min=0))
    standard_seats = fields.Int(missing=0, validate=validate.Range(min=0))
    economy_seats = fields.Int(missing=0, validate=validate.Range(min=0))
    manager_id = fields.Int(dump_only=True)
    map_embed_code = fields.Str(allow_none=True)


class VenueCreateSchema(Schema):
    """Venue creation schema"""
    venue_name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    address = fields.Str(required=True, validate=validate.Length(min=5, max=500))
    city = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    capacity = fields.Int(required=True, validate=validate.Range(min=1))
    seat_map_template = fields.Raw(allow_none=True)
    contact_phone = fields.Str(allow_none=True, validate=validate.Length(max=20))
    vip_seats = fields.Int(missing=0, validate=validate.Range(min=0))
    standard_seats = fields.Int(missing=0, validate=validate.Range(min=0))
    economy_seats = fields.Int(missing=0, validate=validate.Range(min=0))
    map_embed_code = fields.Str(allow_none=True)


class VenueUpdateSchema(Schema):
    """Venue update schema"""
    venue_name = fields.Str(validate=validate.Length(min=2, max=255))
    address = fields.Str(validate=validate.Length(min=5, max=500))
    city = fields.Str(validate=validate.Length(min=2, max=100))
    capacity = fields.Int(validate=validate.Range(min=1))
    seat_map_template = fields.Raw(allow_none=True)
    contact_phone = fields.Str(allow_none=True, validate=validate.Length(max=20))
    is_active = fields.Bool()
    status = fields.Str(validate=validate.OneOf(['ACTIVE', 'INACTIVE', 'MAINTENANCE']))
    vip_seats = fields.Int(validate=validate.Range(min=0))
    standard_seats = fields.Int(validate=validate.Range(min=0))
    economy_seats = fields.Int(validate=validate.Range(min=0))
    map_embed_code = fields.Str(allow_none=True)
