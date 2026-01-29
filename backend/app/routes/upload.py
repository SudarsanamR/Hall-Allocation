"""
Upload Route - Handle file uploads and student data parsing
"""
from flask import Blueprint, request, jsonify, current_app
import os
from werkzeug.utils import secure_filename
from app.models import db, Student
from app.services import parse_file, validate_student_data

bp = Blueprint('upload', __name__, url_prefix='/api')

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload', methods=['POST'])
def upload_file():
    """Upload and parse Excel/CSV file with student data"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Please upload a .pdf file'}), 400
    
    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # Parse file - returns list of Student objects (transient)
        from app.services import parse_pdf
        students = parse_pdf(file_path)
        
        # Validate data
        warnings = validate_student_data(students)
        
        # Auto-Wipe: Clear existing data for fresh start
        # This matches the requirement: "Show only till next exam hall allocation"
        try:
            # Delete all allocations first (foreign key conceptual dependency)
            from app.models import Allocation, Student
            Allocation.query.delete()
            Student.query.delete()
            
            # Add new students
            db.session.add_all(students)
            db.session.commit()
            
        except Exception as db_err:
            db.session.rollback()
            raise db_err
        
        # Clean up file
        os.remove(file_path)
        
        response = {
            'success': True,
            'message': f'Successfully uploaded {len(students)} students',
            'studentsCount': len(students),
            'students': [
                {
                    'registerNumber': s.registerNumber,
                    'subjectCode': s.subjectCode,
                    'department': s.department,
                    'examDate': s.examDate,
                    'session': s.session
                } for s in students[:10]  # Return first 10 as preview
            ],
            'warnings': warnings
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/students', methods=['GET'])
def get_students():
    """Get current student data"""
    students = [
        {
            'registerNumber': s.registerNumber,
            'subjectCode': s.subjectCode,
            'department': s.department,
            'examDate': s.examDate,
            'session': s.session
        } for s in Student.query.all()
    ]
    return jsonify(students), 200

@bp.route('/reset', methods=['DELETE'])
def reset_data():
    """Reset all student data and seating results"""
    Student.query.delete()
    from app.models import Allocation
    Allocation.query.delete()
    db.session.commit()
    return jsonify({'success': True, 'message': 'All data has been reset'}), 200
