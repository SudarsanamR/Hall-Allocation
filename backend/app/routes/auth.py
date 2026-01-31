from flask import Blueprint, request, jsonify, session
from app.models.sql import Admin, db
from werkzeug.security import check_password_hash, generate_password_hash
from app.services.audit import log_action
from datetime import datetime

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Missing credentials'}), 400

    admin = Admin.query.filter_by(username=username).first()

    if admin and check_password_hash(admin.password_hash, password):
        if not admin.is_verified:
            return jsonify({'success': False, 'message': 'Account pending approval from Super Admin'}), 403
            
        session.permanent = True
        session['user_id'] = admin.id
        session['role'] = admin.role
        
        admin.last_login = datetime.utcnow()
        db.session.commit()
        
        log_action(admin.id, 'LOGIN', 'User logged in')
        
        return jsonify({
            'success': True,
            'user': admin.to_dict()
        }), 200
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@bp.route('/register', methods=['POST'])
def register():
    # Only for creating NEW admins (Role: admin)
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    security_question = data.get('security_question')
    security_answer = data.get('security_answer')

    if not all([username, password, security_question, security_answer]):
         return jsonify({'success': False, 'message': 'All fields are required'}), 400

    if Admin.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 409

    new_admin = Admin(
        username=username,
        password_hash=generate_password_hash(password),
        role='admin',
        is_verified=False, # Requires approval
        security_question=security_question,
        security_answer_hash=generate_password_hash(security_answer)
    )
    
    db.session.add(new_admin)
    db.session.commit()
    
    log_action(new_admin.id, 'REGISTER', f'New admin registered: {username}')

    return jsonify({'success': True, 'message': 'Registration successful. Waiting for Super Admin approval.'}), 201

@bp.route('/logout', methods=['POST'])
def logout():
    user_id = session.get('user_id')
    if user_id:
        log_action(user_id, 'LOGOUT', 'User logged out')
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out'}), 200

@bp.route('/me', methods=['GET'])
def me():
    if 'user_id' not in session:
        return jsonify({'authenticated': False}), 401
        
    admin = Admin.query.get(session['user_id'])
    if not admin:
        session.clear()
        return jsonify({'authenticated': False}), 401
        
    return jsonify({
        'authenticated': True,
        'user': admin.to_dict()
    }), 200

@bp.route('/security-task', methods=['POST'])
def security_task():
    # Step 1 of Forgot Password: Get Security Question
    data = request.get_json()
    username = data.get('username')
    
    admin = Admin.query.filter_by(username=username).first()
    if not admin:
        return jsonify({'success': False, 'message': 'User not found'}), 404
        
    if admin.role == 'super_admin':
        return jsonify({'success': False, 'message': 'Super Admin cannot reset password this way'}), 403
        
    return jsonify({
        'success': True,
        'question': admin.security_question
    }), 200

@bp.route('/reset-password', methods=['POST'])
def reset_password():
    # Step 2 of Forgot Password: Verify Answer & Reset
    data = request.get_json()
    username = data.get('username')
    answer = data.get('answer')
    new_password = data.get('new_password')
    
    admin = Admin.query.filter_by(username=username).first()
    if not admin:
        return jsonify({'success': False, 'message': 'User not found'}), 404
        
    if admin.role == 'super_admin':
        return jsonify({'success': False, 'message': 'Super Admin cannot reset password this way'}), 403
        
    if not check_password_hash(admin.security_answer_hash, answer):
        return jsonify({'success': False, 'message': 'Incorrect security answer'}), 401
        
    admin.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    log_action(admin.id, 'PASSWORD_RESET', 'Password reset via security question')
    
    return jsonify({'success': True, 'message': 'Password reset successful'}), 200

@bp.route('/change-password', methods=['POST'])
def change_password():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    admin = Admin.query.get(session['user_id'])
    
    if not check_password_hash(admin.password_hash, old_password):
        return jsonify({'success': False, 'message': 'Incorrect current password'}), 400
        
    admin.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    log_action(admin.id, 'PASSWORD_CHANGE', 'Password changed logged in')
    
    return jsonify({'success': True, 'message': 'Password changed successfully'}), 200
@bp.route('/update-profile', methods=['PUT'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
    data = request.get_json()
    current_password = data.get('current_password')
    new_username = data.get('username')
    new_password = data.get('new_password')
    
    if not current_password:
        return jsonify({'success': False, 'message': 'Current password is required'}), 400
        
    admin = Admin.query.get(session['user_id'])
    
    if not check_password_hash(admin.password_hash, current_password):
        return jsonify({'success': False, 'message': 'Incorrect current password'}), 400
        
    # Update Username
    if new_username and new_username != admin.username:
        if Admin.query.filter_by(username=new_username).first():
            return jsonify({'success': False, 'message': 'Username already taken'}), 409
        
        log_action(admin.id, 'UPDATE_X_USERNAME', f'Changed username from {admin.username} to {new_username}')
        admin.username = new_username
        # Update session if needed? No, session stores user_id. But frontend might store username.
        
    # Update Password
    if new_password:
        admin.password_hash = generate_password_hash(new_password)
        log_action(admin.id, 'UPDATE_X_PASSWORD', 'Password changed')
        
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'user': admin.to_dict()
    }), 200
