"""
Seating Route - Generate seating arrangements and download results
"""
from flask import Blueprint, request, jsonify, send_file
from app.models import db, Student, Hall, Allocation, SeatingResult, HallSeating, Seat
from app.services import allocate_seats, generate_hall_wise_excel, generate_student_wise_excel
from collections import defaultdict
import uuid

bp = Blueprint('seating', __name__, url_prefix='/api')

@bp.route('/generate', methods=['POST'])
def generate_seating():
    """
    Generate seating arrangements for all sessions found in student data.
    Groups students by (ExamDate, Session) and runs allocation for each group.
    """
    students = Student.query.all()
    if not students:
        return jsonify({'error': 'No student data available. Please upload student data first.'}), 400
    
    halls = Hall.query.all()
    if not halls:
        return jsonify({'error': 'No halls configured. Please add halls first.'}), 400
    
    try:
        # 1. Group students by Session (Date + Session)
        session_groups = defaultdict(list)
        for student in students:
            key = f"{student.examDate}_{student.session}"
            session_groups[key].append(student)
            
        # 2. Iterate and Allocate
        results = {}
        
        # Clear existing allocations?
        # Requirement: "Show only till next exam hall allocation"
        # The upload route already Clears All allocations.
        # But if we call generate multiple times without upload (e.g. changing settings),
        # we should probably wipe allocations for the sessions we are generating.
        # For simplicity and safety, let's wipe ALL allocations when generating new ones.
        Allocation.query.delete()
        db.session.commit()
        
        for session_key, group_students in session_groups.items():
            result = allocate_seats(group_students, halls)
            
            # Save to DB
            allocations_to_add = []
            for sa in result.studentAllocation:
                alloc = Allocation(
                    register_number=sa.registerNumber,
                    department=sa.department,
                    subject_code=sa.subject,
                    hall_name=sa.hallName,
                    row_num=sa.row,
                    col_num=sa.col,
                    seat_number=sa.seatNumber,
                    session_key=session_key
                )
                allocations_to_add.append(alloc)
            
            db.session.add_all(allocations_to_add)
            
            # Format for Response
            # We can use the 'result' object directly as it has the structure we need
            halls_response = []
            for hs in result.halls:
                grid_response = []
                for row in hs.grid:
                    row_response = []
                    for seat in row:
                        seat_data = {
                            'row': seat.row,
                            'col': seat.col,
                            'subject': seat.subject,
                            'department': seat.department,
                            'seatNumber': seat.seatNumber,
                            'student': None
                        }
                        if seat.student:
                            seat_data['student'] = {
                                'registerNumber': seat.student.registerNumber,
                                'subjectCode': seat.student.subjectCode,
                                'department': seat.student.department,
                                'examDate': seat.student.examDate,
                                'session': seat.student.session
                            }
                        row_response.append(seat_data)
                    grid_response.append(row_response)
                
                halls_response.append({
                    'hall': {
                        'id': hs.hall.id, # SQL Model has id
                        'name': hs.hall.name,
                        'block': hs.hall.block,
                        'rows': hs.hall.rows,
                        'columns': hs.hall.columns,
                        'capacity': hs.hall.capacity
                    },
                    'grid': grid_response,
                    'studentsCount': hs.studentsCount
                })

            results[session_key] = {
                'totalStudents': result.totalStudents,
                'hallsUsed': result.hallsUsed,
                'halls': halls_response,
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

        db.session.commit()

        return jsonify({
            'success': True, 
            'sessions': list(results.keys())
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/seating/<session_key>', methods=['GET'])
def get_session_seating(session_key):
    """
    Get detailed seating result for a specific session.
    """
    try:
        # Check if session exists
        exists = db.session.query(Allocation).filter_by(session_key=session_key).first()
        if not exists:
             return jsonify({'error': 'Session not found'}), 404

        result = reconstruct_seating_result(session_key)
        if not result:
             return jsonify({'error': 'Failed to reconstruct results'}), 500
             
        # Convert to JSON response format
        halls_response = []
        for hs in result.halls:
            grid_response = []
            for row in hs.grid:
                row_response = []
                for seat in row:
                    seat_data = {
                        'row': seat.row,
                        'col': seat.col,
                        'subject': seat.subject,
                        'department': seat.department,
                        'seatNumber': seat.seatNumber,
                        'student': None
                    }
                    if seat.student:
                        seat_data['student'] = {
                            'registerNumber': seat.student.registerNumber,
                            'subjectCode': seat.student.subjectCode,
                            'department': seat.student.department,
                            'examDate': seat.student.examDate,
                            'session': seat.student.session
                        }
                    row_response.append(seat_data)
                grid_response.append(row_response)
            
            halls_response.append({
                'hall': {
                    'id': hs.hall.id,
                    'name': hs.hall.name,
                    'block': hs.hall.block,
                    'rows': hs.hall.rows,
                    'columns': hs.hall.columns,
                    'capacity': hs.hall.capacity
                },
                'grid': grid_response,
                'studentsCount': hs.studentsCount
            })

        response_data = {
            'totalStudents': result.totalStudents,
            'hallsUsed': result.hallsUsed,
            'halls': halls_response,
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
        
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def reconstruct_seating_result(session_key):
    """Reconstruct SeatingResult object from Database for a given session"""
    halls = Hall.query.all()
    hall_map = {h.name: h for h in halls}
    
    allocations = Allocation.query.filter_by(session_key=session_key).all()
    if not allocations:
        return None
        
    # Group by Hall
    hall_allocs = defaultdict(list)
    student_allocations = []
    
    for alloc in allocations:
        hall_allocs[alloc.hall_name].append(alloc)
        # Add to flat list
        student_allocations.append(type('StudentAllocation', (), {
            'registerNumber': alloc.register_number,
            'department': alloc.department,
            'subject': alloc.subject_code,
            'hallName': alloc.hall_name,
            'row': alloc.row_num,
            'col': alloc.col_num,
            'seatNumber': alloc.seat_number
        }))

    hall_seating_list = []
    
    # Process each hall
    for hall_name, allocs in hall_allocs.items():
        hall = hall_map.get(hall_name)
        if not hall:
            continue # specific hall configs might have changed, skip safety
            
        # Create empty grid
        grid = []
        # Reconstruct standard seats (simplified snake logic or just coordinates)
        # Note: We rely on row/col stored in Allocation
        from app.services.seating_algorithm import get_snake_seat_number
        
        for r in range(hall.rows):
            row_seats = []
            for c in range(hall.columns):
                seat_num = get_snake_seat_number(r, c, hall.rows)
                seat = Seat(row=r, col=c, seatNumber=str(seat_num))
                row_seats.append(seat)
            grid.append(row_seats)
            
        # Fill grid
        students_count = 0
        for alloc in allocs:
            if 0 <= alloc.row_num < hall.rows and 0 <= alloc.col_num < hall.columns:
                seat = grid[alloc.row_num][alloc.col_num]
                seat.department = alloc.department
                seat.subject = alloc.subject_code
                # Reconstruct partial Student object for Excel generator
                # Excel gen checks: seat.student.registerNumber, subjectCode, department, examDate, session
                # We need examDate/session. We can parse it from session_key "25-Nov-2025_FN"
                parts = session_key.rsplit('_', 1)
                e_date = parts[0]
                sess = parts[1] if len(parts) > 1 else ""
                
                seat.student = type('Student', (), {
                    'registerNumber': alloc.register_number,
                    'subjectCode': alloc.subject_code,
                    'department': alloc.department,
                    'examDate': e_date,
                    'session': sess
                })
                students_count += 1
                
        hall_seating_list.append(HallSeating(hall=hall, grid=grid, studentsCount=students_count))
        
    return SeatingResult(
        totalStudents=len(allocations),
        hallsUsed=len(hall_seating_list),
        halls=hall_seating_list,
        studentAllocation=student_allocations
    )

@bp.route('/download/hall-wise', methods=['GET'])
def download_hall_wise():
    """Download hall-wise seating Excel file for a specific session"""
    session_key = request.args.get('session')
    
    # Get available sessions from DB
    distinct_sessions = db.session.query(Allocation.session_key).distinct().all()
    available_sessions = [s[0] for s in distinct_sessions]
    
    if not session_key or session_key not in available_sessions:
        if len(available_sessions) == 1:
             session_key = available_sessions[0]
        elif len(available_sessions) > 0:
             # Default to first if not specified and multiple exist? Or error?
             # Let's take first
             session_key = available_sessions[0]
        else:
            return jsonify({'error': 'No allocations found'}), 404
            
    result = reconstruct_seating_result(session_key)
    if not result:
        return jsonify({'error': 'Failed to reconstruct results'}), 500
    
    try:
        excel_file = generate_hall_wise_excel(result)
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
    
    distinct_sessions = db.session.query(Allocation.session_key).distinct().all()
    available_sessions = [s[0] for s in distinct_sessions]
    
    if not session_key or session_key not in available_sessions:
        if len(available_sessions) == 1:
             session_key = available_sessions[0]
        elif len(available_sessions) > 0:
             session_key = available_sessions[0]
        else:
             return jsonify({'error': 'No allocations found'}), 404
            
    result = reconstruct_seating_result(session_key)
    
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

@bp.route('/search', methods=['POST'])
def search_student():
    """
    Search for a student's allocation details by register number.
    Returns a list of allocations across all sessions.
    """
    data = request.get_json()
    reg_no = data.get('registerNumber')

    if not reg_no:
        return jsonify({'error': 'Register number is required'}), 400

    # Query Allocation table
    allocations = Allocation.query.filter_by(register_number=reg_no).all()
    
    matches = []
    
    for alloc in allocations:
        # We need to construct the 'hallSeating' grid view for the frontend
        # This is expensive if we do it for every search, but necessary for the UI "Sketch" view.
        # Ideally, we reconstruct ONLY the hall this student is in.
        
        hall = Hall.query.filter_by(name=alloc.hall_name).first()
        if not hall:
            continue
            
        # Get all allocations for THIS hall and THIS session to build grid
        hall_allocs = Allocation.query.filter_by(
            session_key=alloc.session_key, 
            hall_name=alloc.hall_name
        ).all()
        
        # Build Grid
        from app.services.seating_algorithm import get_snake_seat_number
        grid_data = []
        students_count = len(hall_allocs)
        
        # Fill map: (row, col) -> alloc
        seat_map = {(a.row_num, a.col_num): a for a in hall_allocs}
        
        for r in range(hall.rows):
            row_data = []
            for c in range(hall.columns):
                seat_num = get_snake_seat_number(r, c, hall.rows)
                cell_alloc = seat_map.get((r, c))
                
                seat_obj = {
                    'row': r,
                    'col': c,
                    'seatNumber': str(seat_num),
                    'student': None,
                    'subject': None,
                    'department': None
                }
                
                if cell_alloc:
                    parts = cell_alloc.session_key.rsplit('_', 1)
                    e_date = parts[0]
                    sess = parts[1] if len(parts) > 1 else ""
                    seat_obj['student'] = {
                        'registerNumber': cell_alloc.register_number,
                        'subjectCode': cell_alloc.subject_code,
                        'department': cell_alloc.department,
                        'examDate': e_date,
                        'session': sess
                    }
                    seat_obj['subject'] = cell_alloc.subject_code
                    seat_obj['department'] = cell_alloc.department
                
                row_data.append(seat_obj)
            grid_data.append(row_data)

        hall_data = {
            'hall': {
                'id': hall.id,
                'name': hall.name,
                'block': hall.block,
                'rows': hall.rows,
                'columns': hall.columns,
                'capacity': hall.capacity
            },
            'grid': grid_data,
            'studentsCount': students_count
        }

        matches.append({
            'session': alloc.session_key,
            'subject': alloc.subject_code,
            'hallName': alloc.hall_name,
            'seatNumber': alloc.seat_number,
            'formattedSession': alloc.session_key.replace('_', ' '),
            'hallSeating': hall_data
        })
    
    if not matches:
        return jsonify({'error': 'No allocation found for this register number'}), 404

    return jsonify({'success': True, 'allocations': matches}), 200
