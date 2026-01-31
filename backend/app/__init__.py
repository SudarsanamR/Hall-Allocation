"""
Flask Application Initialization
"""
from flask import Flask, request
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['UPLOAD_FOLDER'] = 'uploads'
    
    # Enable CORS for frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    
    # Database Config
    import os
    # Default to sqlite local, but use DATABASE_URL if in env (Cloud)
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
        
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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

    # Register blueprints
    # Register blueprints
    from app.routes import upload, halls, seating, auth, students
    app.register_blueprint(upload.bp)
    app.register_blueprint(halls.bp)
    app.register_blueprint(seating.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(students.bp)

    @app.after_request
    def add_header(response):
        if request.path.startswith('/api/'):
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
        return response
    
    return app
