"""
Students Route - Manage student details (e.g. disability flag)
"""
from flask import Blueprint, request, jsonify
from app.models import Student
from app.extensions import db

bp = Blueprint('students', __name__, url_prefix='/api')

@bp.route('/students/search', methods=['POST'])
def search_student_details():
    """
    Search for a student by register number.
    Returns basic details + metadata (like disability status).
    """
    data = request.json
    reg_no = data.get('registerNumber')
    
    if not reg_no:
        return jsonify({'error': 'Register number is required'}), 400
        
    student = Student.query.filter_by(register_number=reg_no).first()
    
    if not student:
        return jsonify({'error': 'Student not found'}), 404
        
    return jsonify({
        'registerNumber': student.register_number,
        'subjectCode': student.subject_code,
        'department': student.department,
        'examDate': student.exam_date,
        'session': student.session,
        'isPhysicallyChallenged': student.is_physically_challenged
    }), 200

@bp.route('/students/<register_number>/toggle-disability', methods=['PUT'])
def toggle_disability(register_number):
    """
    Toggle the physically challenged status for a student.
    Note: Since reg no is not unique globally (can appear for multiple exams?), we should update ALL instances of this student?
    Actually, usually register number + subject code defines the exam instance.
    But 'Physically Challenged' is a property of the Student (Human), so it should apply to ALL entries for that Register Number.
    """
    data = request.json
    status = data.get('isPhysicallyChallenged')
    
    if status is None:
        return jsonify({'error': 'Status is required'}), 400
        
    # Update ALL records for this student (across different dates/subjects)
    students = Student.query.filter_by(register_number=register_number).all()
    
    if not students:
        return jsonify({'error': 'Student not found'}), 404
        
    count = 0
    for s in students:
        s.is_physically_challenged = status
        count += 1
        
    db.session.commit()
    
    return jsonify({
        'message': f'Updated status for {count} exam entries',
        'isPhysicallyChallenged': status
    }), 200
