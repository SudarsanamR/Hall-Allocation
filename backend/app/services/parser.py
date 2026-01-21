"""
Excel and CSV Parser for Student Data
"""
import pandas as pd
from typing import List
from app.models import Student

def parse_file(file_path: str) -> List[Student]:
    """
    Parse Excel or CSV file containing student data
    
    Expected columns:
    - Register Number / Registration Number
    - Subject Code / Subject
    - Department / Dept
    - Exam Date / Date
    - Session
    
    Args:
        file_path: Path to the Excel/CSV file
        
    Returns:
        List of Student objects
    """
    # Read file based on extension
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)
    
    # Normalize column names (case-insensitive, strip whitespace)
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
    
    # Map possible column name variations
    column_mapping = {
        'register_number': ['register_number', 'registration_number', 'reg_no', 'regno', 'reg_number'],
        'subject_code': ['subject_code', 'subject', 'sub_code', 'subcode'],
        'department': ['department', 'dept', 'branch'],
        'exam_date': ['exam_date', 'date', 'exam_day'],
        'session': ['session', 'time', 'shift']
    }
    
    # Find actual column names
    actual_columns = {}
    for key, variations in column_mapping.items():
        for col in df.columns:
            if col in variations:
                actual_columns[key] = col
                break
    
    # Validate required columns
    required = ['register_number', 'subject_code', 'department', 'exam_date', 'session']
    missing = [k for k in required if k not in actual_columns]
    
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")
    
    # Parse students
    students = []
    for _, row in df.iterrows():
        try:
            student = Student(
                registerNumber=str(row[actual_columns['register_number']]).strip().upper(),
                subjectCode=str(row[actual_columns['subject_code']]).strip().upper(),
                department=str(row[actual_columns['department']]).strip().upper(),
                examDate=str(row[actual_columns['exam_date']]).strip(),
                session=str(row[actual_columns['session']]).strip().upper()
            )
            students.append(student)
        except Exception as e:
            # Skip invalid rows
            print(f"Skipping invalid row: {e}")
            continue
    
    if not students:
        raise ValueError("No valid student records found in file")
    
    return students

def validate_student_data(students: List[Student]) -> List[str]:
    """
    Validate student data and return list of warnings/errors
    
    Returns:
        List of warning messages (empty if all valid)
    """
    warnings = []
    
    # Check for duplicate registration numbers
    reg_numbers = [s.registerNumber for s in students]
    duplicates = set([x for x in reg_numbers if reg_numbers.count(x) > 1])
    if duplicates:
        warnings.append(f"Duplicate registration numbers found: {', '.join(duplicates)}")
    
    # Check session values
    valid_sessions = ['FN', 'AN']
    invalid_sessions = set([s.session for s in students if s.session not in valid_sessions])
    if invalid_sessions:
        warnings.append(f"Invalid session values found: {', '.join(invalid_sessions)}. Expected FN or AN")
    
    return warnings
