from app.extensions import db
from app.services.logging_config import log_action

def log_admin_action(action, details=None):
    """
    Logs an action to the file-based action log.
    Replaces the database-backed AuditLog since auth is removed.
    """
    log_action(action, details)
