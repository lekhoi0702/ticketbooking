from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.banner import Banner
import os
import uuid
from werkzeug.utils import secure_filename
from datetime import datetime

banners_bp = Blueprint("banners", __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file):
    if not file:
        return None
        
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    uploads_dir = os.path.join(project_root, 'uploads', 'banners')
    
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(uploads_dir, unique_filename)
    
    file.save(file_path)
    
    return f"/uploads/banners/{unique_filename}"

# Public Routes
@banners_bp.route("/banners", methods=["GET"])
def get_banners():
    """Get all active banners for display"""
    try:
        banners = Banner.query.filter_by(is_active=True)\
            .order_by(Banner.order.asc(), Banner.created_at.desc())\
            .all()
            
        return jsonify({
            'success': True,
            'data': [banner.to_dict() for banner in banners]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Admin Routes
@banners_bp.route("/admin/banners", methods=["GET"])
def admin_get_banners():
    """Get all banners for admin (including inactive)"""
    try:
        banners = Banner.query.order_by(Banner.order.asc(), Banner.created_at.desc()).all()
        return jsonify({
            'success': True,
            'data': [banner.to_dict() for banner in banners]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@banners_bp.route("/admin/banners", methods=["POST"])
def create_banner():
    """Create a new banner"""
    try:
        title = request.form.get('title')
        link = request.form.get('link')
        order = request.form.get('order', 0, type=int)
        is_active = request.form.get('is_active', 'true').lower() == 'true'
        
        file = request.files.get('image')
        if not file:
            return jsonify({'success': False, 'message': 'Image is required'}), 400
            
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'message': 'Invalid file type'}), 400
            
        image_url = save_file(file)
        
        banner = Banner(
            title=title,
            link=link,
            order=order,
            is_active=is_active,
            image_url=image_url
        )
        
        db.session.add(banner)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Banner created successfully',
            'data': banner.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@banners_bp.route("/admin/banners/<int:banner_id>", methods=["PUT"])
def update_banner(banner_id):
    """Update a banner"""
    try:
        banner = Banner.query.get(banner_id)
        if not banner:
            return jsonify({'success': False, 'message': 'Banner not found'}), 404
            
        if 'title' in request.form:
            banner.title = request.form.get('title')
            
        if 'link' in request.form:
            banner.link = request.form.get('link')
            
        if 'order' in request.form:
            banner.order = request.form.get('order', type=int)
            
        if 'is_active' in request.form:
            banner.is_active = request.form.get('is_active').lower() == 'true'
            
        file = request.files.get('image')
        if file and allowed_file(file.filename):
            # TODO: Delete old image if exists?
            image_url = save_file(file)
            banner.image_url = image_url
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Banner updated successfully',
            'data': banner.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@banners_bp.route("/admin/banners/<int:banner_id>", methods=["DELETE"])
def delete_banner(banner_id):
    """Delete a banner"""
    try:
        banner = Banner.query.get(banner_id)
        if not banner:
            return jsonify({'success': False, 'message': 'Banner not found'}), 404
            
        db.session.delete(banner)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Banner deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
