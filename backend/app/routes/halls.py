"""
Halls Route - CRUD operations for exam halls
"""
from flask import Blueprint, request, jsonify
import uuid
from app.models import Hall
from app.extensions import db
from app.decorators import login_required, role_required

bp = Blueprint('halls', __name__, url_prefix='/api')

BLOCK_PRIORITIES = {
    'Maths / 1st Year Block': 1000,
    'Civil Block': 2000,
    'EEE Block': 3000,
    'ECE Block': 4000,
    'Mech Block': 5000,
    'Auto Block': 6000,
    'Auditorium': 7000
}

# Default halls configuration
DEFAULT_HALLS = [
    # Maths / 1st Year Block (Priority 1000)
    {'name': 'I1', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5, 'priority': 1000},
    {'name': 'I2', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5, 'priority': 1000},
    {'name': 'I5', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5, 'priority': 1000},
    {'name': 'I6', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5, 'priority': 1000},
    {'name': 'I7', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5, 'priority': 1000},
    {'name': 'I8', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5, 'priority': 1000},
    # Civil Block (Priority 2000)
    {'name': 'T1', 'block': 'Civil Block', 'rows': 5, 'columns': 5, 'priority': 2000},
    {'name': 'T2', 'block': 'Civil Block', 'rows': 5, 'columns': 5, 'priority': 2000},
    {'name': 'T3', 'block': 'Civil Block', 'rows': 5, 'columns': 5, 'priority': 2000},
    {'name': 'T6A', 'block': 'Civil Block', 'rows': 5, 'columns': 5, 'priority': 2000},
    {'name': 'T6B', 'block': 'Civil Block', 'rows': 5, 'columns': 5, 'priority': 2000},
    # EEE Block (Priority 3000)
    {'name': 'EEE1', 'block': 'EEE Block', 'rows': 5, 'columns': 5, 'priority': 3000},
    {'name': 'EEE2', 'block': 'EEE Block', 'rows': 5, 'columns': 5, 'priority': 3000},
    {'name': 'EEE3', 'block': 'EEE Block', 'rows': 5, 'columns': 5, 'priority': 3000},
    # ECE Block (Priority 4000)
    {'name': 'CT10', 'block': 'ECE Block', 'rows': 5, 'columns': 5, 'priority': 4000},
    {'name': 'CT11', 'block': 'ECE Block', 'rows': 5, 'columns': 5, 'priority': 4000},
    {'name': 'CT12', 'block': 'ECE Block', 'rows': 5, 'columns': 5, 'priority': 4000},
    # Mech Block (Priority 5000)
    {'name': 'M2', 'block': 'Mech Block', 'rows': 5, 'columns': 5, 'priority': 5000},
    {'name': 'M3', 'block': 'Mech Block', 'rows': 5, 'columns': 5, 'priority': 5000},
    {'name': 'M6', 'block': 'Mech Block', 'rows': 5, 'columns': 5, 'priority': 5000},
    {'name': 'AH1', 'block': 'Mech Block', 'rows': 5, 'columns': 5, 'priority': 5000},
    {'name': 'AH2', 'block': 'Mech Block', 'rows': 5, 'columns': 5, 'priority': 5000},
    {'name': 'AH3', 'block': 'Mech Block', 'rows': 5, 'columns': 5, 'priority': 5000},
    # Auto Block (Priority 6000)
    {'name': 'A4', 'block': 'Auto Block', 'rows': 5, 'columns': 5, 'priority': 6000},
    # Auditorium (Priority 7000)
    {'name': 'AUD1', 'block': 'Auditorium', 'rows': 9, 'columns': 3, 'capacity': 25, 'priority': 7000},
    {'name': 'AUD2', 'block': 'Auditorium', 'rows': 9, 'columns': 3, 'capacity': 25, 'priority': 7000},
    {'name': 'AUD3', 'block': 'Auditorium', 'rows': 9, 'columns': 3, 'capacity': 25, 'priority': 7000},
    {'name': 'AUD4', 'block': 'Auditorium', 'rows': 9, 'columns': 3, 'capacity': 25, 'priority': 7000},
]

@bp.route('/halls', methods=['GET'])
@login_required
def get_halls():
    """Get all halls sorted by priority then block then name"""
    # Sort by priority (asc) then block (asc) then name (asc)
    halls = Hall.query.order_by(Hall.priority.asc(), Hall.block.asc(), Hall.name.asc()).all()
    return jsonify([h.to_dict() for h in halls]), 200

@bp.route('/halls', methods=['POST'])
@role_required(['admin', 'super_admin'])
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
        capacity=data.get('capacity', data['rows'] * data['columns'])
    )
    
    db.session.add(hall)
    db.session.commit()
    
    return jsonify(hall.to_dict()), 201

