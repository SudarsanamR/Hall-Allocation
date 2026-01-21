"""
Seating Route - Generate seating arrangements and download results
"""
from flask import Blueprint, request, jsonify, send_file
from app.models import db, SeatingResult
from app.services import allocate_seats, generate_hall_wise_excel, generate_student_wise_excel
from collections import defaultdict

bp = Blueprint('seating', __name__, url_prefix='/api')

@bp.route('/generate', methods=['POST'])
def generate_seating():
    """
    Generate seating arrangements for all sessions found in student data.
    Groups students by (ExamDate, Session) and runs allocation for each group.
    """
    if not db.students:
        return jsonify({'error': 'No student data available. Please upload student data first.'}), 400
    
    if not db.halls:
        return jsonify({'error': 'No halls configured. Please add halls first.'}), 400
    
    try:
        # 1. Group students by Session (Date + Session)
        # Key format: "DD-MMM-YYYY_FN" or similar
        session_groups = defaultdict(list)
        for student in db.students:
            # Create a simplified key for grouping
            key = f"{student.examDate}_{student.session}"
            session_groups[key].append(student)
            
        # 2. Iterate and Allocate
        results = {}
        db.seating_results = {} # Reset
        
        for session_key, group_students in session_groups.items():
            # Run allocation for this specific group
            # Note: We pass all halls available. 
            # In a real scenario, you might want to track hall usage across parallel sessions?
            # But usually Date+Session implies unique time slot, so all halls are fresh.
            result = allocate_seats(group_students, db.halls)
            
            # Store in DB
            db.seating_results[session_key] = result
            
            # Format for Response
            results[session_key] = {
                'totalStudents': result.totalStudents,
                'hallsUsed': result.hallsUsed,
                'halls': [
                    {
                        'hall': {
                            'id': hs.hall.id,
                            'name': hs.hall.name,
                            'block': hs.hall.block,
                            'rows': hs.hall.rows,
                            'columns': hs.hall.columns,
                            'capacity': hs.hall.capacity
                        },
                        'grid': [
                            [
                                {
                                    'row': seat.row,
                                    'col': seat.col,
                                    'student': {
                                        'registerNumber': seat.student.registerNumber,
                                        'subjectCode': seat.student.subjectCode,
                                        'department': seat.student.department,
                                        'examDate': seat.student.examDate,
                                        'session': seat.student.session
                                    } if seat.student else None,
                                    'subject': seat.subject,
                                    'department': seat.department
                                }
                                for seat in row
                            ]
                            for row in hs.grid
                        ],
                        'studentsCount': hs.studentsCount
                    }
                    for hs in result.halls
                ],
                'studentAllocation': [
                    {
                        'registerNumber': sa.registerNumber,
                        'department': sa.department,
                        'subject': sa.subject,
                        'hallName': sa.hallName,
                        'row': sa.row,
                        'col': sa.col,
                        'seatNumber': sa.seatNumber
                    }
                    for sa in result.studentAllocation
                ]
            }

        # Return all results keyed by session
        return jsonify({
            'success': True, 
            'sessions': list(results.keys()), # List of available session keys
            'results': results # Detailed map
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/download/hall-wise', methods=['GET'])
def download_hall_wise():
    """Download hall-wise seating Excel file for a specific session"""
    session_key = request.args.get('session')
    
    if not session_key or session_key not in db.seating_results:
        # Fallback to first available if only one exists? 
        # Or return error asking for session
        if len(db.seating_results) == 1:
             session_key = list(db.seating_results.keys())[0]
        else:
            return jsonify({'error': 'Session parameter required'}), 400
    
    result = db.seating_results[session_key]
    
    try:
        excel_file = generate_hall_wise_excel(result)
        # Create filename based on session
        clean_name = session_key.replace('_', ' ')
        return send_file(
            excel_file,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'Hall Sketch {clean_name}.xlsx'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/download/student-wise', methods=['GET'])
def download_student_wise():
    """Download student-wise allocation Excel file"""
    session_key = request.args.get('session')
    
    if not session_key or session_key not in db.seating_results:
        if len(db.seating_results) == 1:
             session_key = list(db.seating_results.keys())[0]
        else:
             return jsonify({'error': 'Session parameter required'}), 400
            
    result = db.seating_results[session_key]
    
    try:
        excel_file = generate_student_wise_excel(result)
        clean_name = session_key.replace('_', ' ')
        return send_file(
            excel_file,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'Student Allocation {clean_name}.xlsx'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
