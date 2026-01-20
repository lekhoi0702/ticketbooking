"""
Flask application factory - REFACTORED VERSION
Includes: error handlers, logging, new routes
"""

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from app.extensions import db, migrate, socketio
from app.config import Config, config_by_name
from app.exceptions import register_error_handlers
from app.utils.logger import setup_logging, get_logger
import os


def create_app(config_name='development'):
    """
    Application factory pattern
    
    Args:
        config_name: Configuration name (development, production, testing)
    
    Returns:
        Flask app instance
    """
    app = Flask(__name__)
    
    # Load configuration
    config_class = config_by_name.get(config_name, Config)
    app.config.from_object(config_class)
    
    # Validate configuration
    try:
        config_class.validate()
    except ValueError as e:
        print(f"⚠️  Configuration Error: {e}")
        # Continue with warnings in development
        if config_name == 'production':
            raise
    
    # Setup logging
    logger = setup_logging(
        app_name='ticketbooking',
        log_level=app.config.get('LOG_LEVEL', 'INFO'),
        log_file=app.config.get('LOG_FILE'),
        use_json=(config_name == 'production')
    )
    
    logger.info(f"Starting TicketBooking API in {config_name} mode")
    
    # CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', '*').split(','),
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app, cors_allowed_origins=app.config.get('SOCKETIO_CORS_ALLOWED_ORIGINS', '*'))
    
    # Import models to ensure they are registered
    with app.app_context():
        from app.models import (
            Role, User, EventCategory, Venue, Event, 
            TicketType, Order, Payment, Ticket, Discount, 
            Banner, OrganizerInfo, FavoriteEvent
        )
        from app.models.event_deletion_request import EventDeletionRequest
        
        logger.info("Models imported successfully")
    
    # Register error handlers
    register_error_handlers(app)
    logger.info("Error handlers registered")
    
    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        """Serve uploaded files with proper CORS headers"""
        from flask import make_response
        
        # Get uploads directory
        uploads_dir = app.config.get('UPLOAD_FOLDER', 'uploads')
        
        # If relative path, make it absolute
        if not os.path.isabs(uploads_dir):
            current_app_dir = os.path.dirname(os.path.abspath(__file__))
            api_root = os.path.dirname(current_app_dir)
            uploads_dir = os.path.join(api_root, uploads_dir)
        
        full_path = os.path.join(uploads_dir, filename)
        
        logger.debug(f"Serving file: {filename} from {uploads_dir}")
        
        if not os.path.exists(full_path):
            logger.warning(f"File not found: {full_path}")
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FILE_NOT_FOUND',
                    'message': f'File not found: {filename}'
                }
            }), 404
        
        # Send file
        response = make_response(send_from_directory(uploads_dir, filename))
        
        # CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        
        # MIME type fixes
        if filename.lower().endswith('.svg'):
            response.headers['Content-Type'] = 'image/svg+xml'
        
        return response
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Simple health check endpoint"""
        return jsonify({
            'success': True,
            'status': 'healthy',
            'version': app.config.get('APP_VERSION', '2.0.0')
        }), 200
    
    # Register blueprints - ORIGINAL ROUTES (Old Architecture)
    logger.info("Registering original routes...")
    
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
    from app.routes.event_deletion import event_deletion_bp
    from app.routes.organizer_discount import organizer_discount_bp
    from app.routes.banners import banners_bp
    
    # Register original routes with /api prefix
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
    app.register_blueprint(event_deletion_bp, url_prefix="/api")
    app.register_blueprint(organizer_discount_bp, url_prefix="/api")
    app.register_blueprint(banners_bp, url_prefix="/api")
    
    logger.info("Original routes registered")
    
    # Register blueprints - REFACTORED ROUTES (New Architecture)
    logger.info("Registering refactored routes...")
    
    from app.routes.auth_refactored import auth_bp as auth_refactored_bp
    from app.routes.events_refactored import events_bp as events_refactored_bp
    
    # Register refactored routes with /api/v2 prefix
    app.register_blueprint(auth_refactored_bp, url_prefix="/api/v2")
    app.register_blueprint(events_refactored_bp, url_prefix="/api/v2")
    
    logger.info("Refactored routes registered at /api/v2/*")
    
    # Import socket handlers
    logger.info("Registering socket handlers...")
    from app.sockets import seat_socket
    logger.info("Socket handlers registered")
    
    # Log all registered routes
    logger.info("=== Registered Routes ===")
    for rule in app.url_map.iter_rules():
        if not rule.endpoint.startswith('static'):
            logger.info(f"  {rule.endpoint:40} {rule.methods} {rule.rule}")
    logger.info("========================")
    
    logger.info("Application initialization complete")
    
    return app
