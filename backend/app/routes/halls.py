"""
Halls Route - CRUD operations for exam halls
"""
from flask import Blueprint, request, jsonify
import uuid
from app.models import Hall
from app.extensions import db

bp = Blueprint('halls', __name__, url_prefix='/api')

# Default halls configuration
DEFAULT_HALLS = [
    # Maths / 1st Year Block
    {'name': 'I1', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
    {'name': 'I2', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
    {'name': 'I5', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
    {'name': 'I6', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
    {'name': 'I7', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
    {'name': 'I8', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
    # Civil Block
    {'name': 'T1', 'block': 'Civil Block', 'rows': 5, 'columns': 5},
    {'name': 'T2', 'block': 'Civil Block', 'rows': 5, 'columns': 5},
    {'name': 'T3', 'block': 'Civil Block', 'rows': 5, 'columns': 5},
    {'name': 'T6A', 'block': 'Civil Block', 'rows': 5, 'columns': 5},
    {'name': 'T6B', 'block': 'Civil Block', 'rows': 5, 'columns': 5},
    # EEE Block
    {'name': 'EEE1', 'block': 'EEE Block', 'rows': 5, 'columns': 5},
    {'name': 'EEE2', 'block': 'EEE Block', 'rows': 5, 'columns': 5},
    {'name': 'EEE3', 'block': 'EEE Block', 'rows': 5, 'columns': 5},
    # ECE Block
    {'name': 'CT10', 'block': 'ECE Block', 'rows': 5, 'columns': 5},
    {'name': 'CT11', 'block': 'ECE Block', 'rows': 5, 'columns': 5},
    {'name': 'CT12', 'block': 'ECE Block', 'rows': 5, 'columns': 5},
    # Mech Block
    {'name': 'M2', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
    {'name': 'M3', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
    {'name': 'M6', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
    {'name': 'AH1', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
    {'name': 'AH2', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
    {'name': 'AH3', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
    # Auto Block
    {'name': 'A4', 'block': 'Auto Block', 'rows': 5, 'columns': 5},
    # Auditorium
    {'name': 'AUD1', 'block': 'Auditorium', 'rows': 9, 'columns': 3, 'capacity': 25},
    {'name': 'AUD2', 'block': 'Auditorium', 'rows': 9, 'columns': 3, 'capacity': 25},
    {'name': 'AUD3', 'block': 'Auditorium', 'rows': 9, 'columns': 3, 'capacity': 25},
    {'name': 'AUD4', 'block': 'Auditorium', 'rows': 9, 'columns': 3, 'capacity': 25},
]

@bp.route('/halls', methods=['GET'])
def get_halls():
    """Get all halls"""
    halls = Hall.query.all()
    return jsonify([h.to_dict() for h in halls]), 200

@bp.route('/halls', methods=['POST'])
def create_hall():
    """Create a new hall"""
    data = request.json
    
    if not data or not all(k in data for k in ['name', 'block', 'rows', 'columns']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    hall = Hall(
        id=str(uuid.uuid4()),
        name=data['name'],
        block=data['block'],
        rows=data['rows'],
        columns=data['columns'],
        capacity=data['rows'] * data['columns']
    )
    
    db.session.add(hall)
    db.session.commit()
    
    return jsonify(hall.to_dict()), 201

@bp.route('/halls/<hall_id>', methods=['PUT'])
def update_hall(hall_id):
    """Update an existing hall"""
    data = request.json
    
    hall = Hall.query.get(hall_id)
    if not hall:
        return jsonify({'error': 'Hall not found'}), 404
    
    if 'name' in data:
        hall.name = data['name']
    if 'block' in data:
        hall.block = data['block']
    if 'rows' in data:
        hall.rows = data['rows']
    if 'columns' in data:
        hall.columns = data['columns']
    
    hall.capacity = hall.rows * hall.columns
    db.session.commit()
    
    return jsonify(hall.to_dict()), 200

@bp.route('/halls/<hall_id>', methods=['DELETE'])
def delete_hall(hall_id):
    """Delete a hall"""
    hall = Hall.query.get(hall_id)
    if not hall:
        return jsonify({'error': 'Hall not found'}), 404
    
    db.session.delete(hall)
    db.session.commit()
    return jsonify({'message': 'Hall deleted successfully'}), 200

@bp.route('/halls/bulk_update', methods=['POST'])
def bulk_update_halls():
    """Bulk update multiple halls"""
    data = request.json
    
    if not data or 'ids' not in data or 'updates' not in data:
        return jsonify({'error': 'Missing required fields (ids, updates)'}), 400
    
    hall_ids = data['ids']
    updates = data['updates']
    
    if not isinstance(hall_ids, list):
        return jsonify({'error': 'ids must be a list'}), 400
        
    updated_count = 0
    halls_to_update = Hall.query.filter(Hall.id.in_(hall_ids)).all()
    
    for hall in halls_to_update:
        if 'rows' in updates:
            hall.rows = updates['rows']
        if 'columns' in updates:
            hall.columns = updates['columns']
        
        # Update capacity
        hall.capacity = hall.rows * hall.columns
        updated_count += 1
    
    db.session.commit()
    
    return jsonify({
        'message': f'Successfully updated {updated_count} halls',
        'updated_count': updated_count
    }), 200

@bp.route('/halls/initialize', methods=['POST'])
def initialize_default_halls():
    """Initialize default hall configuration (Force Reset)"""
    # Clear existing halls
    Hall.query.delete()
    db.session.commit()
    
    # Re-seed
    seeded = bootstrap_halls(force=True)
    
    return jsonify([h.to_dict() for h in seeded]), 200

@bp.route('/halls/reorder_blocks', methods=['POST'])
def reorder_blocks():
    """Reorder halls based on block priority - Not persisted in DB schema currently"""
    return jsonify({'message': 'Reordering not supported in persistent mode yet'}), 200

def bootstrap_halls(force=False):
    """
    Seeds default halls if table is empty or force=True.
    Returns list of seeded halls (or empty list if skipped).
    """
    if not force:
        existing_count = Hall.query.count()
        if existing_count > 0:
            return []

    halls_to_add = []
    for hall_data in DEFAULT_HALLS:
        hall = Hall(
            id=str(uuid.uuid4()),
            name=hall_data['name'],
            block=hall_data['block'],
            rows=hall_data['rows'],
            columns=hall_data['columns'],
            capacity=hall_data['rows'] * hall_data['columns']
        )
        halls_to_add.append(hall)
    
    db.session.add_all(halls_to_add)
    db.session.commit()
    return halls_to_add
