"""
Unit Tests for Hall Management Routes
"""
import pytest


class TestHallRoutes:
    """Tests for /api/halls endpoints."""
    
    def test_get_halls(self, client):
        """Test get halls."""
        response = client.get('/api/halls')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_create_hall(self, authenticated_client):
        """Test creating a new hall."""
        response = authenticated_client.post('/api/halls', json={
            'name': 'Test Hall A',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['name'] == 'Test Hall A'
        assert data['capacity'] == 30  # 5 * 6
    
    def test_create_hall_with_capacity(self, authenticated_client):
        """Test creating hall with explicit capacity."""
        response = authenticated_client.post('/api/halls', json={
            'name': 'Test Hall B',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6,
            'capacity': 25  # Less than rows * columns
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['capacity'] == 25
    
    def test_update_hall(self, authenticated_client):
        """Test updating an existing hall."""
        # Create hall first
        create_response = authenticated_client.post('/api/halls', json={
            'name': 'Original Name',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6
        })
        hall_id = create_response.get_json()['id']
        
        # Update hall
        response = authenticated_client.put(f'/api/halls/{hall_id}', json={
            'name': 'Updated Name',
            'block': 'Block 2',
            'rows': 6,
            'columns': 7
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == 'Updated Name'
        assert data['block'] == 'Block 2'
    
    def test_delete_hall(self, authenticated_client):
        """Test deleting a hall."""
        # Create hall first
        create_response = authenticated_client.post('/api/halls', json={
            'name': 'To Delete',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6
        })
        hall_id = create_response.get_json()['id']
        
        # Delete hall
        response = authenticated_client.delete(f'/api/halls/{hall_id}')
        assert response.status_code == 200
        
        # Verify deleted
        get_response = authenticated_client.get('/api/halls')
        halls = get_response.get_json()
        assert not any(h['id'] == hall_id for h in halls)
    
    def test_initialize_default_halls(self, authenticated_client):
        """Test initializing default halls."""
        response = authenticated_client.post('/api/halls/initialize')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_bulk_update_capacity(self, authenticated_client):
        """Test bulk updating hall capacities."""
        # Create halls
        hall1 = authenticated_client.post('/api/halls', json={
            'name': 'Bulk Test 1',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6
        }).get_json()
        
        hall2 = authenticated_client.post('/api/halls', json={
            'name': 'Bulk Test 2',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6
        }).get_json()
        
        # Bulk update using correct endpoint with POST (as defined in route)
        response = authenticated_client.post('/api/halls/bulk-capacity', json={
            'hallIds': [hall1['id'], hall2['id']],  # Use 'hallIds' not 'hall_ids'
            'capacity': 20
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['updated'] == 2
