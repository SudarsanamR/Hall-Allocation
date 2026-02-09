"""
Config Routes - Manage configurable subject codes
"""
from flask import Blueprint, request, jsonify
from app.models import db, SubjectConfig
from app.decorators import role_required
from app.services.subject_service import (
    DEFAULT_PRIORITY_SUBJECTS, DEFAULT_DRAWING_SUBJECTS,
    get_all_priority_subjects, get_all_drawing_subjects,
    add_custom_subject_config, delete_custom_subject_config
)

bp = Blueprint('config', __name__, url_prefix='/api/config')


@bp.route('/subjects', methods=['GET'])
@role_required(['admin', 'super_admin'])
def get_subject_configs():
    """Get all configured subject codes (both defaults and custom)."""
    # Get all codes
    all_priority = get_all_priority_subjects()
    all_drawing = get_all_drawing_subjects()
    
    # Build response with is_default flag
    priority_list = [
        {'subject_code': code, 'is_default': code in DEFAULT_PRIORITY_SUBJECTS}
        for code in sorted(all_priority)
    ]
    drawing_list = [
        {'subject_code': code, 'is_default': code in DEFAULT_DRAWING_SUBJECTS}
        for code in sorted(all_drawing)
    ]
    
    return jsonify({
        'success': True,
        'priority_subjects': priority_list,
        'drawing_subjects': drawing_list
    }), 200


@bp.route('/subjects', methods=['POST'])
@role_required(['super_admin'])
def add_subject_config():
    """Add a new subject code configuration."""
    data = request.get_json()
    subject_type = data.get('type')  # 'priority' or 'drawing'
    subject_code = data.get('subject_code', '').strip().upper()
    
    if not subject_type or subject_type not in ['priority', 'drawing']:
        return jsonify({'success': False, 'message': 'Invalid type. Must be "priority" or "drawing"'}), 400
    
    if not subject_code:
        return jsonify({'success': False, 'message': 'Subject code is required'}), 400
    
    # Check if already exists in defaults
    if subject_type == 'priority' and subject_code in DEFAULT_PRIORITY_SUBJECTS:
        return jsonify({'success': False, 'message': 'Subject code already exists in defaults'}), 400
    if subject_type == 'drawing' and subject_code in DEFAULT_DRAWING_SUBJECTS:
        return jsonify({'success': False, 'message': 'Subject code already exists in defaults'}), 400
    
    # Check if already exists in custom configs
    existing = SubjectConfig.query.filter_by(type=subject_type, subject_code=subject_code).first()
    if existing:
        return jsonify({'success': False, 'message': 'Subject code already configured'}), 400
    
    # Add new config using service
    config = add_custom_subject_config(subject_type, subject_code)
    
    return jsonify({
        'success': True,
        'message': f'Added {subject_code} to {subject_type} subjects',
        'config': config.to_dict()
    }), 201


@bp.route('/subjects/<subject_code>', methods=['DELETE'])
@role_required(['super_admin'])
def delete_subject_config(subject_code):
    """Delete a custom subject code configuration."""
    subject_type = request.args.get('type')
    subject_code = subject_code.strip().upper()
    
    if not subject_type:
        return jsonify({'success': False, 'message': 'Type parameter is required'}), 400
    
    # Check if it's a default (cannot delete)
    if subject_type == 'priority' and subject_code in DEFAULT_PRIORITY_SUBJECTS:
        return jsonify({'success': False, 'message': 'Cannot delete default subject codes'}), 400
    if subject_type == 'drawing' and subject_code in DEFAULT_DRAWING_SUBJECTS:
        return jsonify({'success': False, 'message': 'Cannot delete default subject codes'}), 400
    
    # Find and delete using service
    deleted = delete_custom_subject_config(subject_type, subject_code)
    
    if not deleted:
        return jsonify({'success': False, 'message': 'Subject code not found'}), 404
    
    return jsonify({
        'success': True,
        'message': f'Removed {subject_code} from {subject_type} subjects'
    }), 200
