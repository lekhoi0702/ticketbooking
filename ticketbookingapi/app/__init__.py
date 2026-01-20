from flask import Flask, send_from_directory
from flask_cors import CORS
from app.extensions import db, migrate, socketio
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    CORS(app)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)

    # Import models to ensure they are registered
    from app.models import (
        Role, User, EventCategory, Venue, Event, 
        TicketType, Order, Payment, Ticket, Discount, Banner, OrganizerInfo,
        FavoriteEvent
    )
    from app.models.event_deletion_request import EventDeletionRequest

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        from flask import make_response, abort
        
        # Dynamic path resolution relative to this file
        # __file__ is .../ticketbookingapi/app/__init__.py
        # We want .../ticketbooking/uploads
        current_app_dir = os.path.dirname(os.path.abspath(__file__)) # .../app
        api_root = os.path.dirname(current_app_dir) # .../ticketbookingapi
        project_root = os.path.dirname(api_root) # .../ticketbooking
        uploads_dir = os.path.join(project_root, 'uploads')
        
        full_path = os.path.join(uploads_dir, filename)
        
        # Debug logging
        print(f"-------- UPLOAD DEBUG --------")
        print(f"Request: {filename}")
        print(f"Looking in: {full_path}")
        print(f"Exists: {os.path.exists(full_path)}")
        
        if not os.path.exists(full_path):
             print(f"ERROR: File not found!")
             return f"File not found: {full_path}", 404

        # Send file
        response = make_response(send_from_directory(uploads_dir, filename))
        
        # CORS headers for static files
        response.headers['Access-Control-Allow-Origin'] = '*'
        
        # MIME type fixes
        if filename.lower().endswith('.svg'):
            response.headers['Content-Type'] = 'image/svg+xml'
            
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
    
    # Import socket handlers to register them
    from app.sockets import seat_socket

    return app