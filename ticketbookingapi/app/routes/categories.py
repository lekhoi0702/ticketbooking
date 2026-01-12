from flask import Blueprint, jsonify
from app.models.event_category import EventCategory

categories_bp = Blueprint("categories", __name__)

@categories_bp.route("/categories", methods=["GET"])
def get_categories():
    """Get all active event categories"""
    try:
        categories = EventCategory.query.filter(
            EventCategory.is_active == True
        ).all()
        
        return jsonify({
            'success': True,
            'data': [category.to_dict() for category in categories]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@categories_bp.route("/categories/<int:category_id>", methods=["GET"])
def get_category(category_id):
    """Get a single category by ID"""
    try:
        category = EventCategory.query.get(category_id)
        
        if not category:
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': category.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
