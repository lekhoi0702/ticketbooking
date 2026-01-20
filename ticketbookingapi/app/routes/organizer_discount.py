from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.discount import Discount
from app.models.event import Event
from datetime import datetime

organizer_discount_bp = Blueprint("organizer_discount", __name__)

@organizer_discount_bp.route("/organizer/discounts", methods=["POST"])
def create_discount():
    try:
        data = request.json
        manager_id = data.get('manager_id')
        code = data.get('code')
        
        if not manager_id or not code:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
            
        if Discount.query.filter_by(discount_code=code).first():
            return jsonify({'success': False, 'message': 'Mã giảm giá đã tồn tại'}), 400

        start_str = data.get('start_date', '').replace('Z', '')
        end_str = data.get('end_date', '').replace('Z', '')

        discount = Discount(
            manager_id=manager_id,
            event_id=data.get('event_id'),
            discount_code=code,
            discount_name=data.get('name', ''),
            discount_type=data.get('discount_type', 'PERCENTAGE'),
            discount_value=data.get('value', 0),
            min_order_amount=0,
            start_date=datetime.fromisoformat(start_str),
            end_date=datetime.fromisoformat(end_str),
            usage_limit=data.get('usage_limit', 0),
            is_active=True
        )
        
        db.session.add(discount)
        db.session.commit()
        
        return jsonify({'success': True, 'data': discount.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_discount_bp.route("/organizer/discounts", methods=["GET"])
def get_discounts():
    try:
        manager_id = request.args.get('manager_id', type=int)
        if not manager_id:
             return jsonify({'success': False, 'message': 'Missing manager_id'}), 400
             
        discounts = Discount.query.filter_by(manager_id=manager_id).order_by(Discount.created_at.desc()).all()
        
        result = []
        for d in discounts:
            item = d.to_dict()
            # Map fields for Frontend
            item['id'] = d.discount_id
            item['code'] = d.discount_code
            item['name'] = d.discount_name
            item['value'] = float(d.discount_value)
            
            # Status logic
            if not d.is_active:
                item['status'] = 'INACTIVE'
            elif d.end_date < datetime.utcnow():
                item['status'] = 'EXPIRED'
            else:
                item['status'] = 'ACTIVE'
                
            item['start_date'] = d.start_date.isoformat()
            item['end_date'] = d.end_date.isoformat()

            if d.event_id:
                ev = Event.query.get(d.event_id)
                item['event_name'] = ev.event_name if ev else 'Unknown'
            else:
                item['event_name'] = 'Tất cả sự kiện'
            result.append(item)

        return jsonify({
            'success': True, 
            'data': result
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_discount_bp.route("/organizer/discounts/<int:id>", methods=["PUT"])
def update_discount(id):
    try:
        data = request.json
        discount = Discount.query.get_or_404(id)
        
        if 'name' in data: discount.discount_name = data['name']
        if 'value' in data: discount.discount_value = data['value']
        if 'discount_type' in data: discount.discount_type = data['discount_type']
        if 'usage_limit' in data: discount.usage_limit = data['usage_limit']
        if 'event_id' in data: discount.event_id = data['event_id']

        if 'start_date' in data:
            start_str = data['start_date'].replace('Z', '')
            discount.start_date = datetime.fromisoformat(start_str)
        if 'end_date' in data:
            end_str = data['end_date'].replace('Z', '')
            discount.end_date = datetime.fromisoformat(end_str)

        if 'status' in data:
            new_status = data['status']
            if new_status == 'ACTIVE':
                # Check if it's already expired
                if discount.end_date < datetime.utcnow():
                    return jsonify({'success': False, 'message': 'Không thể kích hoạt mã đã hết hạn'}), 400
                discount.is_active = True
            elif new_status == 'INACTIVE':
                discount.is_active = False

        db.session.commit()
        return jsonify({'success': True, 'message': 'Updated successfully', 'data': discount.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_discount_bp.route("/organizer/discounts/<int:id>", methods=["DELETE"])
def delete_discount(id):
    try:
        discount = Discount.query.get_or_404(id)
        db.session.delete(discount)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Deleted successfully'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
