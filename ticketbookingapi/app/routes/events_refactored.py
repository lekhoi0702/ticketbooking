"""
Events routes - REFACTORED VERSION
Public event endpoints with new architecture
"""

from flask import Blueprint, jsonify, request, g
from typing import List, Dict, Any

from app.schemas import EventSchema, EventFilterSchema, TicketTypeSchema
from app.repositories import EventRepository, TicketTypeRepository
from app.decorators import validate_query_params, optional_auth
from app.exceptions import ResourceNotFoundException
from app.utils.logger import get_logger
from app.models.event import Event
from app.extensions import db

# Initialize
events_bp = Blueprint("events_refactored", __name__)
logger = get_logger(__name__)
event_repo = EventRepository()
ticket_type_repo = TicketTypeRepository()


@events_bp.route("/events", methods=["GET"])
@validate_query_params(EventFilterSchema())
@optional_auth
def get_events():
    """
    Get events with filtering and pagination
    
    Query Parameters:
        - category_id: Filter by category
        - city: Filter by city
        - status: Filter by status (default: PUBLISHED)
        - is_featured: Filter featured events
        - start_date_from: Events starting after this date
        - start_date_to: Events starting before this date
        - search: Search in event name/description
        - page: Page number (default: 1)
        - per_page: Items per page (default: 20)
    
    Response:
        {
            "success": true,
            "data": [...],
            "pagination": {
                "page": 1,
                "per_page": 20,
                "total": 100,
                "pages": 5
            }
        }
    """
    try:
        filters = request.validated_data
        
        # Extract pagination params
        page = filters.pop('page', 1)
        per_page = filters.pop('per_page', 20)
        search = filters.pop('search', None)
        
        logger.info(f"Fetching events: page={page}, filters={filters}")
        
        # Search if search term provided
        if search:
            events = event_repo.search_events(search, limit=per_page)
            total = len(events)
        else:
            # Get paginated events
            events, total = event_repo.get_events_with_pagination(
                page=page,
                per_page=per_page,
                filters=filters
            )
        
        # Serialize events
        event_schema = EventSchema(many=True)
        events_data = event_schema.dump(events)
        
        # Calculate pagination info
        total_pages = (total + per_page - 1) // per_page
        
        return jsonify({
            'success': True,
            'data': events_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': total_pages
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching events: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'FETCH_EVENTS_ERROR',
                'message': 'An error occurred while fetching events'
            }
        }), 500


@events_bp.route("/events/<int:event_id>", methods=["GET"])
@optional_auth
def get_event(event_id: int):
    """
    Get single event by ID with full details
    
    Response:
        {
            "success": true,
            "data": {
                "event_id": 1,
                "event_name": "Concert",
                "description": "...",
                "ticket_types": [...],
                "venue": {...},
                "category": {...},
                "showtimes": [...]  // if part of group
            }
        }
    """
    try:
        logger.info(f"Fetching event: {event_id}")
        
        # Get event
        event = event_repo.get_by_id(event_id, raise_if_not_found=False)
        
        if not event or event.deleted_at:
            raise ResourceNotFoundException('Event', event_id)
        
        # Get event data
        event_schema = EventSchema()
        event_data = event_schema.dump(event)
        
        # Get ticket types
        ticket_types = ticket_type_repo.get_event_ticket_types(event_id, active_only=True)
        ticket_type_schema = TicketTypeSchema(many=True)
        event_data['ticket_types'] = ticket_type_schema.dump(ticket_types)
        
        # Get showtimes if part of group
        if event.group_id:
            showtimes = event_repo.get_events_by_group(event.group_id)
            showtimes_data = [
                {
                    'event_id': e.event_id,
                    'start_datetime': e.start_datetime.isoformat() if e.start_datetime else None,
                    'end_datetime': e.end_datetime.isoformat() if e.end_datetime else None,
                    'sold_tickets': e.sold_tickets,
                    'total_capacity': e.total_capacity
                }
                for e in showtimes
            ]
            event_data['showtimes'] = showtimes_data
        
        logger.info(f"Event fetched successfully: {event_id}")
        
        return jsonify({
            'success': True,
            'data': event_data
        }), 200
        
    except ResourceNotFoundException as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error fetching event {event_id}: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'FETCH_EVENT_ERROR',
                'message': 'An error occurred while fetching event'
            }
        }), 500


