"""
Unit Tests for Authentication Routes
"""
import pytest
from werkzeug.security import generate_password_hash


class TestAuthRoutes:
    """Tests for /api/auth endpoints."""
    
    def test_login_success(self, client, app):
        """Test successful login."""
        with app.app_context():
            from app.models.sql import Admin
            from app.extensions import db
            
            # Create test user
            admin = Admin(
                username='testuser',
                password_hash=generate_password_hash('testpass123'),
                role='admin',
                is_verified=True,
                security_question='Test?',
                security_answer_hash=generate_password_hash('answer')
            )
            db.session.add(admin)
            db.session.commit()
        
        response = client.post('/api/auth/login', json={
            'username': 'testuser',
            'password': 'testpass123'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['user']['username'] == 'testuser'
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        response = client.post('/api/auth/login', json={
            'username': 'nonexistent',
            'password': 'wrongpass'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
    
    def test_login_missing_fields(self, client):
        """Test login with missing fields."""
        response = client.post('/api/auth/login', json={
            'username': 'test'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
    
    def test_login_unverified_user(self, client, app):
        """Test login with unverified user."""
        with app.app_context():
            from app.models.sql import Admin
            from app.extensions import db
            
            admin = Admin(
                username='unverified',
                password_hash=generate_password_hash('testpass'),
                role='admin',
                is_verified=False,
                security_question='Test?',
                security_answer_hash=generate_password_hash('answer')
            )
            db.session.add(admin)
            db.session.commit()
        
        response = client.post('/api/auth/login', json={
            'username': 'unverified',
            'password': 'testpass'
        })
        
        assert response.status_code == 403
        data = response.get_json()
        assert 'pending' in data['message'].lower() or data['success'] is False
    
    def test_register_success(self, client):
        """Test successful registration."""
        response = client.post('/api/auth/register', json={
            'username': 'newadmin',
            'password': 'securepass123',
            'security_question': 'What is your pet name?',
            'security_answer': 'fluffy'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
    
    def test_register_short_username(self, client):
        """Test registration with short username."""
        response = client.post('/api/auth/register', json={
            'username': 'ab',
            'password': 'securepass123',
            'security_question': 'Test?',
            'security_answer': 'answer'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'username' in data['message'].lower()
    
    def test_register_short_password(self, client):
        """Test registration with short password."""
        response = client.post('/api/auth/register', json={
            'username': 'newuser',
            'password': '12345',
            'security_question': 'Test?',
            'security_answer': 'answer'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'password' in data['message'].lower()
    
    def test_register_duplicate_username(self, client, app):
        """Test registration with existing username."""
        with app.app_context():
            from app.models.sql import Admin
            from app.extensions import db
            
            admin = Admin(
                username='existing',
                password_hash=generate_password_hash('testpass'),
                role='admin',
                is_verified=True,
                security_question='Test?',
                security_answer_hash=generate_password_hash('answer')
            )
            db.session.add(admin)
            db.session.commit()
        
        response = client.post('/api/auth/register', json={
            'username': 'existing',
            'password': 'newpassword123',
            'security_question': 'Test?',
            'security_answer': 'answer'
        })
        
        assert response.status_code == 409
    
    def test_logout(self, authenticated_client):
        """Test logout clears session."""
        response = authenticated_client.post('/api/auth/logout')
        assert response.status_code == 200
        data = response.get_json()
        assert data.get('success') is True
    
    def test_me_authenticated(self, authenticated_client):
        """Test /me endpoint when authenticated."""
        response = authenticated_client.get('/api/auth/me')
        assert response.status_code == 200
        data = response.get_json()
        assert data.get('authenticated') is True
    
    def test_me_unauthenticated(self, client):
        """Test /me endpoint when not authenticated."""
        response = client.get('/api/auth/me')
        assert response.status_code == 401
