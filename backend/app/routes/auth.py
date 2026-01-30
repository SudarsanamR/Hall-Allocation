from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from app.models import Admin
from app.extensions import db

bp = Blueprint('auth', __name__, url_prefix='/api')

@bp.route('/register', methods=['POST'])
def register():
    """Register a new admin"""
    data = request.json
    required_fields = ['username', 'password', 'security_question', 'security_answer']
    
    if not data or not all(k in data for k in required_fields):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    username = data['username'].strip()
    
    # Check if username exists
    if Admin.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 409
        
    # Create new admin
    new_admin = Admin(
        id=str(uuid.uuid4()),
        username=username,
        password_hash=generate_password_hash(data['password']),
        security_question=data['security_question'],
        security_answer_hash=generate_password_hash(data['security_answer'].lower().strip()) # Case-insensitive answer
    )
    
    db.session.add(new_admin)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Registration successful'}), 201

@bp.route('/login', methods=['POST'])
def login():
    """Admin login"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400

    admin = Admin.query.filter_by(username=username).first()
    
    if admin and check_password_hash(admin.password_hash, password):
        return jsonify({'success': True, 'message': 'Authentication successful'}), 200
    
    return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

@bp.route('/get_security_question', methods=['POST'])
def get_security_question():
    """Get security question for a username"""
    data = request.json
    username = data.get('username')
    
    if not username:
        return jsonify({'success': False, 'message': 'Username required'}), 400
        
    admin = Admin.query.filter_by(username=username).first()
    if not admin:
        return jsonify({'success': False, 'message': 'User not found'}), 404
        
    return jsonify({'success': True, 'question': admin.security_question}), 200

@bp.route('/reset_password', methods=['POST'])
def reset_password():
    """Reset password using security answer"""
    data = request.json
    username = data.get('username')
    security_answer = data.get('security_answer')
    new_password = data.get('new_password')
    
    if not all([username, security_answer, new_password]):
        return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
    admin = Admin.query.filter_by(username=username).first()
    if not admin:
        return jsonify({'success': False, 'message': 'User not found'}), 404
        
    # Verify answer (case-insensitive)
    if not check_password_hash(admin.security_answer_hash, security_answer.lower().strip()):
        return jsonify({'success': False, 'message': 'Incorrect security answer'}), 401
        
    # Update password
    admin.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Password reset successful'}), 200
