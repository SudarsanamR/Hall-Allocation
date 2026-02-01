from flask import Blueprint, request, jsonify, session, current_app
from app.models.sql import Admin, db
from werkzeug.security import check_password_hash, generate_password_hash
from app.services.audit import log_action
from datetime import datetime
from app.decorators import login_required, role_required

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Input validation constants
MAX_USERNAME_LENGTH = 80
MAX_PASSWORD_LENGTH = 128
MAX_SECURITY_QUESTION_LENGTH = 255
MAX_SECURITY_ANSWER_LENGTH = 255

def validate_input_length(data, field, max_length):
    """Validate input field length"""
    value = data.get(field, '')
    if value and len(value) > max_length:
        return False
    return True

@bp.route('/login', methods=['POST'])
def login():
    # Rate limiting applied via decorator or manually
    limiter = current_app.limiter
    
    data = request.get_json()
    username = data.get('username', '')[:MAX_USERNAME_LENGTH]  # Truncate to max
    password = data.get('password', '')[:MAX_PASSWORD_LENGTH]

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
    # ... existing code ...
    # Only for creating NEW admins (Role: admin)
    data = request.get_json()
    username = data.get('username', '')[:MAX_USERNAME_LENGTH]
    password = data.get('password', '')[:MAX_PASSWORD_LENGTH]
    security_question = data.get('security_question', '')[:MAX_SECURITY_QUESTION_LENGTH]
    security_answer = data.get('security_answer', '')[:MAX_SECURITY_ANSWER_LENGTH]

    if not all([username, password, security_question, security_answer]):
         return jsonify({'success': False, 'message': 'All fields are required'}), 400

    # Minimum length validation
    if len(username) < 3:
        return jsonify({'success': False, 'message': 'Username must be at least 3 characters'}), 400
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400

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
@login_required
def logout():
    user_id = session.get('user_id')
    if user_id:
        log_action(user_id, 'LOGOUT', 'User logged out')
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out'}), 200

@bp.route('/me', methods=['GET'])
@login_required
def me():
    # Decorator checks 'user_id' in session
        
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
    username = data.get('username', '')[:MAX_USERNAME_LENGTH]
    answer = data.get('answer', '')[:MAX_SECURITY_ANSWER_LENGTH]
    new_password = data.get('new_password', '')[:MAX_PASSWORD_LENGTH]
    
    if not all([username, answer, new_password]):
        return jsonify({'success': False, 'message': 'All fields are required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
    
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
@login_required
def change_password():
    # removed manual session check
        
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
@login_required
def update_profile():
    # Removed manual session check
        
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
