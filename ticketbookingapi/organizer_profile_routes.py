"""
Add these routes to app/routes/organizer.py at the end of the file
"""

@organizer_bp.route("/organizer/profile/<int:user_id>", methods=["GET"])
def get_organizer_profile(user_id):
    """Get organizer profile information"""
    try:
        from app.models.organizer_info import OrganizerInfo
        from app.models.user import User
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        organizer_info = OrganizerInfo.query.filter_by(user_id=user_id).first()
        
        if not organizer_info:
            # Create default organizer info if doesn't exist
            organizer_info = OrganizerInfo(
                user_id=user_id,
                organization_name=user.full_name
            )
            db.session.add(organizer_info)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                **organizer_info.to_dict(),
                'user_email': user.email,
                'user_full_name': user.full_name
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@organizer_bp.route("/organizer/profile/<int:user_id>", methods=["PUT"])
def update_organizer_profile(user_id):
    """Update organizer profile information"""
    try:
        from app.models.organizer_info import OrganizerInfo
        
        organizer_info = OrganizerInfo.query.filter_by(user_id=user_id).first()
        
        if not organizer_info:
            return jsonify({'success': False, 'message': 'Organizer info not found'}), 404
        
        data = request.form
        
        # Update text fields
        if data.get('organization_name'):
            organizer_info.organization_name = data.get('organization_name')
        if data.get('description'):
            organizer_info.description = data.get('description')
        if data.get('website'):
            organizer_info.website = data.get('website')
        if data.get('address'):
            organizer_info.address = data.get('address')
        if data.get('contact_phone'):
            organizer_info.contact_phone = data.get('contact_phone')
        if data.get('social_facebook'):
            organizer_info.social_facebook = data.get('social_facebook')
        if data.get('social_instagram'):
            organizer_info.social_instagram = data.get('social_instagram')
        if data.get('tax_code'):
            organizer_info.tax_code = data.get('tax_code')
        if data.get('bank_account'):
            organizer_info.bank_account = data.get('bank_account')
        
        # Handle logo upload
        if 'logo' in request.files:
            file = request.files['logo']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"organizer_{user_id}_logo_{timestamp}_{filename}"
                
                # Create organizer logo directory
                logo_folder = os.path.join(UPLOAD_FOLDER, 'organizer', 'info', 'logo')
                os.makedirs(logo_folder, exist_ok=True)
                
                filepath = os.path.join(logo_folder, filename)
                file.save(filepath)
                organizer_info.logo_url = f"/uploads/organizer/info/logo/{filename}"
        
        # Handle bank QR code upload
        if 'bank_qr_code' in request.files:
            file = request.files['bank_qr_code']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"organizer_{user_id}_qr_{timestamp}_{filename}"
                
                # Create organizer QR directory
                qr_folder = os.path.join(UPLOAD_FOLDER, 'organizer', 'info', 'qr')
                os.makedirs(qr_folder, exist_ok=True)
                
                filepath = os.path.join(qr_folder, filename)
                file.save(filepath)
                organizer_info.bank_qr_code = f"/uploads/organizer/info/qr/{filename}"
        
        organizer_info.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cập nhật thông tin thành công',
            'data': organizer_info.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500
