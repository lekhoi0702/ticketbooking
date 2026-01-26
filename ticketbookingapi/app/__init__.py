from flask import Flask, send_from_directory
from flask_cors import CORS
from app.extensions import db, migrate, socketio
from app.exceptions import register_error_handlers
from app.utils.logger import setup_logging
from app.config import Config
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")
    
    # Validate configuration
    Config.validate()

    # Setup logging
    log_file = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        Config.LOG_FILE
    )
    setup_logging(
        app_name='ticketbooking',
        log_level=Config.LOG_LEVEL,
        log_file=log_file,
        max_bytes=Config.LOG_MAX_BYTES,
        backup_count=Config.LOG_BACKUP_COUNT,
        use_json=(Config.FLASK_ENV == 'production')
    )
    
    # Register error handlers
    register_error_handlers(app)

    # CORS configuration - restrict to specific origins in production
    if Config.FLASK_ENV == 'production':
        allowed_origins = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
        if allowed_origins and allowed_origins[0]:
            CORS(app, origins=allowed_origins)
        else:
            CORS(app)  # Fallback if not configured
    else:
        CORS(app)  # Allow all in development

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app, cors_allowed_origins="*", async_mode='threading')
    
    # Initialize Swagger/OpenAPI documentation
    try:
        from flasgger import Swagger
        from app.swagger_config import SWAGGER_CONFIG
        import yaml
        
        # Load Swagger spec from YAML file
        swagger_spec_path = os.path.join(os.path.dirname(__file__), 'swagger_spec.yaml')
        if os.path.exists(swagger_spec_path):
            with open(swagger_spec_path, 'r', encoding='utf-8') as f:
                swagger_template = yaml.safe_load(f)
        else:
            # Fallback to config template if YAML file doesn't exist
            from app.swagger_config import SWAGGER_TEMPLATE
            swagger_template = SWAGGER_TEMPLATE
        
        swagger = Swagger(app, config=SWAGGER_CONFIG, template=swagger_template)
        app.logger.info("Swagger documentation initialized at /api/docs")
    except ImportError:
        app.logger.warning("Flasgger not installed. Swagger documentation will not be available.")
    except Exception as e:
        app.logger.warning(f"Failed to initialize Swagger: {str(e)}")
    
    # Initialize Redis
    from app.extensions import init_redis
    redis_client = init_redis(app)
    
    # Initialize Redis token manager if Redis is available
    if redis_client:
        from app.utils.redis_token_manager import init_redis_token_manager
        init_redis_token_manager(redis_client)
        app.logger.info("Redis token manager initialized")
        
        # Initialize Redis reservation manager
        from app.utils.redis_reservation_manager import init_redis_reservation_manager
        init_redis_reservation_manager(redis_client)
        app.logger.info("Redis reservation manager initialized")
        
        # Initialize Redis password reset manager
        from app.utils.redis_password_reset_manager import init_redis_password_reset_manager
        init_redis_password_reset_manager(redis_client)
        app.logger.info("Redis password reset manager initialized")
    else:
        app.logger.warning("Redis not available - token management will use fallback")
        # Initialize reservation manager with None (will use in-memory fallback)
        from app.utils.redis_reservation_manager import init_redis_reservation_manager
        init_redis_reservation_manager(None)
        app.logger.warning("Redis not available - seat reservation will use in-memory fallback")
        
        # Initialize password reset manager with None (will use in-memory fallback)
        from app.utils.redis_password_reset_manager import init_redis_password_reset_manager
        init_redis_password_reset_manager(None)
        app.logger.warning("Redis not available - password reset will use in-memory fallback")

    # Import models to ensure they are registered
    from app.models import (
        Role, User, EventCategory, Venue, Event, 
        TicketType, Order, Payment, Ticket, Discount, Banner, OrganizerInfo,
        FavoriteEvent, Advertisement
    )
    # Note: DB schema is defined by `ticketbookingdb.sql` (no extra tables like SeatReservation/OrganizerQRCode/...).

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        from flask import make_response
        from app.utils.logger import get_logger
        from app.exceptions import NotFoundException
        
        upload_logger = get_logger('ticketbooking.uploads')
        
        # Dynamic path resolution relative to this file
        # __file__ is .../ticketbookingapi/app/__init__.py
        # We want .../ticketbookingapi/uploads
        current_app_dir = os.path.dirname(os.path.abspath(__file__))  # .../app
        api_root = os.path.dirname(current_app_dir)  # .../ticketbookingapi
        uploads_dir = os.path.join(api_root, 'uploads')
        
        full_path = os.path.join(uploads_dir, filename)
        
        if not os.path.exists(full_path):
            upload_logger.warning(f"File not found: {filename}", extra={'file_path': filename})
            raise NotFoundException(message=f"File not found: {filename}")

        # Send file
        response = make_response(send_from_directory(uploads_dir, filename))
        
        # CORS headers for static files
        if Config.FLASK_ENV == 'production':
            allowed_origins = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
            if allowed_origins and allowed_origins[0]:
                response.headers['Access-Control-Allow-Origin'] = allowed_origins[0]
        else:
            response.headers['Access-Control-Allow-Origin'] = '*'
        
        # MIME type fixes
        if filename.lower().endswith('.svg'):
            response.headers['Content-Type'] = 'image/svg+xml'
        elif filename.lower().endswith(('.jpg', '.jpeg')):
            response.headers['Content-Type'] = 'image/jpeg'
        elif filename.lower().endswith('.png'):
            response.headers['Content-Type'] = 'image/png'
        elif filename.lower().endswith('.webp'):
            response.headers['Content-Type'] = 'image/webp'
            
        return response

    # Register blueprints
    from app.routes.health import health_bp
    from app.routes.events import events_bp
    from app.routes.categories import categories_bp
    from app.routes.organizer import organizer_bp
    from app.routes.venues import venues_bp
    from app.routes.orders import orders_bp
    from app.routes.payments import payments_bp
    from app.routes.admin import admin_bp
    from app.routes.seats import seats_bp
    from app.routes.auth import auth_bp
    from app.routes.organizer_discount import organizer_discount_bp
    from app.routes.banners import banners_bp
    from app.routes.chatbot import chatbot_bp
    from app.routes.advertisement import advertisement_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(events_bp, url_prefix="/api")
    app.register_blueprint(categories_bp, url_prefix="/api")
    app.register_blueprint(organizer_bp, url_prefix="/api")
    app.register_blueprint(venues_bp, url_prefix="/api")
    app.register_blueprint(orders_bp, url_prefix="/api")
    app.register_blueprint(payments_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(seats_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(organizer_discount_bp, url_prefix="/api")
    app.register_blueprint(banners_bp, url_prefix="/api")
    app.register_blueprint(chatbot_bp, url_prefix="/api")
    app.register_blueprint(advertisement_bp)

    # Import socket handlers after app is fully initialized
    # This must be done after socketio.init_app() and after all models are imported
    with app.app_context():
        from app import socket_handlers  # noqa: F401
        # Start cleanup task after app context is available
        socket_handlers.start_cleanup_task(app_instance=app)

    return app