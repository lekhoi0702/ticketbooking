from flask import Blueprint, jsonify, request
from app.services.organizer_service import OrganizerService
from app.services.organizer_event_service import OrganizerEventService
from app.services.organizer_venue_service import OrganizerVenueService
from app.services.organizer_stats_service import OrganizerStatsService
from app.models.user import User
from app.models.organizer_qr_code import OrganizerQRCode
from app.extensions import db
from app.utils.upload_helper import save_vietqr_image
from werkzeug.utils import secure_filename
import os

organizer_bp = Blueprint("organizer", __name__)

def safe_int(value, default=None):
    """Safely convert value to int, handling None, 'undefined', and invalid values"""
    if value is None or value == 'undefined' or value == '':
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def get_user_from_request():
    """Helper to get user from manager_id in request"""
    manager_id = request.args.get('manager_id') or request.form.get('manager_id')
    if not manager_id:
        data = request.get_json(silent=True) or {}
        manager_id = data.get('manager_id')
    if manager_id:
        manager_id_int = safe_int(manager_id)
        if manager_id_int:
            return User.query.get(manager_id_int)
    return None

@organizer_bp.route("/organizer/dashboard", methods=["GET"])
def get_dashboard_stats():
    """Get dashboard statistics for organizer"""
    try:
        manager_id = request.args.get('manager_id', 1, type=int)
        data = OrganizerStatsService.get_dashboard_stats(manager_id)
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/events", methods=["GET"])
def get_organizer_events():
    """Get all events managed by organizer"""
    try:
        manager_id = request.args.get('manager_id', 1, type=int)
        status = request.args.get('status')
        events = OrganizerEventService.get_events(manager_id, status)
        return jsonify({'success': True, 'data': events}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/events/<int:event_id>/duplicate", methods=["POST"])
def add_showtime(event_id):
    """Duplicate an event to create a new showtime (recurrence)"""
    try:
        data = request.get_json()
        manager_id = data.get('manager_id')
        new_event = OrganizerEventService.add_showtime(event_id, data)
        return jsonify({
            'success': True,
            'message': 'Thêm suất diễn thành công',
            'data': new_event.to_dict(include_details=True)
        }), 201
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/events", methods=["POST"])
def create_event():
    """Create a new event"""
    try:
        data = request.form
        files = request.files
        new_event = OrganizerEventService.create_event(data, files)
        return jsonify({
            'success': True,
            'message': 'Event created successfully',
            'data': new_event.to_dict(include_details=True)
        }), 201
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/events/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    """Update an existing event"""
    try:
        data = request.form
        files = request.files
        
        event = OrganizerEventService.update_event(event_id, data, files)
        return jsonify({
            'success': True,
            'message': 'Event updated successfully',
            'data': event.to_dict(include_details=True)
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    """Delete event (soft delete - sets status to DELETED)"""
    try:
        data = request.get_json() or {}
        OrganizerEventService.delete_event(event_id, data)
        return jsonify({
            'success': True,
            'message': 'Sự kiện đã được xóa thành công.'
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/events/bulk-delete", methods=["POST"])
def bulk_delete_events():
    """Delete multiple events at once (only DRAFT events)"""
    try:
        data = request.get_json()
        event_ids = data.get('event_ids', [])
        manager_id = data.get('manager_id', 1)
        
        if not event_ids:
            return jsonify({'success': False, 'message': 'Không có sự kiện nào được chọn'}), 400
        
        results = OrganizerEventService.delete_events_bulk(event_ids, manager_id)
        # Build response message
        if results['success_count'] == 0:
            return jsonify({
                'success': False,
                'message': 'Không thể xóa bất kỳ sự kiện nào',
                'data': results
            }), 400
        elif results['failed_events']:
            return jsonify({
                'success': True,
                'message': f'Đã xóa {results["success_count"]} sự kiện. {len(results["failed_events"])} sự kiện không thể xóa.',
                'data': results
            }), 200
        else:
            return jsonify({
                'success': True,
                'message': f'Đã xóa thành công {results["success_count"]} sự kiện',
                'data': results
            }), 200
            
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/events/<int:event_id>/ticket-types", methods=["GET"])
def get_event_ticket_types(event_id):
    """Get ticket types for an event"""
    try:
        ticket_types = OrganizerEventService.get_event_ticket_types(event_id)
        return jsonify({
            'success': True,
            'data': [tt.to_dict() for tt in ticket_types]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/events/<int:event_id>/ticket-types", methods=["POST"])
def create_ticket_type(event_id):
    """Create a new ticket type for an event"""
    try:
        data = request.get_json()
        ticket_type = OrganizerEventService.create_ticket_type(event_id, data)
        return jsonify({
            'success': True,
            'message': 'Ticket type created successfully',
            'data': ticket_type.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/ticket-types/<int:ticket_type_id>", methods=["PUT"])
def update_ticket_type(ticket_type_id):
    """Update a ticket type"""
    try:
        data = request.get_json()
        ticket_type = OrganizerEventService.update_ticket_type(ticket_type_id, data)
        return jsonify({
            'success': True,
            'message': 'Ticket type updated successfully',
            'data': ticket_type.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/ticket-types/<int:ticket_type_id>", methods=["DELETE"])
def delete_ticket_type(ticket_type_id):
    """Delete a ticket type"""
    try:
        OrganizerEventService.delete_ticket_type(ticket_type_id)
        return jsonify({
            'success': True,
            'message': 'Ticket type deleted successfully'
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/events/<int:event_id>/orders", methods=["GET"])
def get_event_orders(event_id):
    """Get all orders for a specific event"""
    try:
        orders_data = OrganizerService.get_event_orders(event_id)
        return jsonify({'success': True, 'data': orders_data}), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/orders/<int:order_id>/refund/approve", methods=["POST"])
def approve_refund(order_id):
    """Approve refund request"""
    try:
        OrganizerService.approve_refund(order_id)
        return jsonify({
            'success': True,
            'message': 'Refund approved successfully. Tickets have been deleted.'
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/orders/<int:order_id>/refund/reject", methods=["POST"])
def reject_refund(order_id):
    """Reject refund request"""
    try:
        OrganizerService.reject_refund(order_id)
        return jsonify({
            'success': True,
            'message': 'Refund request rejected'
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/refund-requests", methods=["GET"])
def get_refund_requests():
    """Get all refund requests (CANCELLATION_PENDING orders) for organizer's events"""
    try:
        manager_id = request.args.get('manager_id', type=int)
        if not manager_id:
            return jsonify({'success': False, 'message': 'Missing manager_id'}), 400
        
        data = OrganizerService.get_refund_requests(manager_id)
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] get_refund_requests: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/venues", methods=["GET"])
def get_organizer_venues():
    """Get all venues managed by organizer"""
    try:
        manager_id = request.args.get('manager_id', 1, type=int)
        # exclude_maintenance defaults to True for backward compatibility
        # Set to False to show all venues including maintenance ones
        exclude_maintenance = request.args.get('exclude_maintenance', 'true').lower() == 'true'
        venues = OrganizerVenueService.get_venues(manager_id, exclude_maintenance=exclude_maintenance)
        return jsonify({
            'success': True,
            'data': [v.to_dict() for v in venues]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/venues", methods=["POST"])
def create_organizer_venue():
    """Create a new venue"""
    try:
        data = request.get_json()
        new_venue = OrganizerVenueService.create_venue(data)
        return jsonify({
            'success': True,
            'message': 'Venue created successfully',
            'data': new_venue.to_dict()
        }), 201
    except Exception as e:
        import traceback
        print(f"[ERROR] create_organizer_venue: {e}")
        print(traceback.format_exc())
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/venues/<int:venue_id>", methods=["GET"])
def get_organizer_venue(venue_id):
    """Get a single venue"""
    try:
        venue = OrganizerVenueService.get_venue(venue_id)
        if not venue:
             return jsonify({'success': False, 'message': 'Venue not found'}), 404
        return jsonify({
            'success': True,
            'data': venue.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/venues/<int:venue_id>", methods=["PUT"])
def update_organizer_venue(venue_id):
    """Update venue details"""
    try:
        data = request.get_json()
        venue = OrganizerVenueService.update_venue(venue_id, data)
        return jsonify({
            'success': True,
            'message': 'Venue updated successfully',
            'data': venue.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/venues/<int:venue_id>", methods=["DELETE"])
def delete_organizer_venue(venue_id):
    """Delete a venue"""
    try:
        OrganizerVenueService.delete_venue(venue_id)
        return jsonify({
            'success': True,
            'message': 'Venue deleted successfully'
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/venues/<int:venue_id>/seats", methods=["PUT"])
def update_venue_seats(venue_id):
    """Update seat map for venue"""
    try:
        data = request.get_json()
        venue = OrganizerVenueService.update_venue(venue_id, data)
        return jsonify({
            'success': True,
            'message': 'Seat map updated successfully',
            'data': venue.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/tickets/search", methods=["GET"])
def search_tickets():
    """Search tickets"""
    try:
        manager_id = request.args.get('manager_id', 1, type=int)
        query_text = request.args.get('q', '')
        event_id = request.args.get('event_id', type=int)
        status = request.args.get('status')
        
        results = OrganizerService.search_tickets(manager_id, query_text, event_id, status)
        return jsonify({'success': True, 'data': results}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/tickets/check-in", methods=["POST"])
def check_in_ticket():
    """Check in a ticket"""
    try:
        data = request.get_json()
        result = OrganizerService.check_in_ticket(data)
        return jsonify({
            'success': True,
            'message': 'Check-in thành công',
            'data': result
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/stats", methods=["GET"])
def get_organizer_stats():
    """Get detailed statistics for organizer"""
    try:
        manager_id = request.args.get('manager_id', 1, type=int)
        data = OrganizerStatsService.get_organizer_stats_detailed(manager_id)
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/orders", methods=["GET"])
def get_organizer_orders():
    """Get list of orders containing tickets for organizer's events"""
    try:
        manager_id = request.args.get('manager_id', type=int)
        search = request.args.get('search', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('limit', 10, type=int)
        
        if not manager_id:
             return jsonify({'success': False, 'message': 'Missing manager_id'}), 400

        orders_data, pagination = OrganizerStatsService.get_organizer_orders_paginated(manager_id, search, page, per_page)
        
        return jsonify({
            'success': True,
            'data': orders_data,
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'page': page,
                'limit': per_page
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/profile/<int:user_id>", methods=["GET"])
def get_organizer_profile(user_id):
    """Get organizer profile information"""
    try:
        data = OrganizerService.get_organizer_profile(user_id)
        return jsonify({'success': True, 'data': data}), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/profile/<int:user_id>", methods=["PUT"])
def update_organizer_profile(user_id):
    """Update organizer profile information"""
    try:
        data = request.form
        files = request.files
        organizer_info = OrganizerService.update_organizer_profile(user_id, data, files)
        return jsonify({
            'success': True,
            'message': 'Cập nhật thông tin thành công',
            'data': organizer_info.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500

# Organizer QR Code Management
@organizer_bp.route("/organizer/qr-codes", methods=["GET"])
def get_organizer_qr_codes():
    """Get all QR codes for an organizer"""
    try:
        manager_id = request.args.get('manager_id', type=int)
        if not manager_id:
            return jsonify({'success': False, 'message': 'manager_id is required'}), 400
        
        qr_codes = OrganizerQRCode.query.filter_by(manager_id=manager_id).order_by(OrganizerQRCode.created_at.desc()).all()
        return jsonify({
            'success': True,
            'data': [qr.to_dict() for qr in qr_codes]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/qr-codes", methods=["POST"])
def create_organizer_qr_code():
    """Create a new QR code for organizer"""
    try:
        manager_id = request.form.get('manager_id', type=int) or (request.get_json().get('manager_id') if request.is_json else None)
        if not manager_id:
            return jsonify({'success': False, 'message': 'manager_id is required'}), 400
        
        qr_image_url = None
        
        # Check if file upload
        if 'qr_image' in request.files:
            file = request.files['qr_image']
            if file and file.filename:
                qr_image_url = save_vietqr_image(file, manager_id)
                if not qr_image_url:
                    return jsonify({'success': False, 'message': 'Invalid file format'}), 400
        elif 'qr_image_url' in request.form:
            qr_image_url = request.form.get('qr_image_url')
        elif request.is_json:
            data = request.get_json()
            qr_image_url = data.get('qr_image_url')
        
        if not qr_image_url:
            return jsonify({'success': False, 'message': 'qr_image_url or qr_image file is required'}), 400
        
        qr_name = request.form.get('qr_name') or (request.get_json().get('qr_name') if request.is_json else 'QR Code')
        bank_name = request.form.get('bank_name') or (request.get_json().get('bank_name') if request.is_json else None)
        account_number = request.form.get('account_number') or (request.get_json().get('account_number') if request.is_json else None)
        
        qr_code = OrganizerQRCode(
            manager_id=manager_id,
            qr_name=qr_name,
            qr_image_url=qr_image_url,
            bank_name=bank_name,
            account_number=account_number,
            is_active=True
        )
        
        db.session.add(qr_code)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Tạo QR code thành công',
            'data': qr_code.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        import traceback
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/qr-codes/<int:qr_code_id>", methods=["PUT"])
def update_organizer_qr_code(qr_code_id):
    """Update an organizer QR code"""
    try:
        manager_id = request.form.get('manager_id', type=int) or request.get_json().get('manager_id') if request.is_json else None
        if not manager_id:
            return jsonify({'success': False, 'message': 'manager_id is required'}), 400
        
        qr_code = OrganizerQRCode.query.filter_by(qr_code_id=qr_code_id, manager_id=manager_id).first()
        if not qr_code:
            return jsonify({'success': False, 'message': 'QR code not found'}), 404
        
        # Update image if provided
        if 'qr_image' in request.files:
            file = request.files['qr_image']
            if file and file.filename:
                qr_image_url = save_vietqr_image(file, manager_id)
                if qr_image_url:
                    qr_code.qr_image_url = qr_image_url
        
        data = request.get_json(silent=True) or {}
        if 'qr_name' in request.form or 'qr_name' in data:
            qr_code.qr_name = request.form.get('qr_name') or data.get('qr_name')
        if 'qr_image_url' in request.form or 'qr_image_url' in data:
            qr_code.qr_image_url = request.form.get('qr_image_url') or data.get('qr_image_url')
        if 'bank_name' in request.form or 'bank_name' in data:
            qr_code.bank_name = request.form.get('bank_name') or data.get('bank_name')
        if 'account_number' in request.form or 'account_number' in data:
            qr_code.account_number = request.form.get('account_number') or data.get('account_number')
        if 'is_active' in request.form or 'is_active' in data:
            qr_code.is_active = request.form.get('is_active', type=bool) if 'is_active' in request.form else data.get('is_active', True)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cập nhật QR code thành công',
            'data': qr_code.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/qr-codes/<int:qr_code_id>", methods=["DELETE"])
def delete_organizer_qr_code(qr_code_id):
    """Delete an organizer QR code"""
    try:
        manager_id = request.args.get('manager_id', type=int) or request.get_json().get('manager_id') if request.is_json else None
        if not manager_id:
            return jsonify({'success': False, 'message': 'manager_id is required'}), 400
        
        qr_code = OrganizerQRCode.query.filter_by(qr_code_id=qr_code_id, manager_id=manager_id).first()
        if not qr_code:
            return jsonify({'success': False, 'message': 'QR code not found'}), 404
        
        db.session.delete(qr_code)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Xóa QR code thành công'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/qr-codes/<int:qr_code_id>/toggle-active", methods=["POST"])
def toggle_qr_code_active(qr_code_id):
    """Toggle QR code active status"""
    try:
        manager_id = request.get_json().get('manager_id') if request.is_json else request.args.get('manager_id', type=int)
        if not manager_id:
            return jsonify({'success': False, 'message': 'manager_id is required'}), 400
        
        qr_code = OrganizerQRCode.query.filter_by(qr_code_id=qr_code_id, manager_id=manager_id).first()
        if not qr_code:
            return jsonify({'success': False, 'message': 'QR code not found'}), 404
        
        qr_code.is_active = not qr_code.is_active
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'QR code đã được {"kích hoạt" if qr_code.is_active else "vô hiệu hóa"}',
            'data': qr_code.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
