"""
Unit Tests for Hall Management Routes (No auth — offline desktop mode)
"""
import pytest


class TestHallRoutes:
    """Tests for /api/halls endpoints."""
    
    def test_get_halls(self, client):
        """Test get halls — returns list."""
        response = client.get('/api/halls')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_create_hall(self, client):
        """Test creating a new hall."""
        response = client.post('/api/halls', json={
            'name': 'Test Hall A',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['name'] == 'Test Hall A'
        assert data['capacity'] == 30  # 5 * 6
    
    def test_create_hall_with_capacity(self, client):
        """Test creating hall with explicit capacity."""
        response = client.post('/api/halls', json={
            'name': 'Test Hall B',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6,
            'capacity': 25
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['capacity'] == 25
    
    def test_update_hall(self, client):
        """Test updating an existing hall."""
        create_response = client.post('/api/halls', json={
            'name': 'Original Name',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6
        })
        hall_id = create_response.get_json()['id']
        
        response = client.put(f'/api/halls/{hall_id}', json={
            'name': 'Updated Name',
            'block': 'Block 2',
            'rows': 6,
            'columns': 7
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == 'Updated Name'
        assert data['block'] == 'Block 2'
    
    def test_delete_hall(self, client):
        """Test deleting a hall."""
        create_response = client.post('/api/halls', json={
            'name': 'To Delete',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6
        })
        hall_id = create_response.get_json()['id']
        
        response = client.delete(f'/api/halls/{hall_id}')
        assert response.status_code == 200
        
        get_response = client.get('/api/halls')
        halls = get_response.get_json()
        assert not any(h['id'] == hall_id for h in halls)
    
    def test_initialize_default_halls(self, client):
        """Test initializing default halls."""
        response = client.post('/api/halls/initialize')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_bulk_update_capacity(self, client):
        """Test bulk updating hall capacities."""
        hall1 = client.post('/api/halls', json={
            'name': 'Bulk Test 1',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6
        }).get_json()
        
        hall2 = client.post('/api/halls', json={
            'name': 'Bulk Test 2',
            'block': 'Block 1',
            'rows': 5,
            'columns': 6
        }).get_json()
        
        response = client.post('/api/halls/bulk-capacity', json={
            'hallIds': [hall1['id'], hall2['id']],
            'capacity': 20
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['updated'] == 2
    
    def test_create_hall_missing_fields(self, client):
        """Test creating hall with missing required fields."""
        response = client.post('/api/halls', json={
            'name': 'Incomplete Hall'
        })
        assert response.status_code == 400
