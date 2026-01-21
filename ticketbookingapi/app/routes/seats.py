from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.seat import Seat
from app.models.seat_reservation import SeatReservation
from app.models.ticket_type import TicketType
from app.models.event import Event
from datetime import datetime, timedelta

seats_bp = Blueprint("seats", __name__)

@seats_bp.route("/seats/ticket-type/<int:ticket_type_id>", methods=["GET"])
def get_seats_by_ticket_type(ticket_type_id):
    """Lấy danh sách ghế ngồi theo loại vé"""
    try:
        seats = Seat.query.filter_by(ticket_type_id=ticket_type_id, is_active=True).all()
        return jsonify({
            'success': True,
            'data': [seat.to_dict() for seat in seats]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@seats_bp.route("/seats/<int:seat_id>", methods=["GET"])
def get_seat(seat_id):
    """Lấy thông tin chi tiết một ghế"""
    try:
        seat = Seat.query.get(seat_id)
        if not seat:
            return jsonify({'success': False, 'message': 'Không tìm thấy ghế'}), 404
        return jsonify({
            'success': True,
            'data': seat.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@seats_bp.route("/seats/event/<int:event_id>", methods=["GET"])
def get_all_event_seats(event_id):
    """Lấy toàn bộ danh sách ghế đã được gán của một sự kiện (cho tất cả hạng vé)"""
    try:
        # Optimized query using only the fields we need
        # Include seat_id and status if needed for frontend logic
        seats = db.session.query(
            Seat.seat_id,
            Seat.row_name,
            Seat.seat_number,
            Seat.ticket_type_id,
            Seat.area_name,
            Seat.x_pos,
            Seat.y_pos,
            Seat.status
        ).join(TicketType).filter(TicketType.event_id == event_id).all()

        return jsonify({
            'success': True,
            'data': [
                {
                    'seat_id': s.seat_id,
                    'row_name': s.row_name,
                    'seat_number': s.seat_number,
                    'ticket_type_id': s.ticket_type_id,
                    'area_name': s.area_name,
                    'x_pos': s.x_pos,
                    'y_pos': s.y_pos,
                    'status': s.status
                } for s in seats
            ]
        }), 200
    except Exception as e:
        import traceback
        print(f"Error in get_all_event_seats: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500

@seats_bp.route("/seats/initialize-default", methods=["POST"])
def initialize_default_seats():
    # ... (existing code but updated to handle quantity)
    try:
        data = request.get_json()
        ticket_type_id = data.get('ticket_type_id')
        rows = data.get('rows', 5)
        seats_per_row = data.get('seats_per_row', 10)
        
        ticket_type = TicketType.query.get(ticket_type_id)
        if not ticket_type: return jsonify({'success': False, 'message': 'Ticket type not found'}), 404
            
        Seat.query.filter_by(ticket_type_id=ticket_type_id).delete()
        
        row_names = "ABCDEFGHIJ"
        created_count = 0
        for r in range(rows):
            row_name = row_names[r] if r < len(row_names) else f"R{r}"
            for s in range(1, seats_per_row + 1):
                seat = Seat(ticket_type_id=ticket_type_id, row_name=row_name, seat_number=str(s), status='AVAILABLE', x_pos=s * 40, y_pos=(r + 1) * 40)
                db.session.add(seat)
                created_count += 1
        
        ticket_type.quantity = created_count
        db.session.commit()
        return jsonify({'success': True, 'message': f'Đã tạo thành công {created_count} ghế ngồi'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@seats_bp.route("/seats/assign-template", methods=["POST"])
def assign_seats_from_template():
    """Gán các ghế cụ thể từ template cho một hạng vé"""
    try:
        data = request.get_json()
        ticket_type_id = data.get('ticket_type_id')
        selected_seats = data.get('seats', []) # List of {row_name, seat_number, x_pos, y_pos}
        
        ticket_type = TicketType.query.get(ticket_type_id)
        if not ticket_type:
            return jsonify({'success': False, 'message': 'Ticket type not found'}), 404
        
        # 1. Lấy danh sách ghế hiện tại
        existing_seats = Seat.query.filter_by(ticket_type_id=ticket_type_id).all()
        
        # 2. Kiểm tra ghế nào đã có vé bán (không được xóa)
        from app.models.ticket import Ticket
        seats_with_tickets = set()
        for seat in existing_seats:
            has_ticket = db.session.query(Ticket).filter_by(seat_id=seat.seat_id).first()
            if has_ticket:
                seats_with_tickets.add(f"{seat.row_name}{seat.seat_number}")
        
        # 3. Tạo set các ghế mới được chọn
        new_seat_keys = set()
        for s_data in selected_seats:
            key = f"{s_data.get('row_name')}{s_data.get('seat_number')}"
            new_seat_keys.add(key)
        
        # 4. Xóa các ghế cũ KHÔNG có vé và KHÔNG nằm trong danh sách mới
        for seat in existing_seats:
            seat_key = f"{seat.row_name}{seat.seat_number}"
            if seat_key not in seats_with_tickets and seat_key not in new_seat_keys:
                db.session.delete(seat)
        
        # 5. Thêm các ghế mới (chỉ thêm nếu chưa tồn tại)
        existing_seat_keys = {f"{s.row_name}{s.seat_number}" for s in existing_seats}
        seats_to_insert = []
        
        for s_data in selected_seats:
            seat_key = f"{s_data.get('row_name')}{s_data.get('seat_number')}"
            if seat_key not in existing_seat_keys:
                seats_to_insert.append({
                    'ticket_type_id': ticket_type_id,
                    'row_name': s_data.get('row_name'),
                    'seat_number': str(s_data.get('seat_number')),
                    'area_name': s_data.get('area'),
                    'status': 'AVAILABLE',
                    'is_active': True,
                    'x_pos': s_data.get('x_pos'),
                    'y_pos': s_data.get('y_pos')
                })
        
        if seats_to_insert:
            db.session.bulk_insert_mappings(Seat, seats_to_insert)
        
        db.session.commit()
        
        # 6. Đếm lại tổng số ghế hiện tại
        final_seat_count = Seat.query.filter_by(ticket_type_id=ticket_type_id).count()
        ticket_type.quantity = final_seat_count
        db.session.commit()

        # 7. Cập nhật total_capacity của Event (tổng quantity của tất cả ticket types)
        # Fetch fresh event object
        event = db.session.query(Event).get(ticket_type.event_id)
        if event:
            from sqlalchemy import func
            total_cap = db.session.query(func.sum(TicketType.quantity)).filter(TicketType.event_id == event.event_id).scalar()
            event.total_capacity = int(total_cap or 0)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Đã cập nhật ghế cho hạng vé {ticket_type.type_name}. Tổng: {final_seat_count} ghế',
            'count': final_seat_count,
            'seats_with_tickets': len(seats_with_tickets)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@seats_bp.route("/seats/lock", methods=["POST"])
def lock_seat():
    """Lock a seat for reservation (5 minutes)"""
    try:
        data = request.get_json()
        seat_id = data.get('seat_id')
        user_id = data.get('user_id')
        event_id = data.get('event_id')
        
        if not all([seat_id, user_id, event_id]):
            return jsonify({'success': False, 'message': 'Missing required parameters'}), 400
        
        seat = Seat.query.get(seat_id)
        if not seat:
            return jsonify({'success': False, 'message': 'Seat not found'}), 404
        
        # Check if seat is available
        if seat.status != 'AVAILABLE':
            # Check for expired reservation
            existing_reservation = SeatReservation.query.filter_by(
                seat_id=seat_id,
                is_active=True
            ).first()
            
            if existing_reservation and existing_reservation.is_expired():
                # Clean up expired reservation
                seat.status = 'AVAILABLE'
                existing_reservation.is_active = False
                db.session.commit()
            elif seat.status == 'RESERVED':
                # Check if it's reserved by this user
                user_reservation = SeatReservation.query.filter_by(
                    seat_id=seat_id,
                    user_id=user_id,
                    is_active=True
                ).first()
                
                if user_reservation and not user_reservation.is_expired():
                    # User already has this seat reserved
                    return jsonify({
                        'success': True,
                        'message': 'Seat already reserved by you',
                        'data': {
                            'seat_id': seat_id,
                            'expires_at': user_reservation.expires_at.isoformat()
                        }
                    }), 200
                else:
                    return jsonify({'success': False, 'message': 'Seat is already reserved'}), 409
        
        # Create reservation
        reservation = SeatReservation(
            seat_id=seat_id,
            user_id=user_id,
            event_id=event_id,
            reservation_duration_minutes=5
        )
        
        seat.status = 'RESERVED'
        db.session.add(reservation)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Seat reserved successfully',
            'data': {
                'seat_id': seat_id,
                'expires_at': reservation.expires_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@seats_bp.route("/seats/unlock", methods=["POST"])
def unlock_seat():
    """Unlock a seat reservation"""
    try:
        data = request.get_json()
        seat_id = data.get('seat_id')
        user_id = data.get('user_id')
        event_id = data.get('event_id')
        
        if not all([seat_id, user_id, event_id]):
            return jsonify({'success': False, 'message': 'Missing required parameters'}), 400
        
        seat = Seat.query.get(seat_id)
        if not seat:
            return jsonify({'success': False, 'message': 'Seat not found'}), 404
        
        # Find active reservation for this user
        reservation = SeatReservation.query.filter_by(
            seat_id=seat_id,
            user_id=user_id,
            is_active=True
        ).first()
        
        if reservation:
            reservation.is_active = False
            seat.status = 'AVAILABLE'
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Seat unlocked successfully'
            }), 200
        else:
            return jsonify({'success': False, 'message': 'No active reservation found'}), 404
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@seats_bp.route("/seats/my-reservations/<int:event_id>/<int:user_id>", methods=["GET"])
def get_my_reservations(event_id, user_id):
    """Get active reservations for a user in an event"""
    try:
        reservations = SeatReservation.query.filter_by(
            event_id=event_id,
            user_id=user_id,
            is_active=True
        ).all()
        
        # Filter out expired reservations
        active_reservations = []
        for reservation in reservations:
            if not reservation.is_expired():
                active_reservations.append(reservation)
            else:
                # Clean up expired reservation
                seat = Seat.query.get(reservation.seat_id)
                if seat:
                    seat.status = 'AVAILABLE'
                reservation.is_active = False
        
        if active_reservations:
            db.session.commit()
        
        return jsonify({
            'success': True,
            'data': [r.to_dict() for r in active_reservations]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@seats_bp.route("/seats/unlock-all", methods=["POST"])
def unlock_all_seats():
    """Unlock all seats for a user in an event (used when leaving checkout)"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        event_id = data.get('event_id')
        
        if not all([user_id, event_id]):
            return jsonify({'success': False, 'message': 'Missing required parameters'}), 400
        
        # Find all active reservations for this user in this event
        reservations = SeatReservation.query.filter_by(
            event_id=event_id,
            user_id=user_id,
            is_active=True
        ).all()
        
        unlocked_count = 0
        for reservation in reservations:
            seat = Seat.query.get(reservation.seat_id)
            if seat:
                seat.status = 'AVAILABLE'
                reservation.is_active = False
                unlocked_count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Unlocked {unlocked_count} seats',
            'unlocked_count': unlocked_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
