"""
Halls Route - CRUD operations for exam halls
"""
from flask import Blueprint, request, jsonify
import uuid
from app.models import db, Hall

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
    halls = [
        {
            'id': h.id,
            'name': h.name,
            'block': h.block,
            'rows': h.rows,
            'columns': h.columns,
            'capacity': h.capacity
        } for h in db.halls
    ]
    return jsonify(halls), 200

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
    
    db.halls.append(hall)
    
    return jsonify({
        'id': hall.id,
        'name': hall.name,
        'block': hall.block,
        'rows': hall.rows,
        'columns': hall.columns,
        'capacity': hall.capacity
    }), 201

@bp.route('/halls/<hall_id>', methods=['PUT'])
def update_hall(hall_id):
    """Update an existing hall"""
    data = request.json
    
    hall = next((h for h in db.halls if h.id == hall_id), None)
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
    
    return jsonify({
        'id': hall.id,
        'name': hall.name,
        'block': hall.block,
        'rows': hall.rows,
        'columns': hall.columns,
        'capacity': hall.capacity
    }), 200

@bp.route('/halls/<hall_id>', methods=['DELETE'])
def delete_hall(hall_id):
    """Delete a hall"""
    hall = next((h for h in db.halls if h.id == hall_id), None)
    if not hall:
        return jsonify({'error': 'Hall not found'}), 404
    
    db.halls.remove(hall)
    return jsonify({'message': 'Hall deleted successfully'}), 200

@bp.route('/halls/initialize', methods=['POST'])
def initialize_default_halls():
    """Initialize default hall configuration"""
    db.halls = []
    
    for hall_data in DEFAULT_HALLS:
        hall = Hall(
            id=str(uuid.uuid4()),
            name=hall_data['name'],
            block=hall_data['block'],
            rows=hall_data['rows'],
            columns=hall_data['columns'],
            capacity=hall_data['rows'] * hall_data['columns']
        )
        db.halls.append(hall)
    
    halls = [
        {
            'id': h.id,
            'name': h.name,
            'block': h.block,
            'rows': h.rows,
            'columns': h.columns,
            'capacity': h.capacity
        } for h in db.halls
    ]
    
    
    return jsonify(halls), 200

@bp.route('/halls/reorder_blocks', methods=['POST'])
def reorder_blocks():
    """Reorder halls based on block priority"""
    data = request.json
    if not data or not isinstance(data, list):
         return jsonify({'error': 'Invalid data format, expected list of block names'}), 400
         
    block_order = {block: index for index, block in enumerate(data)}
    
    # Sort the global db.halls list
    # Use a high default index for unknown blocks so they go to the end
    db.halls.sort(key=lambda x: block_order.get(x.block, 9999))
    
    return jsonify({'message': 'Blocks reordered successfully'}), 200
