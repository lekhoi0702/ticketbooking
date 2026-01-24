"""
Authentication and authorization decorators
Refactored version with better error handling and structure
"""

from functools import wraps
from flask import request, g
import jwt
from app.config import Config
from app.exceptions import (
    UnauthorizedException,
    InvalidTokenException,
    TokenExpiredException,
    ForbiddenException,
    InsufficientPermissionException
)
from app.repositories import UserRepository


def get_token_from_header() -> str:
    """
    Extract JWT token from Authorization header
    
    Returns:
        JWT token string
        
    Raises:
        UnauthorizedException: If token not found
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        raise UnauthorizedException('Authorization header is missing')
    
    try:
        # Expected format: "Bearer <token>"
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise InvalidTokenException('Invalid authorization header format. Expected: Bearer <token>')
        
        return parts[1]
    except IndexError:
        raise InvalidTokenException('Invalid authorization header format')


def decode_token(token: str) -> dict:
    """
    Decode and validate JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        TokenExpiredException: If token has expired
        InvalidTokenException: If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            Config.JWT_SECRET_KEY,
            algorithms=['HS256']
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise TokenExpiredException()
    except jwt.InvalidTokenError as e:
        raise InvalidTokenException(f'Invalid token: {str(e)}')


def get_current_user():
    """
    Get current authenticated user from token
    
    Returns:
        User instance
        
    Raises:
        UnauthorizedException: If not authenticated
        InvalidTokenException: If token is invalid
    """
    # Check if already cached in request context
    if hasattr(g, 'current_user'):
        return g.current_user
    
    # Get and decode token
    token = get_token_from_header()
    payload = decode_token(token)
    
    # Get user from database
    user_id = payload.get('user_id')
    if not user_id:
        raise InvalidTokenException('Token does not contain user_id')
    
    user_repo = UserRepository()
    user = user_repo.get_by_id(user_id, raise_if_not_found=False)
    
    if not user:
        raise InvalidTokenException('User not found')
    
    if not user.is_active:
        raise UnauthorizedException('User account is inactive')
    
    # Cache in request context
    g.current_user = user
    g.user_id = user.user_id
    g.role_id = user.role_id
    
    return user


def require_auth(f):
    """
    Decorator to require authentication
    
    Usage:
        @app.route('/api/profile')
        @require_auth
        def get_profile():
            user = g.current_user
            return user.to_dict()
    
    The authenticated user is stored in g.current_user
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Authenticate user
        get_current_user()
        
        # Execute function
        return f(*args, **kwargs)
    
    return decorated_function


def require_role(*allowed_roles):
    """
    Decorator to require specific role(s)
    
    Args:
        *allowed_roles: Role IDs that are allowed (1=User, 2=Organizer, 3=Admin)
    
    Usage:
        @app.route('/api/admin/users')
        @require_role(3)  # Admin only
        def get_users():
            ...
        
        @app.route('/api/organizer/events')
        @require_role(2, 3)  # Organizer or Admin
        def get_events():
            ...
    """
    def decorator(f):
        @wraps(f)
        @require_auth
        def decorated_function(*args, **kwargs):
            user = g.current_user
            
            # Check if user has required role
            if user.role_id not in allowed_roles:
                raise InsufficientPermissionException(
                    f'This action requires one of the following roles: {allowed_roles}'
                )
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator


def require_user(f):
    """
    Decorator to require User role (role_id=1)
    
    Usage:
        @app.route('/api/orders')
        @require_user
        def create_order():
            ...
    """
    return require_role(1)(f)


def require_organizer(f):
    """
    Decorator to require Organizer role (role_id=2 or 3)
    
    Usage:
        @app.route('/api/organizer/events')
        @require_organizer
        def create_event():
            ...
    """
    return require_role(2, 3)(f)


def require_admin(f):
    """
    Decorator to require Admin role (role_id=1)
    
    Usage:
        @app.route('/api/admin/stats')
        @require_admin
        def get_stats():
            ...
    """
    return require_role(1)(f)


def optional_auth(f):
    """
    Decorator for optional authentication
    Sets g.current_user if token is valid, otherwise continues without auth
    
    Usage:
        @app.route('/api/events')
        @optional_auth
        def get_events():
            if hasattr(g, 'current_user'):
                # User is authenticated
                user = g.current_user
            else:
                # Anonymous user
                user = None
            ...
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            get_current_user()
        except (UnauthorizedException, InvalidTokenException, TokenExpiredException):
            # Authentication failed, but that's okay
            pass
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_ownership(resource_user_id_field: str = 'user_id'):
    """
    Decorator to require user owns the resource or is admin
    
    Args:
        resource_user_id_field: Field name in kwargs that contains the resource owner's user_id
    
    Usage:
        @app.route('/api/orders/<int:order_id>')
        @require_auth
        @require_ownership('order_user_id')
        def get_order(order_id, order_user_id):
            # order_user_id must be passed as kwarg
            ...
    """
    def decorator(f):
        @wraps(f)
        @require_auth
        def decorated_function(*args, **kwargs):
            user = g.current_user
            
            # Admin can access everything
            if user.role_id == 3:
                return f(*args, **kwargs)
            
            # Check ownership
            resource_owner_id = kwargs.get(resource_user_id_field)
            if resource_owner_id is None:
                raise ForbiddenException(
                    f'Resource owner ID not provided in {resource_user_id_field}'
                )
            
            if user.user_id != resource_owner_id:
                raise ForbiddenException('You do not have permission to access this resource')
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator
