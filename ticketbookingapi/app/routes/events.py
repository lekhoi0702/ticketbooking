from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.event import Event
from app.models.event_category import EventCategory
from app.models.venue import Venue
from sqlalchemy import or_, and_

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
        
        # Build query
        query = Event.query
        
        if category_id:
            query = query.filter(Event.category_id == category_id)
        
        if status:
            query = query.filter(Event.status == status)
        
        if is_featured is not None:
            query = query.filter(Event.is_featured == is_featured)
        
        # Order by created_at descending
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
        
        return jsonify({
            'success': True,
            'data': event.to_dict(include_details=True)
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
        
        events = Event.query.filter(
            Event.is_featured == True,
            Event.status == 'PUBLISHED'
        ).order_by(Event.created_at.desc()).limit(limit).all()
        
        return jsonify({
            'success': True,
            'data': [event.to_dict(include_details=True) for event in events]
        }), 200
        
    except Exception as e:
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
        
        events = Event.query.filter(
            or_(
                Event.event_name.like(f'%{query_text}%'),
                Event.description.like(f'%{query_text}%')
            ),
            Event.status == 'PUBLISHED'
        ).limit(limit).all()
        
        return jsonify({
            'success': True,
            'data': [event.to_dict(include_details=True) for event in events]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
