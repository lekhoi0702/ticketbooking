from flask import Blueprint, jsonify
from app.models.venue import Venue

venues_bp = Blueprint("venues", __name__)

@venues_bp.route("/venues", methods=["GET"])
def get_venues():
    """Get all active venues"""
    try:
        venues = Venue.query.filter(
            Venue.is_active == True,
            Venue.status == 'ACTIVE'
        ).all()
        
        return jsonify({
            'success': True,
            'data': [venue.to_dict() for venue in venues]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@venues_bp.route("/venues/<int:venue_id>", methods=["GET"])
def get_venue(venue_id):
    """Get a single venue by ID"""
    try:
        venue = Venue.query.get(venue_id)
        
        if not venue:
            return jsonify({
                'success': False,
                'message': 'Venue not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': venue.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
