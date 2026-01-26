"""
Upload Route - Handle file uploads and student data parsing
"""
from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from app.models import db
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
        os.makedirs('uploads', exist_ok=True)
        file_path = os.path.join('uploads', filename)
        file.save(file_path)
        
        # Parse file
        from app.services import parse_pdf
        students = parse_pdf(file_path)
        
        # Validate data
        warnings = validate_student_data(students)
        
        # Store in database
        db.students = students
        db.seating_result = None  # Reset previous results
        
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
        } for s in db.students
    ]
    return jsonify(students), 200

@bp.route('/reset', methods=['DELETE'])
def reset_data():
    """Reset all student data and seating results"""
    db.reset_students()
    return jsonify({'success': True, 'message': 'All data has been reset'}), 200
