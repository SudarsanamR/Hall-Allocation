
import pdfplumber
import re
import logging
from app.models import Student, db

logger = logging.getLogger(__name__)

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
    
    # Primary regex patterns
    date_session_patterns = [
        r"Exam Date\s*:\s*(\d{2}-[A-Za-z]{3}-\d{4})\s*/\s*(FN|AN)",
        r"Exam Date\s*:\s*(\d{2}-\d{2}-\d{4})\s*/\s*(FN|AN)",
        r"Exam Date\s*:\s*(\d{2}/\d{2}/\d{4})\s*/\s*(FN|AN)",
        r"Date\s*:\s*(\d{2}-[A-Za-z]{3}-\d{4})\s*[/\-]\s*(FN|AN)",
        r"(\d{2}-[A-Za-z]{3}-\d{4})\s*/\s*(FN|AN)",
    ]
    
    subject_patterns = [
        r"Subject\s*:\s*([A-Z0-9]+)\s*:\s*(.+?)(?:\s+Question Paper Code|$)",
        r"Subject\s*:\s*([A-Z0-9]+)\s*[-–]\s*(.+?)(?:\s+Question Paper Code|$)",
        r"Subject\s*Code\s*:\s*([A-Z0-9]+)",
        r"Sub\s*Code\s*:\s*([A-Z0-9]+)",
    ]
    
    reg_no_pattern = r"\b\d{12}\b"  # Matches 12 digit register numbers

    pages_processed = 0
    total_text_length = 0
    dates_found = 0
    subjects_found = 0

    try:
        with pdfplumber.open(file_path) as pdf:
            logger.info(f"PDF opened: {file_path}, Pages: {len(pdf.pages)}")
            
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()
                if not text:
                    logger.warning(f"Page {page_num + 1}: No text extracted")
                    continue
                
                pages_processed += 1
                total_text_length += len(text)
                logger.debug(f"Page {page_num + 1}: Extracted {len(text)} chars")
                
                lines = text.split('\n')
                
                for line in lines:
                    line_stripped = line.strip()
                    if not line_stripped:
                        continue
                    
                    # Extract Exam Date and Session (try all patterns)
                    date_match = None
                    for pattern in date_session_patterns:
                        date_match = re.search(pattern, line, re.IGNORECASE)
                        if date_match:
                            break
                    
                    if date_match:
                        current_exam_date = date_match.group(1)
                        current_session = date_match.group(2).upper()
                        dates_found += 1
                        logger.info(f"Found date/session: {current_exam_date} / {current_session}")
                        continue

                    # Extract Subject Code and Name (try all patterns)
                    subject_match = None
                    for pattern in subject_patterns:
                        subject_match = re.search(pattern, line)
                        if subject_match:
                            break
                    
                    if subject_match:
                        current_subject_code = subject_match.group(1).strip()
                        current_subject_name = subject_match.group(2).strip() if subject_match.lastindex >= 2 else ""
                        subjects_found += 1
                        logger.info(f"Found subject: {current_subject_code}: {current_subject_name}")
                        continue

                    # Extract Register Numbers
                    # Only proceed if we have active context
                    if current_exam_date and current_session and current_subject_code:
                        # Find all 12-digit numbers in the line
                        reg_nos = re.findall(reg_no_pattern, line)
                        for reg_no in reg_nos:
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
                    elif re.findall(reg_no_pattern, line):
                        # Found register numbers but no context set yet
                        logger.warning(
                            f"Found register numbers on line but missing context — "
                            f"date={current_exam_date}, session={current_session}, "
                            f"subject={current_subject_code}. Line: {line_stripped[:100]}"
                        )

    except Exception as e:
        logger.exception(f"Error opening/reading PDF: {file_path}")
        raise ValueError(f"Could not read PDF file: {str(e)}")

    logger.info(
        f"PDF parse summary: pages_processed={pages_processed}, "
        f"text_chars={total_text_length}, dates_found={dates_found}, "
        f"subjects_found={subjects_found}, students_found={len(students)}"
    )

    if len(students) == 0:
        # Build a helpful error message
        if pages_processed == 0:
            raise ValueError(
                "Could not extract any text from the PDF. "
                "The file may be scanned/image-based or corrupted. "
                "Please upload a text-based PDF from the university portal."
            )
        elif dates_found == 0:
            raise ValueError(
                f"Could not find exam date/session info in the PDF. "
                f"Expected format like 'Exam Date: DD-MMM-YYYY / FN'. "
                f"Processed {pages_processed} pages with {total_text_length} characters of text."
            )
        elif subjects_found == 0:
            raise ValueError(
                f"Could not find subject information in the PDF. "
                f"Expected format like 'Subject: CODE:Name'. "
                f"Found {dates_found} date entries but no subjects."
            )
        else:
            raise ValueError(
                f"Found {dates_found} date(s) and {subjects_found} subject(s) "
                f"but no 12-digit register numbers. "
                f"Please verify the PDF contains student registration numbers."
            )

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
