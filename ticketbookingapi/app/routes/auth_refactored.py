"""
Authentication routes - REFACTORED VERSION
Demonstrates new architecture with:
- Marshmallow validation
- Repository pattern
- Custom exceptions
- Structured logging
- Decorators
- Clean code structure
"""

from flask import Blueprint, jsonify, g
from datetime import datetime, timedelta
import jwt

from app.config import Config
from app.schemas import LoginSchema, RegisterSchema, ChangePasswordSchema, UserSchema
from app.repositories import UserRepository
from app.decorators import validate_schema, require_auth
from app.exceptions import (
    InvalidCredentialsException,
    UnauthorizedException,
    DuplicateResourceException,
    ResourceNotFoundException
)
from app.utils.logger import get_logger
from app.extensions import db

# Initialize
auth_bp = Blueprint("auth_refactored", __name__)
logger = get_logger(__name__)
user_repo = UserRepository()


def generate_token(user_id: int, role: str, expires_in_hours: int = 24) -> str:
    """
    Generate JWT token
    
    Args:
        user_id: User ID
        role: User role (USER, ORGANIZER, ADMIN)
        expires_in_hours: Token expiration time in hours
        
    Returns:
        JWT token string
    """
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=expires_in_hours)
    }
    
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
    return token


def get_role_name(role_id: int) -> str:
    """Map role ID to role name"""
    role_map = {
        1: 'USER',
        2: 'ORGANIZER',
        3: 'ADMIN'
    }
    return role_map.get(role_id, 'UNKNOWN')


@auth_bp.route("/auth/login", methods=["POST"])
@validate_schema(LoginSchema())
def login():
    """
    User login endpoint
    
    Request Body:
        {
            "email": "user@example.com",
            "password": "password123"
        }
    
    Response:
        {
            "success": true,
            "token": "jwt_token_here",
            "user": {
                "user_id": 1,
                "email": "user@example.com",
                "full_name": "John Doe",
                "role": "USER"
            }
        }
    """
    try:
        data = g.validated_data
        
        logger.info(f"Login attempt for email: {data['email']}")
        
        # Find user by email
        user = user_repo.get_by_email(data['email'])
        
        if not user:
            logger.warning(f"Login failed: User not found - {data['email']}")
            raise InvalidCredentialsException()
        
        # Check password
        if not user.check_password(data['password']):
            logger.warning(f"Login failed: Invalid password - {data['email']}")
            raise InvalidCredentialsException()
        
        # Check if account is active
        if not user.is_active:
            logger.warning(f"Login failed: Account inactive - {data['email']}")
            raise UnauthorizedException(
                'Your account is inactive. Please contact support.'
            )
        
        # Generate token
        role_name = get_role_name(user.role_id)
        token = generate_token(user.user_id, role_name)
        
        # Serialize user data
        user_schema = UserSchema()
        user_data = user_schema.dump(user)
        user_data['role'] = role_name
        
        logger.info(f"Login successful: {user.email} (ID: {user.user_id})")
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user_data
        }), 200
        
    except (InvalidCredentialsException, UnauthorizedException) as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'LOGIN_ERROR',
                'message': 'An error occurred during login'
            }
        }), 500


@auth_bp.route("/auth/register", methods=["POST"])
@validate_schema(RegisterSchema())
def register():
    """
    User registration endpoint
    
    Request Body:
        {
            "email": "user@example.com",
            "password": "password123",
            "full_name": "John Doe",
            "phone": "+84901234567" (optional)
        }
    
    Response:
        {
            "success": true,
            "message": "Registration successful",
            "user": {
                "user_id": 1,
                "email": "user@example.com",
                "full_name": "John Doe"
            }
        }
    """
    try:
        data = g.validated_data
        
        logger.info(f"Registration attempt for email: {data['email']}")
        
        # Check if email already exists
        if user_repo.email_exists(data['email']):
            logger.warning(f"Registration failed: Email exists - {data['email']}")
            raise DuplicateResourceException('User', 'email', data['email'])
        
        # Hash password
        from app.models.user import User
        temp_user = User()
        temp_user.set_password(data['password'])
        password_hash = temp_user.password_hash
        
        # Create user
        user = user_repo.create_user(
            email=data['email'],
            password_hash=password_hash,
            full_name=data['full_name'],
            role_id=data.get('role_id', 1),  # Default: User role
            phone=data.get('phone')
        )
        
        # Commit transaction
        db.session.commit()
        
        # Serialize response
        user_schema = UserSchema()
        user_data = user_schema.dump(user)
        
        logger.info(f"Registration successful: {user.email} (ID: {user.user_id})")
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': user_data
        }), 201
        
    except DuplicateResourceException as e:
        db.session.rollback()
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'REGISTRATION_ERROR',
                'message': 'An error occurred during registration'
            }
        }), 500


@auth_bp.route("/auth/change-password", methods=["POST"])
@require_auth
@validate_schema(ChangePasswordSchema())
def change_password():
    """
    Change password endpoint (requires authentication)
    
    Request Body:
        {
            "old_password": "old_password123",
            "new_password": "new_password123",
            "confirm_password": "new_password123"
        }
    
    Response:
        {
            "success": true,
            "message": "Password changed successfully"
        }
    """
    try:
        data = g.validated_data
        user = g.current_user
        
        logger.info(f"Password change attempt for user: {user.user_id}")
        
        # Verify old password
        if not user.check_password(data['old_password']):
            logger.warning(f"Password change failed: Invalid old password - User {user.user_id}")
            raise InvalidCredentialsException('Current password is incorrect')
        
        # Check if new password matches confirm
        if data['new_password'] != data['confirm_password']:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'PASSWORD_MISMATCH',
                    'message': 'New password and confirmation do not match'
                }
            }), 400
        
        # Update password
        user.set_password(data['new_password'])
        db.session.commit()
        
        logger.info(f"Password changed successfully for user: {user.user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
        
    except InvalidCredentialsException as e:
        db.session.rollback()
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        db.session.rollback()
        logger.error(f"Password change error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'PASSWORD_CHANGE_ERROR',
                'message': 'An error occurred while changing password'
            }
        }), 500


@auth_bp.route("/auth/me", methods=["GET"])
@require_auth
def get_current_user_info():
    """
    Get current authenticated user info
    
    Response:
        {
            "success": true,
            "user": {
                "user_id": 1,
                "email": "user@example.com",
                "full_name": "John Doe",
                "role": "USER"
            }
        }
    """
    try:
        user = g.current_user
        
        # Serialize user
        user_schema = UserSchema()
        user_data = user_schema.dump(user)
        user_data['role'] = get_role_name(user.role_id)
        
        return jsonify({
            'success': True,
            'user': user_data
        }), 200
        
    except Exception as e:
        logger.error(f"Get user info error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'USER_INFO_ERROR',
                'message': 'An error occurred while fetching user info'
            }
        }), 500


@auth_bp.route("/auth/refresh-token", methods=["POST"])
@require_auth
def refresh_token():
    """
    Refresh JWT token
    
    Response:
        {
            "success": true,
            "token": "new_jwt_token_here"
        }
    """
    try:
        user = g.current_user
        
        # Generate new token
        role_name = get_role_name(user.role_id)
        new_token = generate_token(user.user_id, role_name)
        
        logger.info(f"Token refreshed for user: {user.user_id}")
        
        return jsonify({
            'success': True,
            'token': new_token
        }), 200
        
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'TOKEN_REFRESH_ERROR',
                'message': 'An error occurred while refreshing token'
            }
        }), 500
