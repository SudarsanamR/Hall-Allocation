from flask import Blueprint, request, jsonify

bp = Blueprint('auth', __name__, url_prefix='/api')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    password = data.get('password')

    # Hardcoded password as requested
    if password == "ExamAdmin":
        return jsonify({'success': True, 'message': 'Authentication successful'}), 200
    
    return jsonify({'success': False, 'message': 'Invalid password'}), 401
