"""
Configuration settings for the Flask application
"""
import os

class Config:
    _secret = os.environ.get('SECRET_KEY')
    if not _secret:
        if os.environ.get('FLASK_ENV') == 'production' or os.environ.get('RENDER'):
            raise RuntimeError("SECRET_KEY environment variable must be set in production!")
        _secret = 'dev-398f63ae02f252b8835ec812dfad9310d2e10078c0b6845b' # Rotated dev key
    SECRET_KEY = _secret
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_FOLDER = 'uploads'
