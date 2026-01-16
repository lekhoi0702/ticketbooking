from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.seat import Seat
from app.models.ticket_type import TicketType

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
        seats = db.session.query(
            Seat.row_name, 
            Seat.seat_number, 
            Seat.ticket_type_id,
            Seat.area_name,
            Seat.x_pos,
            Seat.y_pos
        ).join(TicketType).filter(TicketType.event_id == event_id).all()
        
        return jsonify({
            'success': True,
            'data': [
                {
                    'row_name': s.row_name,
                    'seat_number': s.seat_number,
                    'ticket_type_id': s.ticket_type_id,
                    'area_name': s.area_name,
                    'x_pos': s.x_pos,
                    'y_pos': s.y_pos
                } for s in seats
            ]
        }), 200
    except Exception as e:
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
        
        return jsonify({
            'success': True,
            'message': f'Đã cập nhật ghế cho hạng vé {ticket_type.type_name}. Tổng: {final_seat_count} ghế',
            'count': final_seat_count,
            'seats_with_tickets': len(seats_with_tickets)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
