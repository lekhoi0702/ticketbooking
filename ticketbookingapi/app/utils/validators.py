"""
Validation utilities for TicketBooking API
Centralized validation functions to reduce code duplication
"""

import re
from typing import Optional, Tuple


def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate email format
    
    Args:
        email: Email string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not email:
        return False, "Email không được để trống"
    
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, email):
        return False, "Email không hợp lệ"
    
    return True, None


def validate_phone(phone: str) -> Tuple[bool, Optional[str]]:
    """
    Validate Vietnamese phone number format
    
    Args:
        phone: Phone string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not phone:
        return False, "Số điện thoại không được để trống"
    
    # Vietnamese phone regex: 84 or 0 followed by 3,5,7,8,9 and 8 digits
    phone_regex = r'^(84|0[3|5|7|8|9])+([0-9]{8})\b$'
    if not re.match(phone_regex, phone):
        return False, "Số điện thoại không hợp lệ (phải có 10 chữ số, bắt đầu bằng 0 hoặc 84)"
    
    return True, None


def validate_email_or_phone(identifier: str) -> Tuple[bool, Optional[str]]:
    """
    Validate if input is either email or phone
    
    Args:
        identifier: Email or phone string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not identifier:
        return False, "Email hoặc số điện thoại không được để trống"
    
    email_valid, _ = validate_email(identifier)
    phone_valid, _ = validate_phone(identifier)
    
    if not email_valid and not phone_valid:
        return False, "Email hoặc số điện thoại không hợp lệ"
    
    return True, None


def validate_password(password: str, min_length: int = 6) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength
    
    Args:
        password: Password string to validate
        min_length: Minimum password length
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password:
        return False, "Mật khẩu không được để trống"
    
    if len(password) < min_length:
        return False, f"Mật khẩu phải có ít nhất {min_length} ký tự"
    
    return True, None


def validate_full_name(full_name: str) -> Tuple[bool, Optional[str]]:
    """
    Validate full name
    
    Args:
        full_name: Full name string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not full_name or not full_name.strip():
        return False, "Họ và tên không được để trống"
    
    if len(full_name.strip()) < 2:
        return False, "Họ và tên phải có ít nhất 2 ký tự"
    
    return True, None
