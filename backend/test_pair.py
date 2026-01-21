
import unittest
from app.models import Hall, Student
from app.services.seating_algorithm import allocate_seats

class TestActivePair(unittest.TestCase):
    def test_pair_replacement(self):
        print("\nTesting Active Pair Strategy (A+B then A+C)...")
        # Hall 100
        hall = Hall(id='1', name='H1', block='B', rows=10, columns=10, capacity=100)
        
        # 3 Subjects.
        # A=10
        # B=4
        # C=6
        # Sorted Order: A(10), C(6), B(4). (Size Descending)
        # Active: A & C.
        # Allocation: A, C, A, C, A, C...
        # C (6) runs out before A (10).
        # C replaced by next available: B.
        # Allocation continues: A, B, A, B...
        
        students = []
        for i in range(10): students.append(Student(f"A{i}", 'A', 'D', 'D', 'S'))
        for i in range(4): students.append(Student(f"B{i}", 'B', 'D', 'D', 'S'))
        for i in range(6): students.append(Student(f"C{i}", 'C', 'D', 'D', 'S'))
        
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        # Flatten and filter empty
        snake = []
        for c in range(10): 
            row_iter = range(10) if c%2==0 else range(9,-1,-1)
            for r in row_iter:
                s = grid[r][c].student
                if s: snake.append(s.subjectCode)
                
        print(f"Snake Path ({len(snake)}): {snake}")
        
        # Verify only 2 subjects mixed active at a time?
        # Initial segment should have A and C.
        # Later segment should have A and B.
        # A and B are never mixed with C simultaneously in the local sequence (triplets).
        
        # Check first 12 items (6 pairs of A/C)
        first_part = snake[:12]
        print("First Part:", first_part)
        self.assertTrue('B' not in first_part, "B appeared too early! Should wait for C to finish.")
        
        # Check later part
        later_part = snake[12:]
        print("Later Part:", later_part)
        self.assertTrue('C' not in later_part, "C appeared after it finished!")
        self.assertTrue('B' in later_part, "B missing from later part!")
        
        print("Active Pair Replacement Verified!")

if __name__ == '__main__':
    unittest.main()
