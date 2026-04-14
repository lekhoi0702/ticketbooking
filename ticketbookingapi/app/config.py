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
    ssl_verify_cert = os.getenv('DB_SSL_VERIFY_CERT', 'False').lower() == 'true'
    ssl_verify_identity = os.getenv('DB_SSL_VERIFY_IDENTITY', 'False').lower() == 'true'

    _connect_args = {}
    if ssl_verify_cert or ssl_verify_identity:
        _connect_args = {
            'ssl_verify_cert': ssl_verify_cert,
            'ssl_verify_identity': ssl_verify_identity,
            'ssl_ca': ssl_ca_path,
        }

    # Database Engine Options
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': _connect_args,
        'pool_recycle': int(os.getenv('DB_POOL_RECYCLE', 280)),
        'pool_pre_ping': os.getenv('DB_POOL_PRE_PING', 'True').lower() == 'true',
        'pool_size': int(os.getenv('DB_POOL_SIZE', 10)),
        'max_overflow': int(os.getenv('DB_MAX_OVERFLOW', 20)),
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File Upload Configuration
    UPLOAD_FOLDER = os.path.join(basedir, os.getenv('UPLOAD_FOLDER', 'uploads'))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,svg').split(','))

    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.path.join(basedir, os.getenv('LOG_FILE', 'logs/app.log'))
    LOG_MAX_BYTES = int(os.getenv('LOG_MAX_BYTES', 10 * 1024 * 1024))
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 10))

    # Application Configuration
    APP_NAME = os.getenv('APP_NAME', 'TicketBooking API')
    APP_VERSION = os.getenv('APP_VERSION', '2.0.0')
    APP_TIMEZONE = os.getenv('APP_TIMEZONE', 'Asia/Ho_Chi_Minh')

    # Gemini Chatbot Configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
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
                "Please check your .env file or environment configuration."
            )

        if os.getenv('SECRET_KEY', '').startswith('dev'):
            print("WARNING: Using development SECRET_KEY. Change this in production!")


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

        secret_key = os.getenv('SECRET_KEY', '')
        if len(secret_key) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters in production')

        if 'dev' in secret_key.lower():
            raise ValueError("SECRET_KEY cannot contain 'dev' in production")


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig,
}
