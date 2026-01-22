"""
Authentication routes with refresh token support, custom exceptions, and structured logging
"""

from flask import Blueprint, jsonify, request
from app.extensions import db, get_redis_token_manager
from app.models.user import User
from app.exceptions import (
    BadRequestException,
    ValidationException,
    UnauthorizedException,
    InvalidCredentialsException,
    ForbiddenException,
    DuplicateResourceException,
    ResourceNotFoundException,
    InternalServerException
)
from app.utils.validators import (
    validate_email,
    validate_phone,
    validate_email_or_phone,
    validate_password,
    validate_full_name
)
from app.utils.logger import get_logger
from typing import Dict, Any, Optional, Tuple

auth_bp = Blueprint("auth", __name__)
logger = get_logger('ticketbooking.auth')


@auth_bp.route("/auth/login", methods=["POST"])
def login() -> Tuple[Dict[str, Any], int]:
    """
    Đăng nhập người dùng bằng email, SĐT hoặc username (identifier)
    Returns access token and refresh token
    """
    try:
        data = request.get_json() or {}
        identifier = data.get('email') or data.get('username') or data.get('identifier')
        password = data.get('password')
        required_role = data.get('required_role')  # Optional: ADMIN, ORGANIZER, USER
        
        # Validation
        if not identifier or not password:
            raise ValidationException(
                errors={'identifier': 'Email hoặc số điện thoại không được để trống', 'password': 'Mật khẩu không được để trống'},
                message='Vui lòng nhập đầy đủ thông tin'
            )
        
        is_valid, error_msg = validate_email_or_phone(identifier)
        if not is_valid:
            raise ValidationException(
                errors={'identifier': error_msg},
                message=error_msg
            )
        
        # Try to find user by email or phone
        user = User.query.filter((User.email == identifier) | (User.phone == identifier)).first()
        
        if not user or not user.check_password(password):
            logger.warning(f"Failed login attempt: {identifier}", extra={'ip_address': request.remote_addr})
            raise InvalidCredentialsException()
        
        if not user.is_active:
            logger.warning(f"Login attempt for inactive account: {user.user_id}", extra={'user_id': user.user_id})
            raise ForbiddenException(message='Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.')
        
        user_data = user.to_dict()
        
        # Check for required role if specified
        if required_role and user_data['role'] != required_role:
            role_names = {
                'ADMIN': 'Quản trị viên',
                'ORGANIZER': 'Nhà tổ chức',
                'USER': 'Khách hàng'
            }
            actual_role = role_names.get(user_data['role'], user_data['role'])
            raise ForbiddenException(
                message=f'Tài khoản này là {actual_role}. Vui lòng đăng nhập tại trang dành cho {actual_role}.'
            )
        
        # Get Redis token manager (with fallback)
        token_manager = get_redis_token_manager()
        if not token_manager:
            from app.utils.fallback_token_manager import FallbackTokenManager
            logger.warning("Redis not available, using fallback token manager")
            token_manager = FallbackTokenManager()
        
        # Generate tokens
        access_token = token_manager.generate_access_token(user.user_id, user_data['role'])
        refresh_token_str = token_manager.generate_refresh_token(
            user_id=user.user_id,
            expires_in_days=30,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else None
        )
        
        logger.info(f"User logged in successfully: {user.user_id}", extra={'user_id': user.user_id})
        
        return jsonify({
            'success': True,
            'message': 'Đăng nhập thành công',
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token_str,
                'token_type': 'Bearer',
                'expires_in': 24 * 3600,  # 24 hours in seconds
                'user': user_data
            }
        }), 200
        
    except (ValidationException, InvalidCredentialsException, ForbiddenException) as e:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True, extra={'ip_address': request.remote_addr})
        raise InternalServerException(message='Đã xảy ra lỗi khi đăng nhập')


@auth_bp.route("/auth/refresh", methods=["POST"])
def refresh_token() -> Tuple[Dict[str, Any], int]:
    """
    Refresh access token using refresh token
    """
    try:
        data = request.get_json() or {}
        refresh_token_str = data.get('refresh_token')
        
        if not refresh_token_str:
            raise ValidationException(
                errors={'refresh_token': 'Refresh token không được để trống'},
                message='Refresh token là bắt buộc'
            )
        
        # Get Redis token manager (with fallback)
        token_manager = get_redis_token_manager()
        if not token_manager:
            from app.utils.fallback_token_manager import FallbackTokenManager
            logger.warning("Redis not available, using fallback token manager")
            token_manager = FallbackTokenManager()
        
        # Verify refresh token
        payload = token_manager.verify_token(refresh_token_str, token_type='refresh')
        
        if not payload:
            raise InvalidCredentialsException(message='Refresh token không hợp lệ hoặc đã hết hạn')
        
        user_id = payload.get('user_id')
        if not user_id:
            raise InvalidCredentialsException(message='Token không hợp lệ')
        
        # Get user
        user = User.query.get(user_id)
        if not user or not user.is_active:
            raise InvalidCredentialsException(message='Người dùng không tồn tại hoặc đã bị khóa')
        
        # Generate new access token
        user_data = user.to_dict()
        access_token = token_manager.generate_access_token(user.user_id, user_data['role'])
        
        logger.info(f"Token refreshed for user: {user.user_id}", extra={'user_id': user.user_id})
        
        return jsonify({
            'success': True,
            'message': 'Token đã được làm mới',
            'data': {
                'access_token': access_token,
                'token_type': 'Bearer',
                'expires_in': 24 * 3600
            }
        }), 200
        
    except (ValidationException, InvalidCredentialsException) as e:
        raise
    except Exception as e:
        logger.error(f"Refresh token error: {str(e)}", exc_info=True)
        raise InternalServerException(message='Đã xảy ra lỗi khi làm mới token')


