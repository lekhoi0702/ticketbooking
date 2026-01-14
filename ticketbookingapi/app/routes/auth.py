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
    """Đăng nhập người dùng bằng email hoặc số điện thoại"""
    try:
        data = request.get_json()
        email_or_phone = data.get('email')  # Can be email or phone
        password = data.get('password')
        
        # Try to find user by email or phone
        user = None
        if '@' in email_or_phone:
            # It's an email
            user = User.query.filter_by(email=email_or_phone).first()
        else:
            # It's a phone number
            user = User.query.filter_by(phone=email_or_phone).first()
        
        if user and user.check_password(password):
            user_data = user.to_dict()
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
            
        return jsonify({'success': False, 'message': 'Email/SĐT hoặc mật khẩu không chính xác'}), 401
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
