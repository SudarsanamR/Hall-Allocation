from app.extensions import db
from app.models.sql import AuditLog
from flask import request

def log_action(admin_id, action, details=None):
    """
    Logs an action performed by an admin.
    
    Args:
        admin_id (int): The ID of the admin performing the action.
        action (str): Short action string (e.g., 'LOGIN', 'CREATE_ADMIN').
        details (str, optional): Additional details about the action.
    """
    try:
        # Get IP address if in request context
        ip_address = request.remote_addr if request else None
        
        log = AuditLog(
            admin_id=admin_id,
            action=action,
            details=details,
            ip_address=ip_address
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Failed to write audit log: {e}")
