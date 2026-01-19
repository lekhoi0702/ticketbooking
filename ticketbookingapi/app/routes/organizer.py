from flask import Blueprint, jsonify, request
from app.services.organizer_service import OrganizerService
from app.services.organizer_event_service import OrganizerEventService
from app.services.organizer_venue_service import OrganizerVenueService
from app.services.organizer_stats_service import OrganizerStatsService

organizer_bp = Blueprint("organizer", __name__)

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
    """Request event deletion"""
    try:
        data = request.get_json() or {}
        deletion_request, active_orders = OrganizerEventService.delete_event(event_id, data)
        
        if deletion_request is None:
             return jsonify({
                'success': True,
                'message': 'Sự kiện đã được xóa thành công.',
                'requires_approval': False
            }), 200

        message_text = 'Yêu cầu xóa sự kiện đã được gửi đến Admin để phê duyệt.'
        if active_orders > 0:
            message_text = f'Sự kiện có {active_orders} đơn hàng chưa hủy. ' + message_text
            
        return jsonify({
            'success': True,
            'requires_approval': True,
            'message': message_text,
            'data': {
                'request_id': deletion_request.request_id,
                'active_orders': active_orders
            }
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

@organizer_bp.route("/organizer/venues", methods=["GET"])
def get_organizer_venues():
    """Get all venues managed by organizer"""
    try:
        manager_id = request.args.get('manager_id', 1, type=int)
        venues = OrganizerVenueService.get_venues(manager_id)
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
