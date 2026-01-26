"""
Authentication routes with refresh token support, custom exceptions, and structured logging
"""

import os
from flask import Blueprint, jsonify, request
from app.extensions import db, get_redis_token_manager
from app.models.user import User
from app.exceptions import (
    BadRequestException,
    ValidationException,
    UnauthorizedException,
    InvalidCredentialsException,
    InvalidTokenException,
    TokenExpiredException,
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
        
        # Skip email/phone validation for admin login (email = "admin")
        if identifier.lower() != "admin":
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


@auth_bp.route("/auth/forgot-password", methods=["POST"])
def forgot_password() -> Tuple[Dict[str, Any], int]:
    """Quên mật khẩu: gửi link reset password về email."""
    try:
        from app.utils.redis_password_reset_manager import get_redis_password_reset_manager
        from app.utils.email_sender import send_email
        from app.config import Config

        data = request.get_json() or {}
        email = (data.get('email') or '').strip()

        is_valid, err_msg = validate_email(email)
        if not is_valid:
            raise ValidationException(errors={'email': err_msg}, message=err_msg)

        user = User.query.filter_by(email=email).first()
        # Generic success to avoid revealing whether email exists
        if not user:
            logger.info(f"Forgot-password request for unknown email: {email}")
            return jsonify({
                'success': True,
                'message': 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu qua email. Vui lòng kiểm tra hộp thư và thư mục spam.'
            }), 200

        # Get Redis password reset manager
        reset_manager = get_redis_password_reset_manager()
        if not reset_manager:
            raise InternalServerException(message='Dịch vụ đặt lại mật khẩu tạm thời không khả dụng. Vui lòng thử lại sau.')

        # Create reset token (expires in 5 minutes)
        token = reset_manager.create_token(user.user_id, expires_in_minutes=5)

        # Generate reset link
        reset_link = f"{Config.FRONTEND_URL}/reset-password?token={token}"

        subject = 'TicketBooking - Đặt lại mật khẩu'
        body_plain = (
            f'Xin chào {user.full_name},\n\n'
            'Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TicketBooking.\n\n'
            f'Vui lòng nhấp vào link sau để đặt lại mật khẩu:\n{reset_link}\n\n'
            'Link này sẽ hết hạn sau 5 phút.\n\n'
            'Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n'
            'Trân trọng,\nTicketBooking'
        )
        body_html = (
            f'<html><body>'
            f'<p>Xin chào <strong>{user.full_name}</strong>,</p>'
            f'<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TicketBooking.</p>'
            f'<p>Vui lòng nhấp vào link sau để đặt lại mật khẩu:</p>'
            f'<p><a href="{reset_link}" style="background-color: #2DC275; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt lại mật khẩu</a></p>'
            f'<p>Hoặc copy link sau vào trình duyệt:</p>'
            f'<p style="word-break: break-all;">{reset_link}</p>'
            f'<p><small>Link này sẽ hết hạn sau 5 phút.</small></p>'
            f'<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>'
            f'<p>Trân trọng,<br>TicketBooking</p>'
            f'</body></html>'
        )
        
        sent = send_email(user.email, subject, body_plain, body_html)
        if not sent:
            logger.warning(f"Failed to send forgot-password email to {user.email}")
            raise InternalServerException(message='Không thể gửi email. Vui lòng thử lại sau.')

        logger.info(f"Forgot-password email sent to user_id={user.user_id}")
        return jsonify({
            'success': True,
            'message': 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu qua email. Vui lòng kiểm tra hộp thư và thư mục spam.'
        }), 200

    except ValidationException:
        raise
    except Exception as e:
        logger.error(f"Forgot-password error: {str(e)}", exc_info=True)
        raise InternalServerException(message='Đã xảy ra lỗi. Vui lòng thử lại sau.')


@auth_bp.route("/auth/reset-password", methods=["POST"])
def reset_password() -> Tuple[Dict[str, Any], int]:
    """Đặt lại mật khẩu bằng token từ link reset password."""
    try:
        from app.utils.redis_password_reset_manager import get_redis_password_reset_manager

        data = request.get_json() or {}
        token = (data.get('token') or '').strip()
        new_password = data.get('new_password')

        if not token:
            raise ValidationException(
                errors={'token': 'Token không được để trống'},
                message='Token là bắt buộc'
            )

        if not new_password:
            raise ValidationException(
                errors={'new_password': 'Mật khẩu mới không được để trống'},
                message='Vui lòng nhập mật khẩu mới'
            )

        is_valid, err_msg = validate_password(new_password)
        if not is_valid:
            raise ValidationException(errors={'new_password': err_msg}, message=err_msg)

        # Get Redis password reset manager
        reset_manager = get_redis_password_reset_manager()
        if not reset_manager:
            raise InternalServerException(message='Dịch vụ đặt lại mật khẩu tạm thời không khả dụng. Vui lòng thử lại sau.')

        # Verify token
        user_id = reset_manager.verify_token(token)
        if not user_id:
            raise InvalidTokenException(message='Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link đặt lại mật khẩu mới.')

        # Get user
        user = User.query.get(user_id)
        if not user:
            raise ResourceNotFoundException(message='Người dùng không tồn tại')

        if not user.is_active:
            raise ForbiddenException(message='Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.')

        # Update password
        user.set_password(new_password)
        user.must_change_password = False  # Clear flag if set

        # Mark token as used (delete from Redis)
        reset_manager.mark_token_as_used(token)

        # Revoke all existing tokens for this user (security)
        from app.extensions import get_redis_token_manager
        token_manager = get_redis_token_manager()
        if token_manager:
            try:
                token_manager.revoke_all_user_tokens(user.user_id)
            except Exception:
                pass  # Ignore if Redis is unavailable

        db.session.commit()
        logger.info(f"Password reset successful for user_id={user.user_id}")

        return jsonify({
            'success': True,
            'message': 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.'
        }), 200

    except (ValidationException, InvalidTokenException, ResourceNotFoundException, ForbiddenException):
        raise
    except Exception as e:
        db.session.rollback()
        logger.error(f"Reset-password error: {str(e)}", exc_info=True)
        raise InternalServerException(message='Đã xảy ra lỗi. Vui lòng thử lại sau.')


@auth_bp.route("/auth/check-reset-token", methods=["GET"])
def check_reset_token() -> Tuple[Dict[str, Any], int]:
    """Kiểm tra trạng thái token reset password (đã sử dụng, hết hạn, hoặc hợp lệ)."""
    try:
        from app.utils.redis_password_reset_manager import get_redis_password_reset_manager

        token = request.args.get('token', '').strip()
        
        if not token:
            raise ValidationException(
                errors={'token': 'Token không được để trống'},
                message='Token là bắt buộc'
            )

        # Get Redis password reset manager
        reset_manager = get_redis_password_reset_manager()
        if not reset_manager:
            raise InternalServerException(message='Dịch vụ đặt lại mật khẩu tạm thời không khả dụng. Vui lòng thử lại sau.')

        # Check token status
        status_info = reset_manager.check_token_status(token)
        
        if status_info['status'] == 'valid':
            return jsonify({
                'success': True,
                'status': 'valid',
                'message': status_info['message']
            }), 200
        else:
            # Token is used, expired, or not found
            status_code = 400 if status_info['status'] == 'not_found' else 410  # 410 Gone for used/expired
            return jsonify({
                'success': False,
                'status': status_info['status'],
                'message': status_info['message']
            }), status_code

    except ValidationException:
        raise
    except Exception as e:
        logger.error(f"Check-reset-token error: {str(e)}", exc_info=True)
        raise InternalServerException(message='Đã xảy ra lỗi. Vui lòng thử lại sau.')


@auth_bp.route("/auth/change-password", methods=["POST"])
def change_password() -> Tuple[Dict[str, Any], int]:
    """Đổi mật khẩu. Có 2 chế độ:
    - Có old_password: user_id + old + new (không cần JWT).
    - Không có old_password (force): cần JWT, user phải có must_change_password; chỉ gửi new_password.
    """
    try:
        from app.decorators.auth import get_token_from_header, decode_token

        data = request.get_json() or {}
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        user_id = data.get('user_id')

        if not new_password:
            raise ValidationException(
                errors={'new_password': 'Mật khẩu mới không được để trống'},
                message='Vui lòng nhập mật khẩu mới'
            )
        is_valid, err_msg = validate_password(new_password)
        if not is_valid:
            raise ValidationException(errors={'new_password': err_msg}, message=err_msg)

        force_mode = not old_password or (isinstance(old_password, str) and not old_password.strip())

        if force_mode:
            try:
                token = get_token_from_header()
                payload = decode_token(token)
                token_user_id = payload.get('user_id')
                if not token_user_id:
                    raise InvalidTokenException('Token không hợp lệ')
                user = User.query.get(token_user_id)
                if not user:
                    raise ResourceNotFoundException('User', token_user_id)
                if not getattr(user, 'must_change_password', False):
                    raise ForbiddenException(message='Bạn không có quyền đổi mật khẩu ở chế độ này.')
                user_id = user.user_id
            except (InvalidTokenException, TokenExpiredException, UnauthorizedException, ForbiddenException):
                raise
        else:
            if not user_id:
                raise ValidationException(
                    errors={'user_id': 'User ID không được để trống'},
                    message='Vui lòng nhập đầy đủ thông tin'
                )
            user = User.query.get(user_id)
            if not user:
                raise ResourceNotFoundException('User', user_id)
            if not user.check_password(old_password):
                logger.warning(f"Password change failed: Invalid old password - User {user_id}", extra={'user_id': user_id})
                raise InvalidCredentialsException(message='Mật khẩu hiện tại không chính xác')

        user.set_password(new_password)
        user.must_change_password = False
        db.session.commit()

        token_manager = get_redis_token_manager()
        if not token_manager:
            from app.utils.fallback_token_manager import FallbackTokenManager
            token_manager = FallbackTokenManager()
        revoked_count = token_manager.revoke_all_user_tokens(user_id)
        logger.info(f"Revoked {revoked_count} refresh tokens for user {user_id}")

        logger.info(f"Password changed successfully for user: {user_id}", extra={'user_id': user_id})
        return jsonify({'success': True, 'message': 'Đổi mật khẩu thành công'}), 200

    except (ValidationException, ResourceNotFoundException, InvalidCredentialsException, ForbiddenException,
            InvalidTokenException, TokenExpiredException, UnauthorizedException) as e:
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
