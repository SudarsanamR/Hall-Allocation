"""
Flask Application Initialization
"""
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import secrets

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
    app.config['SECRET_KEY'] = secret_key or 'dev-secret-key-local-only'
    
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
        "allow_headers": ["Content-Type", "Authorization"],
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
    from app.extensions import db
    db.init_app(app)
    
    # Create Tables
    with app.app_context():
        from app import models  # Import models so they are registered with SQLAlchemy
        db.create_all()
        
        # Auto-seed default halls if empty
        from app.routes.halls import bootstrap_halls
        bootstrap_halls()

        # Auto-seed Super Admin with secure password
        from app.models.sql import Admin
        from werkzeug.security import generate_password_hash
        
        super_admin = Admin.query.filter_by(role='super_admin').first()
        if not super_admin:
            print("Creating default Super Admin...")
            # Generate a secure random password or use env variable
            default_password = os.environ.get('SUPER_ADMIN_PASSWORD') or secrets.token_urlsafe(16)
            
            if not os.environ.get('SUPER_ADMIN_PASSWORD'):
                print(f"⚠️  SUPER ADMIN DEFAULT PASSWORD: {default_password}")
                print("⚠️  Please change this immediately or set SUPER_ADMIN_PASSWORD env variable!")
            
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
            print("Super Admin created.")

    # Register blueprints
    from app.routes import upload, halls, seating, auth, admin
    app.register_blueprint(upload.bp)
    app.register_blueprint(halls.bp)
    app.register_blueprint(seating.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(admin.bp)
    
    return app

