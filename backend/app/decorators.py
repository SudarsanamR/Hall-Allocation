from functools import wraps
from flask import session, jsonify, request, current_app
import secrets
import time

# In-memory token store for offline desktop mode
# Format: {token: {'user_id': id, 'role': role, 'expires': timestamp}}
_auth_tokens = {}

def generate_auth_token(user_id, role, expires_in=86400):
    """Generate a simple auth token for offline mode (24 hour expiry)"""
    token = secrets.token_urlsafe(32)
    _auth_tokens[token] = {
        'user_id': user_id,
        'role': role,
        'expires': time.time() + expires_in
    }
    # Clean up expired tokens
    cleanup_expired_tokens()
    return token

def validate_auth_token(token):
    """Validate token and return user info or None"""
    if not token or token not in _auth_tokens:
        return None
    
    token_data = _auth_tokens[token]
    if time.time() > token_data['expires']:
        del _auth_tokens[token]
        return None
    
    return token_data

def invalidate_auth_token(token):
    """Invalidate/delete a token (for logout)"""
    if token in _auth_tokens:
        del _auth_tokens[token]

def cleanup_expired_tokens():
    """Remove expired tokens from memory"""
    current_time = time.time()
    expired = [token for token, data in _auth_tokens.items() if current_time > data['expires']]
    for token in expired:
        del _auth_tokens[token]

def get_current_user():
    """Get current user from session or token - returns (user_id, role) or (None, None)"""
    # First check session (production/web mode)
    if 'user_id' in session:
        return session['user_id'], session.get('role')
    
    # Then check Authorization header (offline desktop mode)
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]  # Remove 'Bearer ' prefix
        token_data = validate_auth_token(token)
        if token_data:
            return token_data['user_id'], token_data['role']
    
    return None, None

def login_required(f):
    """
    Decorator to ensure user is logged in.
    Supports both session-based and token-based auth.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id, role = get_current_user()
        if not user_id:
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        # Store in request context for easy access in route handlers
        request.current_user_id = user_id
        request.current_user_role = role
        return f(*args, **kwargs)
    return decorated_function

def role_required(roles):
    """
    Decorator to ensure user has one of the allowed roles.
    Supports both session-based and token-based auth.
    Args:
        roles (list or str): List of allowed roles or single role string.
    """
    if isinstance(roles, str):
        roles = [roles]
        
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id, role = get_current_user()
            if not user_id:
                return jsonify({'success': False, 'message': 'Not authenticated'}), 401
            
            if not role or role not in roles:
                return jsonify({'success': False, 'message': 'Access denied'}), 403
            
            request.current_user_id = user_id
            request.current_user_role = role
            return f(*args, **kwargs)
        return decorated_function
    return decorator
