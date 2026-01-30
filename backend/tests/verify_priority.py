import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models import Student, Hall
from app.services.seating_algorithm import allocate_seats, PRIORITY_SUBJECT_CODES

def create_mock_data():
    # Priority Student (Department A)
    s1 = Student()
    s1.register_number = "1111"
    s1.subject_code = "ME3591" # Priority ME Subject
    s1.department = "MECH"
    s1.exam_date = "2025-05-01"
    s1.session = "FN"

    # Normal Student (Department A)
    s2 = Student()
    s2.register_number = "2222"
    s2.subject_code = "ME9999" # Not Priority
    s2.department = "MECH"
    s2.exam_date = "2025-05-01"
    s2.session = "FN"

    # Priority Student (Department B)
    s3 = Student()
    s3.register_number = "3333"
    s3.subject_code = "AU3301" # Priority AU Subject
    s3.department = "AUTO"
    s3.exam_date = "2025-05-01"
    s3.session = "FN"

    students = [s1, s2, s3]

    # Hall (Capacity 2)
    h1 = Hall(id="1", name="Hall1", block="Main", rows=1, columns=2, capacity=2)
    halls = [h1]

    return students, halls

def test_priority():
    print("Testing Priority Allocation...")
    students, halls = create_mock_data()

    # Ensure our subject codes are actually in the priority list
    assert "ME3591" in PRIORITY_SUBJECT_CODES
    assert "AU3301" in PRIORITY_SUBJECT_CODES
    assert "ME9999" not in PRIORITY_SUBJECT_CODES

    try:
        result = allocate_seats(students, halls)
        
        print(f"Total Allocated: {len(result.studentAllocation)}")
        
        # Check Allocation Order (roughly)
        # We have 3 students, 2 seats.
        # Priority Students (s1, s3) should be allocated.
        # Normal Student (s2) should be leftover (unallocated) or allocated last if capacity allows.
        
        alloc_regs = [sa.registerNumber for sa in result.studentAllocation]
        print(f"Allocated Registers: {alloc_regs}")
        
        if "1111" in alloc_regs and "3333" in alloc_regs:
            print("SUCCESS: Both Priority Students Allocated.")
        else:
            print("FAILED: Priority Students missed.")
            
        if "2222" not in alloc_regs:
             print("SUCCESS: Normal student skipped (due to capacity).")
        else:
             print("WARNING: Normal student allocated (unexpected if capacity < count).")
             
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_priority()