@auth_bp.route("/auth/register", methods=["POST"])
def register() -> Tuple[Dict[str, Any], int]:
    """Đăng ký tài khoản mới cho khách hàng"""
    try:
        data = request.get_json() or {}
        
        # Validation
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        full_name = data.get('full_name', '').strip()
        password = data.get('password', '')
        
        errors = {}
        
        # Validate email
        is_valid, error_msg = validate_email(email)
        if not is_valid:
            errors['email'] = error_msg
        
        # Validate phone
        if phone:
            is_valid, error_msg = validate_phone(phone)
            if not is_valid:
                errors['phone'] = error_msg
        
        # Validate full name
        is_valid, error_msg = validate_full_name(full_name)
        if not is_valid:
            errors['full_name'] = error_msg
        
        # Validate password
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            errors['password'] = error_msg
        
        if errors:
            raise ValidationException(errors=errors, message='Dữ liệu không hợp lệ')
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            raise DuplicateResourceException('User', 'email', email)
        
        # Check if phone already exists
        if phone and User.query.filter_by(phone=phone).first():
            raise DuplicateResourceException('User', 'phone', phone)
        
        # Create new user
        new_user = User(
            email=email,
            full_name=full_name,
            phone=phone if phone else None,
            role_id=3,  # Default to Customer (USER)
            is_active=True
        )
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        logger.info(f"New user registered: {new_user.user_id}", extra={'user_id': new_user.user_id})
        
        return jsonify({
            'success': True,
            'message': 'Đăng ký thành công',
            'data': {
                'user_id': new_user.user_id,
                'email': new_user.email
            }
        }), 201
        
    except (ValidationException, DuplicateResourceException) as e:
        raise
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        raise InternalServerException(message='Đã xảy ra lỗi khi đăng ký')


@auth_bp.route("/auth/change-password", methods=["POST"])
def change_password() -> Tuple[Dict[str, Any], int]:
    """Đổi mật khẩu người dùng - requires authentication"""
    try:
        # TODO: Add authentication decorator
        data = request.get_json() or {}
        user_id = data.get('user_id')
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        errors = {}
        
        if not user_id:
            errors['user_id'] = 'User ID không được để trống'
        if not old_password:
            errors['old_password'] = 'Mật khẩu hiện tại không được để trống'
        if not new_password:
            errors['new_password'] = 'Mật khẩu mới không được để trống'
        
        if errors:
            raise ValidationException(errors=errors, message='Vui lòng nhập đầy đủ thông tin')
        
        # Validate new password
        is_valid, error_msg = validate_password(new_password)
        if not is_valid:
            raise ValidationException(errors={'new_password': error_msg}, message=error_msg)
        
        # Find user
        user = User.query.get(user_id)
        if not user:
            raise ResourceNotFoundException('User', user_id)
        
        # Verify old password
        if not user.check_password(old_password):
            logger.warning(f"Password change failed: Invalid old password - User {user_id}", extra={'user_id': user_id})
            raise InvalidCredentialsException(message='Mật khẩu hiện tại không chính xác')
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        # Revoke all refresh tokens for security
        token_manager = get_redis_token_manager()
        if not token_manager:
            from app.utils.fallback_token_manager import FallbackTokenManager
            token_manager = FallbackTokenManager()
        
        revoked_count = token_manager.revoke_all_user_tokens(user_id)
        logger.info(f"Revoked {revoked_count} refresh tokens for user {user_id}")
        
        logger.info(f"Password changed successfully for user: {user_id}", extra={'user_id': user_id})
        
        return jsonify({
            'success': True,
            'message': 'Đổi mật khẩu thành công'
        }), 200
        
    except (ValidationException, ResourceNotFoundException, InvalidCredentialsException) as e:
        raise
    except Exception as e:
        db.session.rollback()
        logger.error(f"Change password error: {str(e)}", exc_info=True)
        raise InternalServerException(message='Đã xảy ra lỗi khi đổi mật khẩu')


@auth_bp.route("/auth/logout", methods=["POST"])
def logout() -> Tuple[Dict[str, Any], int]:
    """
    Logout user by revoking refresh token
    """
    try:
        data = request.get_json() or {}
        refresh_token_str = data.get('refresh_token')
        
        if not refresh_token_str:
            raise ValidationException(
                errors={'refresh_token': 'Refresh token không được để trống'},
                message='Refresh token là bắt buộc'
            )
        
        # Get Redis token manager (with fallback)
        token_manager = get_redis_token_manager()
        if not token_manager:
            from app.utils.fallback_token_manager import FallbackTokenManager
            logger.warning("Redis not available, using fallback token manager")
            token_manager = FallbackTokenManager()
        
        # Revoke token
        token_manager.revoke_token(refresh_token_str)
        
        # Try to get user_id from token for logging
        try:
            import jwt
            from app.config import Config
            payload = jwt.decode(refresh_token_str, Config.JWT_SECRET_KEY, algorithms=["HS256"], options={"verify_exp": False})
            user_id = payload.get('user_id')
            if user_id:
                logger.info(f"User logged out: {user_id}", extra={'user_id': user_id})
        except Exception:
            pass
        
        return jsonify({
            'success': True,
            'message': 'Đăng xuất thành công'
        }), 200
        
    except ValidationException as e:
        raise
    except Exception as e:
        logger.error(f"Logout error: {str(e)}", exc_info=True)
        raise InternalServerException(message='Đã xảy ra lỗi khi đăng xuất')
