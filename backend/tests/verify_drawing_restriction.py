import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models import Student, Hall
from app.services.seating_algorithm import allocate_session_strict
from app.models.schemas import SeatingResult

# Mock Data
def create_mock_data():
    # Regular Student
    s1 = Student()
    s1.register_number = "1111"
    s1.subject_code = "CS1234" # Regular
    s1.department = "CSE"
    s1.exam_date = "2025-05-01"
    s1.session = "FN"

    # Drawing Student
    s2 = Student()
    s2.register_number = "2222"
    s2.subject_code = "GE3251" # Drawing subject
    s2.department = "MECH"
    s2.exam_date = "2025-05-01"
    s2.session = "FN"

    students = [s1, s2]

    # Halls
    h1 = Hall(id="1", name="AH1", block="Main", rows=5, columns=5, capacity=25) # Drawing Hall
    h2 = Hall(id="2", name="LH101", block="Main", rows=5, columns=5, capacity=25) # Regular Hall

    halls = [h1, h2]

    return students, halls

def test_restriction():
    print("Testing Drawing Hall Restriction...")
    students, halls = create_mock_data()
    
    try:
        result = allocate_session_strict(students, halls)
        
        # Verify Allocations
        drawing_student_alloc = next((sa for sa in result.studentAllocation if sa.registerNumber == "2222"), None)
        regular_student_alloc = next((sa for sa in result.studentAllocation if sa.registerNumber == "1111"), None)
        
        if not drawing_student_alloc:
            print("FAILED: Drawing student not allocated.")
            return
            
        if not regular_student_alloc:
            print("FAILED: Regular student not allocated.")
            return

        print(f"Drawing Student (2222) allocated to: {drawing_student_alloc.hallName}")
        print(f"Regular Student (1111) allocated to: {regular_student_alloc.hallName}")

        # Assertions
        if drawing_student_alloc.hallName not in ["AH1", "AH2", "AH3", "T6A", "T6B", "AUD1", "AUD2", "AUD3", "AUD4"]:
             print("FAILED: Drawing student allocated to non-drawing hall.")
        else:
             print("SUCCESS: Drawing student in drawing hall.")

        if regular_student_alloc.hallName in ["AH1", "AH2", "AH3", "T6A", "T6B", "AUD1", "AUD2", "AUD3", "AUD4"]:
             # Note: It's technically okay for regular students to be in drawing halls if overflow, 
             # but preferred not to if regular halls available. For this strict restriction task, 
             # the user said "These subject code students should be only allocated to... and not other halls".
             # It implies strict containment for drawing students.
             # It doesn't explicitly forbid regular students from drawing halls, but usually we separate them.
             # Let's assume strict separation for this test.
             print("WARNING: Regular student in drawing hall (Check if intended).")
        else:
             print("SUCCESS: Regular student in regular hall.")

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_restriction()
