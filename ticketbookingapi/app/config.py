import os
from dotenv import load_dotenv

# Load environment variables from .env file
basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(basedir, '.env'))


class Config:
    """Base configuration class with environment variables"""
    
    # Flask Configuration
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-please-change')
    
    # Database Configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'ticketbookingdb')
    
    # Build database URI
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@"
        f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    
    # SSL Configuration
    ssl_ca_path = os.path.join(basedir, os.getenv('DB_SSL_CA', 'CA_cert.pem'))
    ssl_verify_cert = os.getenv('DB_SSL_VERIFY_CERT', 'True').lower() == 'true'
    ssl_verify_identity = os.getenv('DB_SSL_VERIFY_IDENTITY', 'True').lower() == 'true'
    
    # Database Engine Options
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {
            'ssl_verify_cert': ssl_verify_cert,
            'ssl_verify_identity': ssl_verify_identity,
            'ssl_ca': ssl_ca_path
        },
        'pool_recycle': int(os.getenv('DB_POOL_RECYCLE', 280)),
        'pool_pre_ping': os.getenv('DB_POOL_PRE_PING', 'True').lower() == 'true',
        'pool_size': int(os.getenv('DB_POOL_SIZE', 10)),
        'max_overflow': int(os.getenv('DB_MAX_OVERFLOW', 20))
    }
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 2592000))
    
    # Redis Configuration
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    REDIS_DECODE_RESPONSES = True
    REDIS_SOCKET_TIMEOUT = int(os.getenv('REDIS_SOCKET_TIMEOUT', 5))
    REDIS_SOCKET_CONNECT_TIMEOUT = int(os.getenv('REDIS_SOCKET_CONNECT_TIMEOUT', 5))
    
    # Redis Key Prefixes
    REDIS_KEY_PREFIX = os.getenv('REDIS_KEY_PREFIX', 'ticketbooking:')
    REDIS_REFRESH_TOKEN_PREFIX = f"{REDIS_KEY_PREFIX}refresh_token:"
    REDIS_BLACKLIST_PREFIX = f"{REDIS_KEY_PREFIX}blacklist:"
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.path.join(basedir, os.getenv('UPLOAD_FOLDER', 'uploads'))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,svg').split(','))
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.path.join(basedir, os.getenv('LOG_FILE', 'logs/app.log'))
    LOG_MAX_BYTES = int(os.getenv('LOG_MAX_BYTES', 10 * 1024 * 1024))  # 10MB
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 10))
    
    # Application Configuration
    APP_NAME = os.getenv('APP_NAME', 'TicketBooking API')
    APP_VERSION = os.getenv('APP_VERSION', '2.0.0')
    
    # Gemini Chatbot Configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    # Default to gemini-2.5-flash (latest stable model)
    # Alternative models: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
    CHATBOT_ENABLED = os.getenv('CHATBOT_ENABLED', 'true').lower() == 'true'
    
    @staticmethod
    def validate():
        """Validate required environment variables"""
        required_vars = ['SECRET_KEY', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing_vars)}\n"
                f"Please check your .env file or environment configuration."
            )
        
        # Warn about insecure defaults
        if os.getenv('SECRET_KEY', '').startswith('dev'):
            print("⚠️  WARNING: Using development SECRET_KEY. Change this in production!")
        
        if os.getenv('JWT_SECRET_KEY', '').startswith('dev') or os.getenv('JWT_SECRET_KEY', '').startswith('jwt'):
            print("⚠️  WARNING: Using development JWT_SECRET_KEY. Change this in production!")


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'
    
    @staticmethod
    def validate():
        """Additional validation for production"""
        Config.validate()
        
        # Ensure production secrets are strong
        secret_key = os.getenv('SECRET_KEY', '')
        if len(secret_key) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters in production")
        
        if 'dev' in secret_key.lower():
            raise ValueError("SECRET_KEY cannot contain 'dev' in production")


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


# Config dictionary for easy access
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

