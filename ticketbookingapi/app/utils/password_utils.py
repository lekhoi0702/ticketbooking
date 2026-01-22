"""
Password utility functions
"""

import secrets
import string
from typing import Optional


def generate_random_password(length: int = 12, include_symbols: bool = False) -> str:
    """
    Generate a secure random password
    
    Args:
        length: Password length (default: 12)
        include_symbols: Whether to include special characters
        
    Returns:
        Random password string
    """
    alphabet = string.ascii_letters + string.digits
    if include_symbols:
        alphabet += "!@#$%^&*"
    
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    # Ensure at least one lowercase, one uppercase, and one digit
    if not any(c.islower() for c in password):
        password = password[:-1] + secrets.choice(string.ascii_lowercase)
    if not any(c.isupper() for c in password):
        password = password[:-1] + secrets.choice(string.ascii_uppercase)
    if not any(c.isdigit() for c in password):
        password = password[:-1] + secrets.choice(string.digits)
    
    return password


def generate_temporary_password() -> str:
    """
    Generate a temporary password for password reset
    Shorter and easier to communicate
    
    Returns:
        Temporary password string (8 characters)
    """
    # Use only alphanumeric for easier communication
    alphabet = string.ascii_letters + string.digits
    # Remove confusing characters
    alphabet = alphabet.replace('0', '').replace('O', '').replace('l', '').replace('I', '')
    
    password = ''.join(secrets.choice(alphabet) for _ in range(8))
    
    # Ensure mix of letters and digits
    if not any(c.isdigit() for c in password):
        password = password[:-1] + secrets.choice(string.digits)
    if not any(c.isalpha() for c in password):
        password = password[:-1] + secrets.choice(string.ascii_letters)
    
    return password
