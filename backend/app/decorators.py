from functools import wraps
from flask import session, jsonify

def login_required(f):
    """
    Decorator to ensure user is logged in.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        return f(*args, **kwargs)
    return decorated_function

def role_required(roles):
    """
    Decorator to ensure user has one of the allowed roles.
    Args:
        roles (list or str): List of allowed roles or single role string.
    """
    if isinstance(roles, str):
        roles = [roles]
        
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'success': False, 'message': 'Not authenticated'}), 401
            
            user_role = session.get('role')
            if not user_role or user_role not in roles:
                 return jsonify({'success': False, 'message': 'Access denied'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
