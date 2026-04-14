from flask import Flask
from flask_cors import CORS
from app.extensions import db, migrate, socketio
from app.exceptions import register_error_handlers
from app.utils.logger import setup_logging
from app.config import Config
from app.socket_handlers import register_socket_handlers
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
    register_socket_handlers()

    # Import models to ensure they are registered
    from app.models import (
        Role, User, Organizer, EventCategory, Event, EventQRCode,
        Venue, Seat, TicketType, Order, Payment, Ticket, Discount
    )

    # Register blueprints
    from app.routes.health import health_bp
    from app.routes.chatbot import chatbot_bp
    from app.routes.auth import auth_bp
    from app.routes.roles import roles_bp
    from app.routes.users import users_bp
    from app.routes.organizers import organizers_bp
    from app.routes.categories import categories_bp
    from app.routes.events import events_bp
    from app.routes.venues import venues_bp
    from app.routes.seats import seats_bp
    from app.routes.ticket_types import ticket_types_bp
    from app.routes.orders import orders_bp
    from app.routes.payments import payments_bp
    from app.routes.tickets import tickets_bp
    from app.routes.discounts import discounts_bp
    from app.routes.event_qrcodes import event_qrcodes_bp
    from app.routes.uploads import uploads_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(chatbot_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(roles_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(organizers_bp, url_prefix="/api")
    app.register_blueprint(categories_bp, url_prefix="/api")
    app.register_blueprint(events_bp, url_prefix="/api")
    app.register_blueprint(venues_bp, url_prefix="/api")
    app.register_blueprint(seats_bp, url_prefix="/api")
    app.register_blueprint(ticket_types_bp, url_prefix="/api")
    app.register_blueprint(orders_bp, url_prefix="/api")
    app.register_blueprint(payments_bp, url_prefix="/api")
    app.register_blueprint(tickets_bp, url_prefix="/api")
    app.register_blueprint(discounts_bp, url_prefix="/api")
    app.register_blueprint(event_qrcodes_bp, url_prefix="/api")
    app.register_blueprint(uploads_bp)

    return app
