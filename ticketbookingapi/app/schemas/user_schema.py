"""
User-related validation schemas
"""

from marshmallow import Schema, fields, validates, ValidationError, validate
import re


class UserSchema(Schema):
    """User model schema for serialization"""
    user_id = fields.Int(dump_only=True)
    role_id = fields.Int(required=True)
    email = fields.Email(required=True)
    full_name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    phone = fields.Str(allow_none=True, validate=validate.Length(max=20))
    is_active = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    @validates('phone')
    def validate_phone(self, value):
        """Validate phone number format"""
        if value:
            # Basic phone validation (Vietnamese format)
            phone_pattern = r'^(\+84|0)[0-9]{9,10}$'
            if not re.match(phone_pattern, value):
                raise ValidationError('Invalid phone number format')


class LoginSchema(Schema):
    """Login request schema"""
    email = fields.Email(required=True, error_messages={'required': 'Email is required'})
    password = fields.Str(
        required=True,
        validate=validate.Length(min=6),
        error_messages={'required': 'Password is required'}
    )


class RegisterSchema(Schema):
    """User registration schema"""
    email = fields.Email(required=True)
    password = fields.Str(
        required=True,
        validate=validate.Length(min=6, max=100),
        load_only=True
    )
    full_name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    phone = fields.Str(allow_none=True, validate=validate.Length(max=20))
    role_id = fields.Int(missing=1)  # Default to user role
    
    @validates('password')
    def validate_password(self, value):
        """Validate password strength"""
        if len(value) < 6:
            raise ValidationError('Password must be at least 6 characters long')
        # Add more validation rules as needed
        # if not re.search(r'[A-Z]', value):
        #     raise ValidationError('Password must contain at least one uppercase letter')
    
    @validates('email')
    def validate_email(self, value):
        """Validate email format"""
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise ValidationError('Invalid email format')


class ChangePasswordSchema(Schema):
    """Change password request schema"""
    old_password = fields.Str(required=True, load_only=True)
    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=6, max=100),
        load_only=True
    )
    confirm_password = fields.Str(required=True, load_only=True)
    
    @validates('new_password')
    def validate_new_password(self, value):
        """Validate new password strength"""
        if len(value) < 6:
            raise ValidationError('Password must be at least 6 characters long')


class UserUpdateSchema(Schema):
    """User update schema"""
    full_name = fields.Str(validate=validate.Length(min=2, max=255))
    phone = fields.Str(allow_none=True, validate=validate.Length(max=20))
    is_active = fields.Bool()
