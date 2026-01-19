from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.event import Event
from app.models.event_category import EventCategory
from app.models.venue import Venue
from sqlalchemy import or_, and_
from datetime import datetime

events_bp = Blueprint("events", __name__)

@events_bp.route("/events", methods=["GET"])
def get_events():
    """Get all events with optional filters"""
    try:
        # Get query parameters
        category_id = request.args.get('category_id', type=int)
        status = request.args.get('status', 'PUBLISHED')
        is_featured = request.args.get('is_featured', type=lambda x: x.lower() == 'true')
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        sort = request.args.get('sort')
        
        # Build query
        # We join with Venue to ensure we only show events at ACTIVE venues
        query = db.session.query(Event).join(Venue, Event.venue_id == Venue.venue_id).filter(
            Venue.status == 'ACTIVE',
            Venue.is_active == True
        )
        
        if category_id:
            query = query.filter(Event.category_id == category_id)
        
        if status:
            query = query.filter(Event.status == status)
        
        if is_featured is not None:
            query = query.filter(Event.is_featured == is_featured)
        
        # Apply sorting
        if sort == 'upcoming':
            # Use datetime.utcnow() to match DB convention
            # and sort by start time ascending
            query = query.filter(Event.start_datetime >= datetime.utcnow())
            query = query.order_by(Event.start_datetime.asc())
        elif sort == 'newest':
            query = query.order_by(Event.created_at.desc())
        elif sort == 'popular':
            query = query.order_by(Event.sold_tickets.desc())
        else:
            # Default sorting: Priority for featured events, then by sales volume, then newest
            query = query.order_by(Event.is_featured.desc(), Event.sold_tickets.desc(), Event.created_at.desc())
        
        # Pagination
        total = query.count()
        events = query.limit(limit).offset(offset).all()
        
        return jsonify({
            'success': True,
            'data': [event.to_dict(include_details=True) for event in events],
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        print(f"Error in get_events: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@events_bp.route("/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    """Get a single event by ID"""
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({
                'success': False,
                'message': 'Event not found'
            }), 404
        
        event_data = event.to_dict(include_details=True)
        
        # If part of a group, fetch siblings for schedule
        if event.group_id:
            siblings = Event.query.filter(
                Event.group_id == event.group_id,
                Event.status == 'PUBLISHED',
                Event.event_id != event.event_id,
                Event.start_datetime >= datetime.utcnow()
            ).order_by(Event.start_datetime.asc()).all()
            
            event_data['schedule'] = [
                {
                    'event_id': s.event_id,
                    'start_datetime': s.start_datetime.isoformat(),
                    'end_datetime': s.end_datetime.isoformat()
                } for s in siblings
            ]
        else:
             event_data['schedule'] = []

        return jsonify({
            'success': True,
            'data': event_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@events_bp.route("/events/featured", methods=["GET"])
def get_featured_events():
    """Get featured events"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        events = db.session.query(Event).join(Venue, Event.venue_id == Venue.venue_id).filter(
            Event.is_featured == True,
            Event.status == 'PUBLISHED',
            Venue.status == 'ACTIVE',
            Venue.is_active == True
        ).order_by(Event.created_at.desc()).limit(limit).all()
        
        return jsonify({
            'success': True,
            'data': [event.to_dict(include_details=True) for event in events]
        }), 200
        
    except Exception as e:
        print(f"Error in get_featured_events: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@events_bp.route("/events/search", methods=["GET"])
def search_events():
    """Search events by name or description"""
    try:
        query_text = request.args.get('q', '')
        limit = request.args.get('limit', 20, type=int)
        
        if not query_text:
            return jsonify({
                'success': False,
                'message': 'Search query is required'
            }), 400
        
        events = db.session.query(Event).join(Venue, Event.venue_id == Venue.venue_id).filter(
            or_(
                Event.event_name.like(f'%{query_text}%'),
                Event.description.like(f'%{query_text}%')
            ),
            Event.status == 'PUBLISHED',
            Venue.status == 'ACTIVE',
            Venue.is_active == True
        ).limit(limit).all()
        
        return jsonify({
            'success': True,
            'data': [event.to_dict(include_details=True) for event in events]
        }), 200
        
    except Exception as e:
        print(f"Error in search_events: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@events_bp.route("/events/<int:event_id>/recommended", methods=["GET"])
def get_recommended_events(event_id):
    """Get recommended events based on the same category"""
    try:
        from app.services.organizer_event_service import OrganizerEventService
        
        limit = request.args.get('limit', 8, type=int)
        recommended = OrganizerEventService.get_recommended_events(event_id, limit)
        
        return jsonify({
            'success': True,
            'data': recommended
        }), 200
        
    except Exception as e:
        print(f"Error in get_recommended_events: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@events_bp.route("/events/<int:event_id>/ticket-types", methods=["GET"])
def get_event_ticket_types(event_id):
    """Get ticket types for an event (public endpoint for users)"""
    try:
        from app.models.ticket_type import TicketType
        
        # Verify event exists and is published
        event = Event.query.get(event_id)
        if not event:
            return jsonify({
                'success': False,
                'message': 'Event not found'
            }), 404
        
        # Get all active ticket types for this event
        ticket_types = TicketType.query.filter_by(
            event_id=event_id,
            is_active=True
        ).order_by(TicketType.price.asc()).all()
        
        return jsonify({
            'success': True,
            'data': [tt.to_dict() for tt in ticket_types]
        }), 200
        
    except Exception as e:
        print(f"Error in get_event_ticket_types: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@events_bp.route("/events/favorites/toggle", methods=["POST"])
def toggle_favorite():
    """Toggle favorite status for an event"""
    try:
        from app.services.event_service import EventService
        data = request.get_json()
        user_id = data.get('user_id')
        event_id = data.get('event_id')
        
        if not user_id or not event_id:
            return jsonify({
                'success': False,
                'message': 'User ID and Event ID are required'
            }), 400
            
        is_added, message = EventService.toggle_favorite(user_id, event_id)
        
        return jsonify({
            'success': True,
            'is_favorite': is_added,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@events_bp.route("/events/favorites/user/<int:user_id>", methods=["GET"])
def get_user_favorites(user_id):
    """Get all favorite events for a user"""
    try:
        from app.services.event_service import EventService
        favorites = EventService.get_user_favorites(user_id)
        
        return jsonify({
            'success': True,
            'data': favorites
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@events_bp.route("/events/favorites/ids/<int:user_id>", methods=["GET"])
def get_user_favorite_ids(user_id):
    """Get list of event IDs favorited by user"""
    try:
        from app.services.event_service import EventService
        favorite_ids = EventService.get_user_favorite_ids(user_id)
        
        return jsonify({
            'success': True,
            'data': favorite_ids
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@events_bp.route("/events/favorites/cleanup", methods=["POST"])
def cleanup_expired_favorites():
    """Cleanup favorites for expired events (admin/system endpoint)"""
    try:
        from app.models.favorite_event import FavoriteEvent
        from datetime import datetime
        
        # Get current time
        now = datetime.utcnow()
        
        # Find all events that have ended
        expired_events = Event.query.filter(Event.end_datetime <= now).all()
        expired_event_ids = [event.event_id for event in expired_events]
        
        if not expired_event_ids:
            return jsonify({
                'success': True,
                'message': 'No expired events found',
                'removed_count': 0
            }), 200
        
        # Delete favorites for expired events
        deleted_count = FavoriteEvent.query.filter(
            FavoriteEvent.event_id.in_(expired_event_ids)
        ).delete(synchronize_session=False)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Successfully removed {deleted_count} favorites for {len(expired_event_ids)} expired events',
            'removed_count': deleted_count,
            'expired_event_count': len(expired_event_ids)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
