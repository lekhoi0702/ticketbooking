from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.user import User
import jwt
from datetime import datetime, timedelta
import os

auth_bp = Blueprint("auth", __name__)
SECRET_KEY = os.getenv("SECRET_KEY", "ticket_secret_key_2026")

@auth_bp.route("/auth/login", methods=["POST"])
def login():
    """Đăng nhập người dùng bằng email, SĐT hoặc username (identifier)"""
    try:
        data = request.get_json()
        identifier = data.get('email') or data.get('username') or data.get('identifier')
        password = data.get('password')
        required_role = data.get('required_role') # Optional: ADMIN, ORGANIZER, USER
        
        if not identifier or not password:
            return jsonify({'success': False, 'message': 'Vui lòng nhập đầy đủ thông tin'}), 400

        # Try to find user by email or phone
        user = User.query.filter((User.email == identifier) | (User.phone == identifier)).first()
        
        if user and user.check_password(password):
            if not user.is_active:
                return jsonify({
                    'success': False, 
                    'message': 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.'
                }), 403
                
            user_data = user.to_dict()
            
            # Check for required role if specified
            if required_role and user_data['role'] != required_role:
                role_names = {
                    'ADMIN': 'Quản trị viên',
                    'ORGANIZER': 'Nhà tổ chức',
                    'USER': 'Khách hàng'
                }
                actual_role = role_names.get(user_data['role'], user_data['role'])
                targ_role = role_names.get(required_role, required_role)
                return jsonify({
                    'success': False, 
                    'message': f'Tài khoản này là {actual_role}. Vui lòng đăng nhập tại trang dành cho {actual_role}.'
                }), 403

            token = jwt.encode({
                'user_id': user.user_id,
                'role': user_data['role'],
                'exp': datetime.utcnow() + timedelta(days=1)
            }, SECRET_KEY, algorithm="HS256")
            
            return jsonify({
                'success': True,
                'token': token,
                'user': user_data
            }), 200
            
        return jsonify({'success': False, 'message': 'Tài khoản hoặc mật khẩu không chính xác'}), 401
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route("/auth/register", methods=["POST"])
def register():
    """Đăng ký tài khoản mới cho khách hàng"""
    try:
        data = request.get_json()
        
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email đã tồn tại'}), 400
        
        # Check if phone already exists
        if data.get('phone') and User.query.filter_by(phone=data['phone']).first():
            return jsonify({'success': False, 'message': 'Số điện thoại đã tồn tại'}), 400
            
        new_user = User(
            email=data['email'],
            full_name=data['full_name'],
            phone=data.get('phone'),  # Add phone
            role_id=3,  # Default to Customer (USER)
            is_active=True
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đăng ký thành công'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route("/auth/change-password", methods=["POST"])
def change_password():
    """Đổi mật khẩu người dùng"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        if not user_id or not old_password or not new_password:
            return jsonify({
                'success': False, 
                'message': 'Vui lòng nhập đầy đủ thông tin'
            }), 400
        
        # Find user
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False, 
                'message': 'Không tìm thấy người dùng'
            }), 404
        
        # Verify old password
        if not user.check_password(old_password):
            return jsonify({
                'success': False, 
                'message': 'Mật khẩu hiện tại không chính xác'
            }), 401
        
        # Validate new password
        if len(new_password) < 6:
            return jsonify({
                'success': False, 
                'message': 'Mật khẩu mới phải có ít nhất 6 ký tự'
            }), 400
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đổi mật khẩu thành công'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

