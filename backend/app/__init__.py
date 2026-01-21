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
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    from app.routes import upload, halls, seating
    app.register_blueprint(upload.bp)
    app.register_blueprint(halls.bp)
    app.register_blueprint(seating.bp)
    
    return app
