"""
Flask Application Initialization
"""
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['UPLOAD_FOLDER'] = 'uploads'
    
    # Enable CORS for frontend
    # Enable CORS for frontend with Credentials support
    # matches all routes
    CORS(app, resources={r"/*": {
        "origins": [
            "http://localhost:5173", 
            "http://127.0.0.1:5173", 
            "http://localhost:1420", 
            "http://127.0.0.1:1420",
            "tauri://localhost",
            "https://tauri.localhost"
        ],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})
    
    
    # Database Config
    import os
    # Default to sqlite local, but use DATABASE_URL if in env (Cloud)
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
        
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-prod')
    
    # Session Cookie Config for Localhost/Dev
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
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

        # Auto-seed Super Admin
        from app.models.sql import Admin
        from werkzeug.security import generate_password_hash
        
        super_admin = Admin.query.filter_by(role='super_admin').first()
        if not super_admin:
            print("Creating default Super Admin...")
            # Note: Security Question is None initially for Super Admin
            hashed_password = generate_password_hash("SuperAdmin")
            new_super_admin = Admin(
                username="SuperAdmin",
                password_hash=hashed_password,
                role='super_admin',
                is_verified=True,
                security_question="Initial Setup",
                security_answer_hash=generate_password_hash("SuperAdmin") # Default answer same as password initially
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