@bp.route('/halls/<hall_id>', methods=['PUT'])
@role_required(['admin', 'super_admin'])
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
    
    # Capacity logic: Prefer explicit capacity, otherwise fallback to recalc if dims changed
    if 'capacity' in data:
        hall.capacity = data['capacity']
    elif 'rows' in data or 'columns' in data:
         hall.capacity = hall.rows * hall.columns
    
    db.session.commit()
    return jsonify(hall.to_dict()), 200

@bp.route('/halls/bulk-capacity', methods=['POST'])
@role_required(['admin', 'super_admin'])
def update_capacity_bulk():
    """Bulk update hall capacities"""
    data = request.json
    if not data or 'hallIds' not in data or 'capacity' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
        
    hall_ids = data['hallIds']
    capacity = data['capacity']
    
    try:
        with open("backend_log.txt", "a") as f:
            f.write(f"DEBUG: Bulk update for IDs: {hall_ids} with capacity: {capacity}\n")
            
        updated_count = Hall.query.filter(Hall.id.in_(hall_ids)).update({'capacity': capacity}, synchronize_session=False)
        db.session.commit()
        
        with open("backend_log.txt", "a") as f:
            f.write(f"DEBUG: Updated {updated_count} halls\n")
            
        return jsonify({'success': True, 'updated': updated_count}), 200
    except Exception as e:
        with open("backend_log.txt", "a") as f:
            f.write(f"DEBUG: Bulk update error: {e}\n")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/halls/bulk-dimensions', methods=['POST'])
@role_required(['admin', 'super_admin'])
def update_dimensions_bulk():
    """Bulk update hall rows, columns, and recalculate capacity"""
    data = request.json
    if not data or 'hallIds' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
        
    hall_ids = data['hallIds']
    rows = data.get('rows')
    columns = data.get('columns')
    
    if rows is None and columns is None:
        return jsonify({'error': 'At least one of rows or columns is required'}), 400
    
    try:
        # Update each hall individually to recalculate capacity
        halls = Hall.query.filter(Hall.id.in_(hall_ids)).all()
        for hall in halls:
            if rows is not None:
                hall.rows = rows
            if columns is not None:
                hall.columns = columns
            hall.capacity = hall.rows * hall.columns
        
        db.session.commit()
        return jsonify({'success': True, 'updated': len(halls)}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/halls/<hall_id>', methods=['DELETE'])
@role_required(['admin', 'super_admin'])
def delete_hall(hall_id):
    """Delete a hall"""
    hall = Hall.query.get(hall_id)
    if not hall:
        return jsonify({'error': 'Hall not found'}), 404
    
    db.session.delete(hall)
    db.session.commit()
    return jsonify({'message': 'Hall deleted successfully'}), 200

@bp.route('/halls/initialize', methods=['POST'])
@role_required(['admin', 'super_admin'])
def initialize_default_halls():
    """Initialize default hall configuration (Force Reset)"""
    # Clear existing halls
    Hall.query.delete()
    db.session.commit()
    
    # Re-seed
    seeded = bootstrap_halls(force=True)
    
    return jsonify([h.to_dict() for h in seeded]), 200

@bp.route('/halls/reorder_blocks', methods=['POST'])
@role_required(['admin', 'super_admin'])
def reorder_blocks():
    """Reorder halls based on block priority - Not persisted in DB schema currently"""
    return jsonify({'message': 'Reordering not supported in persistent mode yet'}), 200

@bp.route('/halls/reorder', methods=['POST'])
@role_required(['admin', 'super_admin'])
def reorder_halls():
    """
    Reorder halls within a block.
    Expects { "hallIds": ["id1", "id2", ...] }
    """
    data = request.json
    if not data or 'hallIds' not in data:
        return jsonify({'error': 'Missing hallIds list'}), 400
        
    hall_ids = data['hallIds']
    
    # We assume all reordered halls belong to the same block (frontend constraint)
    # But to be safe, we check for each or grab the block from the first one.
    
    if not hall_ids:
        return jsonify({'success': True}), 200

    # Get the block from the first hall to determine base priority
    first_hall = Hall.query.get(hall_ids[0])
    if not first_hall:
        return jsonify({'error': 'Hall not found'}), 404
        
    base_priority = BLOCK_PRIORITIES.get(first_hall.block, 9000) # Default to high if unknown

    for index, hall_id in enumerate(hall_ids):
        hall = Hall.query.get(hall_id)
        if hall:
            # Check if block matches (optional safety)
            # if hall.block != first_hall.block: ...
            hall.priority = base_priority + index
            
    db.session.commit()
    return jsonify({'success': True}), 200

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
            capacity=hall_data['rows'] * hall_data['columns'],
            priority=hall_data.get('priority', 0)
        )
        halls_to_add.append(hall)
    
    db.session.add_all(halls_to_add)
    db.session.commit()
    return halls_to_add
