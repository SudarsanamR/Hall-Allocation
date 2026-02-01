"""
Flask Application Initialization
"""
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
import os
import secrets
from flask_wtf.csrf import CSRFProtect

# Global migrate instance
migrate = Migrate()
csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)
    
    # Determine environment
    is_production = os.environ.get('FLASK_ENV') == 'production' or os.environ.get('RENDER')
    
    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['UPLOAD_FOLDER'] = 'uploads'
    
    # SECRET KEY - MUST be set in production
    secret_key = os.environ.get('SECRET_KEY')
    if is_production and not secret_key:
        raise RuntimeError("SECRET_KEY environment variable must be set in production!")
    app.config['SECRET_KEY'] = secret_key or 'dev-398f63ae02f252b8835ec812dfad9310d2e10078c0b6845b'
    
    # CORS Configuration - Stricter in production
    if is_production:
        allowed_origins = [
            os.environ.get('FRONTEND_URL', 'https://gcee-hall-allocation.vercel.app'),
        ]
    else:
        allowed_origins = [
            "http://localhost:5173", 
            "http://127.0.0.1:5173", 
            "http://localhost:1420", 
            "http://127.0.0.1:1420",
            "tauri://localhost",
            "https://tauri.localhost"
        ]
    
    CORS(app, resources={r"/*": {
        "origins": allowed_origins,
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization", "X-CSRFToken"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})
    
    # Rate Limiting
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"
    )
    
    # Store limiter on app for use in routes
    app.limiter = limiter
    
    # Database Config
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
        
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Session Cookie Config - Secure in production
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' if not is_production else 'None'
    app.config['SESSION_COOKIE_SECURE'] = is_production  # True in production (HTTPS)
    app.config['SESSION_COOKIE_HTTPONLY'] = True

    # Initialize Extensions
    from app.extensions import db, compress
    db.init_app(app)
    compress.init_app(app)
    
    # Initialize Flask-Migrate
    migrate.init_app(app, db)
    
    # Initialize CSRF Protection
    csrf.init_app(app)
    
    # Create Tables (only in development, use migrations in production)
    with app.app_context():
        from app import models  # Import models so they are registered with SQLAlchemy
        
        # In development, create tables directly
        # In production, use flask db upgrade
        if not is_production:
            db.create_all()
        
        # Auto-seed default halls if empty
        from app.routes.halls import bootstrap_halls
        bootstrap_halls()

        # Auto-seed Super Admin with secure password
        from app.models.sql import Admin
        from werkzeug.security import generate_password_hash
        from app.services.logging_config import log_info, log_warning
        
        super_admin = Admin.query.filter_by(role='super_admin').first()
        if not super_admin:
            log_info("Creating default Super Admin...")
            # Generate a secure random password or use env variable
            default_password = os.environ.get('SUPER_ADMIN_PASSWORD') or secrets.token_urlsafe(16)
            
            if not os.environ.get('SUPER_ADMIN_PASSWORD'):
                # Bypass logger to prevent saving password to log files
                # Print directly to stdout for immediate one-time visibility
                print(f"\n{'!'*60}")
                print(f"IMPORTANT: SUPER ADMIN DEFAULT PASSWORD: {default_password}")
                print("Please change this immediately or set SUPER_ADMIN_PASSWORD env variable!")
                print(f"{'!'*60}\n")
            
             # log_warning removed to protect secrets
            
            hashed_password = generate_password_hash(default_password)
            new_super_admin = Admin(
                username=os.environ.get('SUPER_ADMIN_USERNAME', 'SuperAdmin'),
                password_hash=hashed_password,
                role='super_admin',
                is_verified=True,
                security_question="Initial Setup",
                security_answer_hash=generate_password_hash(secrets.token_urlsafe(8))
            )
            db.session.add(new_super_admin)
            db.session.commit()
            log_info("Super Admin created.")

    # Register blueprints
    from app.routes import upload, halls, seating, auth, admin, csrf as csrf_bp
    app.register_blueprint(upload.bp)
    app.register_blueprint(halls.bp)
    app.register_blueprint(seating.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(csrf_bp.bp)
    
    # Error Handlers
    from flask_wtf.csrf import CSRFError
    from flask import jsonify
    
    @app.errorhandler(CSRFError)
    def handle_csrf_error(e):
        return jsonify({'success': False, 'message': e.description}), 400
    
    # Swagger API Documentation (disabled only on Render production)
    if not os.environ.get('RENDER'):
        from flasgger import Swagger
        swagger_config = {
            "headers": [],
            "specs": [
                {
                    "endpoint": 'apispec',
                    "route": '/apispec.json',
                    "rule_filter": lambda rule: True,
                    "model_filter": lambda tag: True,
                }
            ],
            "static_url_path": "/flasgger_static",
            "swagger_ui": True,
            "specs_route": "/api/docs"
        }
        swagger_template = {
            "swagger": "2.0",
            "info": {
                "title": "GCEE Exam Hall Allocation API",
                "description": "API for managing exam hall seat allocation",
                "version": "1.0.0",
                "contact": {
                    "name": "GCE Erode",
                    "url": "https://gcee-hall-allocation.vercel.app"
                }
            },
            "basePath": "/api",
            "schemes": ["http", "https"],
            "securityDefinitions": {
                "SessionAuth": {
                    "type": "apiKey",
                    "in": "cookie",
                    "name": "session"
                }
            },
            "tags": [
                {"name": "Auth", "description": "Authentication endpoints"},
                {"name": "Halls", "description": "Hall management"},
                {"name": "Seating", "description": "Seat allocation"},
                {"name": "Upload", "description": "File uploads"},
                {"name": "Admin", "description": "Admin management"}
            ]
        }
        Swagger(app, config=swagger_config, template=swagger_template)
    
    return app

