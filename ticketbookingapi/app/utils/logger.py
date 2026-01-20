"""
Structured logging configuration for TicketBooking API
Provides consistent logging across the application
"""

import logging
import logging.handlers
import os
import sys
from datetime import datetime
from typing import Optional
import json


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'ip_address'):
            log_data['ip_address'] = record.ip_address
        
        return json.dumps(log_data)


class ColoredFormatter(logging.Formatter):
    """Colored console formatter for better readability"""
    
    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',     # Cyan
        'INFO': '\033[32m',      # Green
        'WARNING': '\033[33m',   # Yellow
        'ERROR': '\033[31m',     # Red
        'CRITICAL': '\033[35m',  # Magenta
        'RESET': '\033[0m'       # Reset
    }
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record with colors"""
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']
        
        # Format timestamp
        timestamp = datetime.fromtimestamp(record.created).strftime('%Y-%m-%d %H:%M:%S')
        
        # Format message
        message = (
            f"{color}[{record.levelname:8}]{reset} "
            f"{timestamp} | "
            f"{record.name:20} | "
            f"{record.getMessage()}"
        )
        
        # Add exception if present
        if record.exc_info:
            message += f"\n{self.formatException(record.exc_info)}"
        
        return message


def setup_logging(
    app_name: str = 'ticketbooking',
    log_level: str = 'INFO',
    log_file: Optional[str] = None,
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 10,
    use_json: bool = False
) -> logging.Logger:
    """
    Setup application logging with file rotation and console output
    
    Args:
        app_name: Name of the application logger
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Path to log file (None for console only)
        max_bytes: Maximum size of log file before rotation
        backup_count: Number of backup files to keep
        use_json: Use JSON formatter for file logging
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(app_name)
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    logger.handlers.clear()  # Clear existing handlers
    
    # Console Handler (with colors in development)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    
    if os.getenv('FLASK_ENV') == 'production':
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    else:
        console_formatter = ColoredFormatter()
    
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # File Handler (with rotation)
    if log_file:
        # Create log directory if it doesn't exist
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.INFO)
        
        if use_json:
            file_formatter = JSONFormatter()
        else:
            file_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - '
                '%(module)s:%(funcName)s:%(lineno)d - %(message)s'
            )
        
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    
    # Error File Handler (separate file for errors)
    if log_file:
        error_log_file = log_file.replace('.log', '_error.log')
        error_handler = logging.handlers.RotatingFileHandler(
            error_log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        
        if use_json:
            error_formatter = JSONFormatter()
        else:
            error_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - '
                '%(module)s:%(funcName)s:%(lineno)d - %(message)s\n'
                'Exception: %(exc_info)s'
            )
        
        error_handler.setFormatter(error_formatter)
        logger.addHandler(error_handler)
    
    logger.info(f"Logging initialized for {app_name} at level {log_level}")
    
    return logger


def log_request(logger: logging.Logger, request, user_id: Optional[int] = None):
    """
    Log incoming HTTP request
    
    Args:
        logger: Logger instance
        request: Flask request object
        user_id: Optional user ID for tracking
    """
    extra = {
        'ip_address': request.remote_addr,
        'user_id': user_id
    }
    
    logger.info(
        f"{request.method} {request.path} - "
        f"IP: {request.remote_addr} - "
        f"User-Agent: {request.user_agent.string[:100]}",
        extra=extra
    )


def log_response(logger: logging.Logger, response, duration_ms: float):
    """
    Log outgoing HTTP response
    
    Args:
        logger: Logger instance
        response: Flask response object
        duration_ms: Request duration in milliseconds
    """
    logger.info(
        f"Response: {response.status_code} - "
        f"Duration: {duration_ms:.2f}ms"
    )


def log_database_query(logger: logging.Logger, query: str, duration_ms: float):
    """
    Log database query execution
    
    Args:
        logger: Logger instance
        query: SQL query string
        duration_ms: Query duration in milliseconds
    """
    if duration_ms > 100:  # Log slow queries (>100ms)
        logger.warning(
            f"Slow query detected: {duration_ms:.2f}ms - "
            f"Query: {query[:200]}..."
        )
    else:
        logger.debug(
            f"Query executed in {duration_ms:.2f}ms - "
            f"Query: {query[:200]}..."
        )


def log_business_event(
    logger: logging.Logger,
    event_type: str,
    details: dict,
    user_id: Optional[int] = None
):
    """
    Log business event (order created, payment processed, etc.)
    
    Args:
        logger: Logger instance
        event_type: Type of business event
        details: Event details dictionary
        user_id: Optional user ID
    """
    extra = {'user_id': user_id} if user_id else {}
    
    logger.info(
        f"Business Event: {event_type} - Details: {json.dumps(details)}",
        extra=extra
    )


def log_security_event(
    logger: logging.Logger,
    event_type: str,
    details: dict,
    severity: str = 'WARNING'
):
    """
    Log security-related event
    
    Args:
        logger: Logger instance
        event_type: Type of security event
        details: Event details dictionary
        severity: Log severity level
    """
    log_func = getattr(logger, severity.lower(), logger.warning)
    log_func(
        f"Security Event: {event_type} - Details: {json.dumps(details)}"
    )


# Usage example and default logger
def get_logger(name: str = 'ticketbooking') -> logging.Logger:
    """Get or create logger instance"""
    return logging.getLogger(name)
