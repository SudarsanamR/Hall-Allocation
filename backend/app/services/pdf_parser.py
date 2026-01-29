
import pdfplumber
import re
from app.models import Student, db
from app.services import validate_student_data

def parse_pdf(file_path):
    """
    Parses student data from University Exam PDF format.
    Ref: 19.11.25.pdf
    Expected format:
    - Text blocks containing "Institution:", "Exam Date:", "Subject:", "Question Paper Code :"
    - List of registration numbers below the subject details.
    """
    students = []
    current_exam_date = None
    current_session = None
    current_subject_code = None
    current_subject_name = None
    
    # Regex patterns
    date_session_pattern = r"Exam Date:\s*(\d{2}-[A-Za-z]{3}-\d{4})\s*/\s*(FN|AN)"
    subject_pattern = r"Subject:\s*([A-Z0-9]+):(.+?)(?:\s+Question Paper Code|$)"
    reg_no_pattern = r"\b\d{12}\b" # Matches 12 digit register numbers

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue
            
            lines = text.split('\n')
            
            for line in lines:
                # Extract Exam Date and Session
                date_match = re.search(date_session_pattern, line)
                if date_match:
                    current_exam_date = date_match.group(1)
                    current_session = date_match.group(2)
                    continue

                # Extract Subject Code and Name
                subject_match = re.search(subject_pattern, line)
                if subject_match:
                    current_subject_code = subject_match.group(1).strip()
                    current_subject_name = subject_match.group(2).strip()
                    continue

                # Extract Register Numbers
                # Only proceed if we have active context
                if current_exam_date and current_session and current_subject_code:
                    # Find all 12-digit numbers in the line
                    reg_nos = re.findall(reg_no_pattern, line)
                    for reg_no in reg_nos:
                        # Determine department from reg_no or other logic if needed.
                        # For now, simplistic department extraction (e.g., 5th-8th chars)
                        # Example: 731120104024 -> 104 -> Mapping needed or just use code
                        # Standard Anna Univ: CollegeCode(4) + Year(2) + DegCode(3) + Serial(3)
                        # Degree Codes: 104=CSE, 106=ECE, 105=EEE, 103=Civil, 114=Mech etc.
                        dept_code = reg_no[6:9]
                        department = get_dept_from_code(dept_code)
                        
                        student = Student(
                            register_number=reg_no,
                            subject_code=current_subject_code,
                            department=department,
                            exam_date=current_exam_date,
                            session=current_session
                        )
                        students.append(student)

    return students

def get_dept_from_code(code):
    """Maps Anna University degree codes to Department names"""
    mapping = {
        '102': 'AUTO',
        '103': 'CIVIL',
        '104': 'CSE',
        '105': 'EEE',
        '106': 'ECE',
        '114': 'MECH',
        '159': 'CSE(DS)',
        '205': 'IT',
    }
    return mapping.get(code, str(code))
