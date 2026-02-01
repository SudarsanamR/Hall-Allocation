"""
Pytest Fixtures for Flask Application Testing
"""
import pytest
import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db


@pytest.fixture(scope='session')
def app():
    """Create application for testing."""
    # Set test environment
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['SECRET_KEY'] = 'test-secret-key'
    
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'WTF_CSRF_ENABLED': False,
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create test CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def authenticated_client(client, app):
    """Create authenticated test client with Super Admin session."""
    with app.app_context():
        from app.models.sql import Admin
        from werkzeug.security import generate_password_hash
        
        # Create test super admin
        admin = Admin.query.filter_by(username='TestSuperAdmin').first()
        if not admin:
            admin = Admin(
                username='TestSuperAdmin',
                password_hash=generate_password_hash('TestPassword123'),
                role='super_admin',
                is_verified=True,
                security_question='Test Question',
                security_answer_hash=generate_password_hash('answer')
            )
            db.session.add(admin)
            db.session.commit()
        
        # Login
        response = client.post('/api/auth/login', json={
            'username': 'TestSuperAdmin',
            'password': 'TestPassword123'
        })
        
        return client