@events_bp.route("/events/featured", methods=["GET"])
@optional_auth
def get_featured_events():
    """
    Get featured events
    
    Query Parameters:
        - limit: Number of events to return (default: 10)
    
    Response:
        {
            "success": true,
            "data": [...]
        }
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        
        logger.info(f"Fetching featured events: limit={limit}")
        
        # Get featured events
        events = event_repo.get_featured_events(limit=limit)
        
        # Serialize
        event_schema = EventSchema(many=True)
        events_data = event_schema.dump(events)
        
        return jsonify({
            'success': True,
            'data': events_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching featured events: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'FETCH_FEATURED_ERROR',
                'message': 'An error occurred while fetching featured events'
            }
        }), 500


@events_bp.route("/events/upcoming", methods=["GET"])
@optional_auth
def get_upcoming_events():
    """
    Get upcoming events
    
    Query Parameters:
        - limit: Number of events to return (default: 20)
    
    Response:
        {
            "success": true,
            "data": [...]
        }
    """
    try:
        limit = request.args.get('limit', 20, type=int)
        
        logger.info(f"Fetching upcoming events: limit={limit}")
        
        # Get upcoming events
        events = event_repo.get_upcoming_events(limit=limit)
        
        # Serialize
        event_schema = EventSchema(many=True)
        events_data = event_schema.dump(events)
        
        return jsonify({
            'success': True,
            'data': events_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching upcoming events: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'FETCH_UPCOMING_ERROR',
                'message': 'An error occurred while fetching upcoming events'
            }
        }), 500


@events_bp.route("/events/search", methods=["GET"])
@optional_auth
def search_events():
    """
    Search events by name or description
    
    Query Parameters:
        - q: Search query (required)
        - limit: Number of results (default: 20)
    
    Response:
        {
            "success": true,
            "data": [...],
            "query": "search term"
        }
    """
    try:
        query = request.args.get('q', '').strip()
        limit = request.args.get('limit', 20, type=int)
        
        if not query:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_QUERY',
                    'message': 'Search query is required'
                }
            }), 400
        
        logger.info(f"Searching events: query='{query}', limit={limit}")
        
        # Search events
        events = event_repo.search_events(query, limit=limit)
        
        # Serialize
        event_schema = EventSchema(many=True)
        events_data = event_schema.dump(events)
        
        return jsonify({
            'success': True,
            'data': events_data,
            'query': query,
            'count': len(events_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error searching events: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'SEARCH_ERROR',
                'message': 'An error occurred while searching events'
            }
        }), 500


@events_bp.route("/events/<int:event_id>/ticket-types", methods=["GET"])
@optional_auth
def get_event_ticket_types(event_id: int):
    """
    Get ticket types for an event
    
    Response:
        {
            "success": true,
            "data": [
                {
                    "ticket_type_id": 1,
                    "type_name": "VIP",
                    "price": 100000,
                    "quantity": 100,
                    "sold_quantity": 50,
                    "available": 50
                }
            ]
        }
    """
    try:
        logger.info(f"Fetching ticket types for event: {event_id}")
        
        # Verify event exists
        event = event_repo.get_by_id(event_id, raise_if_not_found=False)
        if not event or event.deleted_at:
            raise ResourceNotFoundException('Event', event_id)
        
        # Get ticket types
        ticket_types = ticket_type_repo.get_event_ticket_types(event_id, active_only=True)
        
        # Serialize with additional info
        ticket_type_schema = TicketTypeSchema(many=True)
        ticket_types_data = ticket_type_schema.dump(ticket_types)
        
        # Add available quantity
        for i, tt in enumerate(ticket_types):
            ticket_types_data[i]['available'] = tt.quantity - tt.sold_quantity
        
        return jsonify({
            'success': True,
            'data': ticket_types_data
        }), 200
        
    except ResourceNotFoundException as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error fetching ticket types: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'FETCH_TICKET_TYPES_ERROR',
                'message': 'An error occurred while fetching ticket types'
            }
        }), 500


@events_bp.route("/events/<int:event_id>/recommended", methods=["GET"])
@optional_auth
def get_recommended_events(event_id: int):
    """
    Get recommended events based on an event
    (Same category, upcoming, not the same event)
    
    Response:
        {
            "success": true,
            "data": [...]
        }
    """
    try:
        limit = request.args.get('limit', 5, type=int)
        
        logger.info(f"Fetching recommended events for: {event_id}")
        
        # Get current event
        event = event_repo.get_by_id(event_id, raise_if_not_found=False)
        if not event:
            raise ResourceNotFoundException('Event', event_id)
        
        # Get events in same category
        recommended = event_repo.get_active_events(
            category_id=event.category_id,
            limit=limit + 1  # Get extra to filter out current event
        )
        
        # Filter out current event
        recommended = [e for e in recommended if e.event_id != event_id][:limit]
        
        # Serialize
        event_schema = EventSchema(many=True)
        recommended_data = event_schema.dump(recommended)
        
        return jsonify({
            'success': True,
            'data': recommended_data
        }), 200
        
    except ResourceNotFoundException as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error fetching recommended events: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': {
                'code': 'FETCH_RECOMMENDED_ERROR',
                'message': 'An error occurred while fetching recommended events'
            }
        }), 500
