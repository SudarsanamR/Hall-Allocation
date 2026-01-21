import unittest
from app.models import Student, Hall
from app.services.seating_algorithm import allocate_seats, validate_no_adjacent_conflict

class TestSeatingAlgorithm(unittest.TestCase):
    def setUp(self):
        # Create dummy halls
        self.halls = [
            Hall(id='1', name='H1', block='B1', rows=5, columns=5, capacity=25),
            Hall(id='2', name='H2', block='B1', rows=5, columns=5, capacity=25)
        ]
        
    def test_alternating_subjects(self):
        """Test Case 1: Multiple subjects"""
        print("\nTesting Multi-Subject Allocation...")
        students = []
        # Create 25 students with Subject A and 25 with Subject B
        for i in range(25):
            students.append(Student(
                registerNumber=f"A{i:03d}", subjectCode='SUB_A', 
                department='DEPT_A', examDate='2026-02-10', session='FN'
            ))
        for i in range(25):
            students.append(Student(
                registerNumber=f"B{i:03d}", subjectCode='SUB_B', 
                department='DEPT_B', examDate='2026-02-10', session='FN'
            ))
            
        result = allocate_seats(students, self.halls)
        
        # Verify result
        self.assertEqual(result.totalStudents, 50)
        self.assertEqual(result.hallsUsed, 2)
        
        # Verify no adjacent conflicts
        for hall_seat in result.halls:
            is_valid = validate_no_adjacent_conflict(hall_seat.grid, 'subject')
            self.assertTrue(is_valid, f"Hall {hall_seat.hall.name} has adjacent conflicts")
            print(f"Hall {hall_seat.hall.name}: Verified no adjacent subject conflicts")

    def test_alternating_departments(self):
        """Test Case 2: Single subject, multiple departments"""
        print("\nTesting Single-Subject (Multi-Dept) Allocation...")
        students = []
        # Create 25 students from Dept A and 25 from Dept B, all same subject
        for i in range(25):
            students.append(Student(
                registerNumber=f"A{i:03d}", subjectCode='COMMON', 
                department='DEPT_A', examDate='2026-02-10', session='FN'
            ))
        for i in range(25):
            students.append(Student(
                registerNumber=f"B{i:03d}", subjectCode='COMMON', 
                department='DEPT_B', examDate='2026-02-10', session='FN'
            ))
            
        result = allocate_seats(students, self.halls)
        
        # Verify result
        self.assertEqual(result.totalStudents, 50)
        
        # Verify no adjacent conflicts
        for hall_seat in result.halls:
            is_valid = validate_no_adjacent_conflict(hall_seat.grid, 'department')
            self.assertTrue(is_valid, f"Hall {hall_seat.hall.name} has adjacent conflicts")
            print(f"Hall {hall_seat.hall.name}: Verified no adjacent department conflicts")

if __name__ == '__main__':
    unittest.main()
