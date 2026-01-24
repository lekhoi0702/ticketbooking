"""
Advertisement Routes
API endpoints for advertisement management
"""
from flask import Blueprint, jsonify, request, g
from app.services.advertisement_service import AdvertisementService
from app.decorators.auth import require_auth, require_admin
from datetime import datetime
from app.utils.datetime_utils import parse_to_gmt7

advertisement_bp = Blueprint('advertisement', __name__, url_prefix='/api/advertisements')


@advertisement_bp.route('/position/<position>', methods=['GET'])
def get_ads_by_position(position):
    """
    Get active advertisements for a specific position
    Public endpoint - no authentication required
    """
    try:
        limit = request.args.get('limit', type=int)
        ads = AdvertisementService.get_active_ads_by_position(position, limit)
        
        return jsonify({
            'success': True,
            'data': [ad.to_dict() for ad in ads],
            'count': len(ads)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching advertisements: {str(e)}'
        }), 500


@advertisement_bp.route('/', methods=['GET'])
# @require_admin  # Temporarily disabled for testing
def get_all_ads():
    """
    Get all advertisements (admin only)
    """
    try:
        from flask import current_app
        current_app.logger.info(f"get_all_ads called by user: {g.current_user.user_id if hasattr(g, 'current_user') else 'NO USER'}")
        
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
        ads = AdvertisementService.get_all_ads(include_inactive)
        
        return jsonify({
            'success': True,
            'data': [ad.to_dict() for ad in ads],
            'count': len(ads)
        }), 200
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Error in get_all_ads: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error fetching advertisements: {str(e)}'
        }), 500


@advertisement_bp.route('/<int:ad_id>', methods=['GET'])
# @require_admin  # Temporarily disabled
def get_ad(ad_id):
    """
    Get advertisement by ID (admin only)
    """
    try:
        ad = AdvertisementService.get_ad_by_id(ad_id)
        
        if not ad:
            return jsonify({
                'success': False,
                'message': 'Advertisement not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': ad.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching advertisement: {str(e)}'
        }), 500


@advertisement_bp.route('/', methods=['POST'])
# @require_admin  # Temporarily disabled
def create_ad():
    """
    Create new advertisement (admin only)
    """
    try:
        from app.utils.upload_helper import save_advertisement_image, allowed_file
        
        # Get form data
        title = request.form.get('title')
        link_url = request.form.get('link_url', '')
        position = request.form.get('position')
        display_order = request.form.get('display_order', 0, type=int)
        is_active = request.form.get('is_active', 'true').lower() == 'true'
        start_date_str = request.form.get('start_date')
        end_date_str = request.form.get('end_date')
        
        # Validate required fields
        if not title or not position:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: title, position'
            }), 400
        
        # Handle file upload
        file = request.files.get('image')
        if not file:
            return jsonify({
                'success': False,
                'message': 'Image file is required'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'
            }), 400
        
        image_url = save_advertisement_image(file)
        if not image_url:
            return jsonify({
                'success': False,
                'message': 'Failed to save image'
            }), 500
        
        # Prepare data
        data = {
            'title': title,
            'image_url': image_url,
            'link_url': link_url,
            'position': position,
            'display_order': display_order,
            'is_active': is_active
        }
        
        if start_date_str:
            data['start_date'] = parse_to_gmt7(start_date_str)
        if end_date_str:
            data['end_date'] = parse_to_gmt7(end_date_str)
        
        # Add creator (when auth is re-enabled)
        # data['created_by'] = g.current_user.user_id
        data['created_by'] = 1  # Temporary hardcode
        
        ad = AdvertisementService.create_ad(data)
        
        return jsonify({
            'success': True,
            'message': 'Advertisement created successfully',
            'data': ad.to_dict()
        }), 201
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Error creating advertisement: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error creating advertisement: {str(e)}'
        }), 500


@advertisement_bp.route('/<int:ad_id>', methods=['PUT'])
# @require_admin  # Temporarily disabled
def update_ad(ad_id):
    """
    Update advertisement (admin only)
    """
    try:
        from app.utils.upload_helper import save_advertisement_image, allowed_file
        
        # Get form data
        data = {}
        
        if 'title' in request.form:
            data['title'] = request.form.get('title')
        if 'link_url' in request.form:
            data['link_url'] = request.form.get('link_url')
        if 'position' in request.form:
            data['position'] = request.form.get('position')
        if 'display_order' in request.form:
            data['display_order'] = request.form.get('display_order', type=int)
        if 'is_active' in request.form:
            data['is_active'] = request.form.get('is_active').lower() == 'true'
        
        # Handle file upload (optional for update)
        file = request.files.get('image')
        if file and allowed_file(file.filename):
            image_url = save_advertisement_image(file)
            if image_url:
                data['image_url'] = image_url
        
        # Parse dates if provided
        start_date_str = request.form.get('start_date')
        end_date_str = request.form.get('end_date')
        
        if start_date_str:
            data['start_date'] = parse_to_gmt7(start_date_str)
        if end_date_str:
            data['end_date'] = parse_to_gmt7(end_date_str)
        
        ad = AdvertisementService.update_ad(ad_id, data)
        
        if not ad:
            return jsonify({
                'success': False,
                'message': 'Advertisement not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Advertisement updated successfully',
            'data': ad.to_dict()
        }), 200
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Error updating advertisement: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error updating advertisement: {str(e)}'
        }), 500


@advertisement_bp.route('/<int:ad_id>', methods=['DELETE'])
# @require_admin  # Temporarily disabled
def delete_ad(ad_id):
    """
    Delete advertisement (admin only)
    """
    try:
        success = AdvertisementService.delete_ad(ad_id)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Advertisement not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Advertisement deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error deleting advertisement: {str(e)}'
        }), 500


@advertisement_bp.route('/<int:ad_id>/view', methods=['POST'])
def track_view(ad_id):
    """
    Track advertisement view
    Public endpoint - no authentication required
    """
    try:
        success = AdvertisementService.increment_view(ad_id)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Advertisement not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'View tracked successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error tracking view: {str(e)}'
        }), 500


@advertisement_bp.route('/<int:ad_id>/click', methods=['POST'])
def track_click(ad_id):
    """
    Track advertisement click
    Public endpoint - no authentication required
    """
    try:
        success = AdvertisementService.increment_click(ad_id)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Advertisement not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Click tracked successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error tracking click: {str(e)}'
        }), 500
