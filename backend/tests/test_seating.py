"""
Unit Tests for Seating Routes
"""
import pytest


class TestSeatingRoutes:
    """Tests for /api seating endpoints."""
    
    def test_get_sessions_unauthenticated(self, client):
        """Test getting sessions without authentication - should fail."""
        response = client.get('/api/sessions')
        assert response.status_code == 401
    
    def test_get_sessions_authenticated(self, authenticated_client):
        """Test getting sessions when authenticated."""
        response = authenticated_client.get('/api/sessions')
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert isinstance(data['sessions'], list)
    
    def test_search_student_endpoint(self, client):
        """Test student search endpoint exists."""
        response = client.get('/api/student/search?register_number=123456789012')
        # Endpoint should exist - either 404 for not found or 200 with empty
        assert response.status_code in [200, 404]
    
    def test_clear_allocations_unauthenticated(self, client):
        """Test clearing allocations without auth."""
        response = client.delete('/api/clear')
        assert response.status_code == 401
    
    def test_clear_allocations_authenticated(self, authenticated_client):
        """Test clearing all allocations when authenticated."""
        response = authenticated_client.delete('/api/clear')
        assert response.status_code == 200
