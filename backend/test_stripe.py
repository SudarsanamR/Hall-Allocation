
import unittest
from app.models import Hall, Student
from app.services.seating_algorithm import allocate_seats

class TestColumnStripe(unittest.TestCase):
    def test_column_stripe_separation(self):
        print("\nTesting Column Stripe Pattern...")
        
        # 4x4 Hall (16 seats)
        hall = Hall(id='1', name='H1', block='B', rows=4, columns=4, capacity=16)
        
        # 8 Students A, 8 Students B.
        # Expect Col 0 -> A, Col 1 -> B, Col 2 -> A, Col 3 -> B
        
        students = []
        for i in range(8):
            students.append(Student(f"A{i}", 'SUB_A', 'D1', 'D', 'S'))
        for i in range(8):
            students.append(Student(f"B{i}", 'SUB_B', 'D2', 'D', 'S'))
            
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        # Verify Cols
        col0_subs = [s.student.subjectCode for s in [grid[r][0] for r in range(4)] if s.student]
        col1_subs = [s.student.subjectCode for s in [grid[r][1] for r in range(4)] if s.student]
        col2_subs = [s.student.subjectCode for s in [grid[r][2] for r in range(4)] if s.student]
        col3_subs = [s.student.subjectCode for s in [grid[r][3] for r in range(4)] if s.student]
        
        print("Col 0:", col0_subs)
        print("Col 1:", col1_subs)
        print("Col 2:", col2_subs)
        print("Col 3:", col3_subs)
        
        self.assertTrue(all(s == 'SUB_A' for s in col0_subs))
        self.assertTrue(all(s == 'SUB_B' for s in col1_subs))
        self.assertTrue(all(s == 'SUB_A' for s in col2_subs))
        self.assertTrue(all(s == 'SUB_B' for s in col3_subs))
        
        print("Stripe Pattern Verified!")
        
    def test_mid_column_switch(self):
        print("\nTesting Mid-Column Switch...")
        # 2x2 Hall
        hall = Hall(id='1', name='H1', block='B', rows=2, columns=2, capacity=4)
        
        # 1 Student A, 3 Student B.
        # Col 0: A (1) -> then switch to B?
        # A runs out. Switch to B? But B is 'Next best'. 
        # Col 0: A, B.
        # Col 1: B, B.
        # Conflict check: Col 0 Row 1 (B) vs Col 1 Row 1 (B). Conflict!
        # But Capacity forced it.
        
        students = [Student("A1", "A", "D", "D", "S")]
        students.extend([Student(f"B{i}", "B", "D", "D", "S") for i in range(3)])
        
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        print(f"({grid[0][0].student.subjectCode}) ({grid[0][1].student.subjectCode})")
        print(f"({grid[1][0].student.subjectCode}) ({grid[1][1].student.subjectCode})")
        
        # Col 0: Top-Down. Row 0=A1. Row 1=B0 (Switch)
        self.assertEqual(grid[0][0].student.subjectCode, 'A')
        self.assertEqual(grid[1][0].student.subjectCode, 'B')
        
if __name__ == '__main__':
    unittest.main()
