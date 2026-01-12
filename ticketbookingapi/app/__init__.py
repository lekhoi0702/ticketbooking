from flask import Flask, send_from_directory
from flask_cors import CORS
from app.extensions import db, migrate
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    CORS(app)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Import models to ensure they are registered
    from app.models import (
        Role, User, EventCategory, Venue, Event, 
        TicketType, Order, Payment, Ticket, Discount, Review
    )

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        # Get the project root directory (ticketbooking/)
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        uploads_dir = os.path.join(project_root, 'uploads')
        print(f"Serving file: {filename} from {uploads_dir}")  # Debug log
        return send_from_directory(uploads_dir, filename)

    # Register blueprints
    from app.routes.health import health_bp
    from app.routes.events import events_bp
    from app.routes.categories import categories_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(events_bp, url_prefix="/api")
    app.register_blueprint(categories_bp, url_prefix="/api")

    return app
