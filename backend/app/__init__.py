"""
Flask Application Initialization — Offline Desktop Mode Only
"""
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
import os

# Global migrate instance
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['SECRET_KEY'] = os.environ.get(
        'SECRET_KEY', 
        'dev-398f63ae02f252b8835ec812dfad9310d2e10078c0b6845b'
    )
    
    # CORS — localhost + Tauri origins only
    allowed_origins = [
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://localhost:1420", 
        "http://127.0.0.1:1420",
        "tauri://localhost",
        "https://tauri.localhost",
        "http://tauri.localhost",
        "null",
    ]
    
    CORS(app, resources={r"/*": {
        "origins": allowed_origins,
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})
    
    # Database Config — SQLite only (each desktop has its own DB)
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Session Cookie Config for Tauri
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_PATH'] = '/'
    app.config['WTF_CSRF_ENABLED'] = False
    
    # Initialize Extensions
    from app.extensions import db, compress
    db.init_app(app)
    compress.init_app(app)
    
    # Initialize Flask-Migrate
    migrate.init_app(app, db)
    
    # Create Tables & Seed Data
    with app.app_context():
        from app import models  # Register models with SQLAlchemy
        db.create_all()
        
        # Auto-seed default halls if empty
        from app.routes.halls import bootstrap_halls
        bootstrap_halls()

        # Auto-seed default subject codes if empty
        from app.services.subject_service import seed_default_subjects
        seed_default_subjects()

    # Register blueprints (no auth, no admin, no csrf)
    from app.routes import upload, halls, seating, config
    app.register_blueprint(upload.bp)
    app.register_blueprint(halls.bp)
    app.register_blueprint(seating.bp)
    app.register_blueprint(config.bp)
    
    # Error Handlers
    from flask import jsonify
    
    @app.errorhandler(413)
    def too_large(e):
        return jsonify({'success': False, 'message': 'File too large (16MB max)'}), 413
    
    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'success': False, 'message': 'Internal server error'}), 500
    
    return app
