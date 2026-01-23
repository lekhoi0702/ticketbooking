"""
Swagger/OpenAPI configuration for Ticket Booking API
"""

SWAGGER_CONFIG = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api/docs"
}

SWAGGER_TEMPLATE = {
    "swagger": "2.0",
    "info": {
        "title": "Ticket Booking API",
        "description": "API documentation for Ticket Booking System",
        "version": "1.0.0",
        "contact": {
            "name": "API Support",
            "email": "support@ticketbooking.com"
        }
    },
    "basePath": "/api",
    "schemes": ["http", "https"],
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
        }
    },
    "tags": [
        {
            "name": "Authentication",
            "description": "Endpoints for user authentication and authorization"
        },
        {
            "name": "Events",
            "description": "Endpoints for managing events"
        },
        {
            "name": "Orders",
            "description": "Endpoints for managing orders"
        },
        {
            "name": "Payments",
            "description": "Endpoints for payment processing"
        },
        {
            "name": "Venues",
            "description": "Endpoints for managing venues"
        },
        {
            "name": "Categories",
            "description": "Endpoints for event categories"
        },
        {
            "name": "Organizer",
            "description": "Endpoints for organizer management"
        },
        {
            "name": "Seats",
            "description": "Endpoints for seat management and reservations"
        },
        {
            "name": "Admin",
            "description": "Admin endpoints for system management"
        },
        {
            "name": "Banners",
            "description": "Endpoints for banner management"
        },
        {
            "name": "Health",
            "description": "Health check endpoints"
        }
    ]
}
