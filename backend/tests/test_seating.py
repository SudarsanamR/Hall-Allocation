"""
Unit Tests for Seating Routes (No auth — offline desktop mode)
"""
import pytest


class TestSeatingRoutes:
    """Tests for /api seating endpoints."""
    
    def test_get_sessions(self, client):
        """Test getting sessions — should return 200 with empty list."""
        response = client.get('/api/sessions')
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert isinstance(data['sessions'], list)
    
    def test_search_student_endpoint(self, client):
        """Test student search endpoint exists and validates input."""
        response = client.post('/api/search', json={'registerNumber': '123456789012'})
        # Should return 404 (no data) or 200 (with results)
        assert response.status_code in [200, 404]
    
    def test_clear_allocations(self, client):
        """Test clearing allocations — should succeed without auth."""
        response = client.delete('/api/clear')
        assert response.status_code == 200
    
    def test_generate_no_students(self, client):
        """Test generate with no students — should return 400."""
        response = client.post('/api/generate')
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_export_allocations_empty(self, client):
        """Test export with no allocations — should return 404."""
        response = client.get('/api/export/allocations')
        assert response.status_code == 404
