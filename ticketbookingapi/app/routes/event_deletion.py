from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.event_deletion_request import EventDeletionRequest
from app.models.event import Event
from app.models.order import Order
from app.models.ticket import Ticket
from app.models.ticket_type import TicketType
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

event_deletion_bp = Blueprint("event_deletion", __name__)

@event_deletion_bp.route("/admin/event-deletion-requests", methods=["GET"])
def get_deletion_requests():
    """Get all pending event deletion requests"""
    try:
        status = request.args.get('status', 'PENDING')
        
        query = EventDeletionRequest.query
        if status:
            query = query.filter_by(request_status=status)
        
        requests = query.order_by(EventDeletionRequest.created_at.desc()).all()
        
        requests_data = []
        for req in requests:
            req_dict = req.to_dict()
            
            # Add event info
            event = Event.query.get(req.event_id)
            if event:
                req_dict['event_name'] = event.event_name
                req_dict['event_status'] = event.status
                req_dict['sold_tickets'] = event.sold_tickets
                
                # Count active orders
                active_orders = db.session.query(Order).join(
                    Ticket, Order.order_id == Ticket.order_id
                ).join(
                    TicketType, Ticket.ticket_type_id == TicketType.ticket_type_id
                ).filter(
                    TicketType.event_id == req.event_id,
                    Order.order_status.in_(['PAID', 'PENDING', 'REFUND_PENDING'])
                ).count()
                
                req_dict['active_orders'] = active_orders
            
            requests_data.append(req_dict)
        
        return jsonify({
            'success': True,
            'data': requests_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@event_deletion_bp.route("/admin/event-deletion-requests/<int:request_id>/approve", methods=["POST"])
def approve_deletion_request(request_id):
    """Approve event deletion request and delete the event"""
    try:
        deletion_request = EventDeletionRequest.query.get(request_id)
        
        if not deletion_request:
            return jsonify({
                'success': False,
                'message': 'Deletion request not found'
            }), 404
        
        if deletion_request.request_status != 'PENDING':
            return jsonify({
                'success': False,
                'message': 'Request has already been processed'
            }), 400
        
        data = request.get_json() or {}
        admin_id = data.get('admin_id', 1)
        admin_note = data.get('admin_note', '')
        
        # Get the event
        event = Event.query.get(deletion_request.event_id)
        if not event:
            return jsonify({
                'success': False,
                'message': 'Event not found'
            }), 404
        
        # Check if event has sold tickets
        if event.sold_tickets > 0:
            return jsonify({
                'success': False,
                'message': 'Cannot delete event with sold tickets'
            }), 400
        
        # Store event_id before deletion
        event_id = deletion_request.event_id
        
        # Delete the event first (this will trigger ondelete='SET NULL' for event_id)
        db.session.delete(event)
        db.session.flush()  # Flush to trigger the cascade
        
        # Now update deletion request status
        deletion_request.request_status = 'APPROVED'
        deletion_request.reviewed_by = admin_id
        deletion_request.reviewed_at = now_gmt7()
        deletion_request.admin_note = admin_note
        
        # Commit everything in a single transaction
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Event deletion approved and event has been deleted'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@event_deletion_bp.route("/admin/event-deletion-requests/<int:request_id>/reject", methods=["POST"])
def reject_deletion_request(request_id):
    """Reject event deletion request"""
    try:
        deletion_request = EventDeletionRequest.query.get(request_id)
        
        if not deletion_request:
            return jsonify({
                'success': False,
                'message': 'Deletion request not found'
            }), 404
        
        if deletion_request.request_status != 'PENDING':
            return jsonify({
                'success': False,
                'message': 'Request has already been processed'
            }), 400
        
        data = request.get_json() or {}
        admin_id = data.get('admin_id', 1)
        admin_note = data.get('admin_note', '')
        
        # Update deletion request status
        deletion_request.request_status = 'REJECTED'
        deletion_request.reviewed_by = admin_id
        deletion_request.reviewed_at = now_gmt7()
        deletion_request.admin_note = admin_note
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Event deletion request has been rejected'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
