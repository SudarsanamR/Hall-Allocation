from flask import Blueprint, request, jsonify, session
from app.models.sql import Admin, AuditLog, db
from app.services.audit import log_action
from app.decorators import get_current_user

bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@bp.before_request
def restrict_access():
    if request.method == 'OPTIONS':
        return
    
    # Use get_current_user which checks both session and Authorization token
    user_id, role = get_current_user()
    
    if not user_id:
         return jsonify({'success': False, 'message': 'Not authenticated'}), 401
    
    if role != 'super_admin':
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    
    # Store for use in route handlers
    request.current_user_id = user_id
    request.current_user_role = role

@bp.route('/users', methods=['GET'])
def get_users():
    users = Admin.query.order_by(Admin.created_at.desc()).all()
    # Don't show password hashes
    return jsonify({
        'success': True,
        'users': [u.to_dict() for u in users]
    }), 200

@bp.route('/users/<int:user_id>/verify', methods=['PUT'])
def verify_user(user_id):
    user = Admin.query.get(user_id)
    if not user:
         return jsonify({'success': False, 'message': 'User not found'}), 404
         
    user.is_verified = True
    db.session.commit()
    
    log_action(request.current_user_id, 'VERIFY_ADMIN', f'Verified admin {user.username}')
    
    return jsonify({'success': True, 'message': 'User verified'}), 200

@bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = Admin.query.get(user_id)
    if not user:
         return jsonify({'success': False, 'message': 'User not found'}), 404
    
    if user.role == 'super_admin':
        return jsonify({'success': False, 'message': 'Cannot delete Super Admin'}), 403
        
    db.session.delete(user)
    db.session.commit()
    
    log_action(request.current_user_id, 'DELETE_ADMIN', f'Deleted admin {user.username}')
    
    return jsonify({'success': True, 'message': 'User deleted'}), 200

@bp.route('/logs', methods=['GET'])
def get_logs():
    # Simple limit 100 for MVP
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify({
        'success': True,
        'logs': [l.to_dict() for l in logs]
    }), 200

@bp.route('/logs', methods=['DELETE'])
def delete_logs():
    if request.current_user_role != 'super_admin':
         return jsonify({'success': False, 'message': 'Access denied'}), 403
         
    try:
        num_deleted = db.session.query(AuditLog).delete()
        db.session.commit()
        # We need to manually log this action since we just deleted all logs!
        # Re-adding a log entry for this action
        log_action(request.current_user_id, 'CLEAR_LOGS', f'Cleared previous audit logs')
        
        return jsonify({'success': True, 'message': 'All logs cleared'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
