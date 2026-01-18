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
            # Default order by created_at descending
            query = query.order_by(Event.created_at.desc())
        
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
