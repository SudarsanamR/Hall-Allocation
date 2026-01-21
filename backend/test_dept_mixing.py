
import unittest
from app.models import Hall, Student
from app.services.seating_algorithm import allocate_seats

class TestDeptMixing(unittest.TestCase):
    def test_same_subject_diff_dept(self):
        print("\nTesting Same Subject Different Dept...")
        # Hall 100
        hall = Hall(id='1', name='H1', block='B', rows=10, columns=10, capacity=100)
        
        # 1 Subject (A). 20 Students.
        # 10 CSE, 10 IT.
        # Active Pair logic sees only Subject A.
        # It should produce: A(CSE), A(IT), A(CSE), A(IT)...
        # No spacers should be inserted because Depts are diff.
        
        students = []
        for i in range(10): students.append(Student(f"C{i}", 'A', 'CSE', 'D', 'S'))
        for i in range(10): students.append(Student(f"I{i}", 'A', 'IT', 'D', 'S'))
        
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        snake = []
        for c in range(10): 
            row_iter = range(10) if c%2==0 else range(9,-1,-1)
            for r in row_iter:
                s = grid[r][c].student
                if s: snake.append(s.department)
                else: snake.append("_")
        
        # Check first 20 items for Spacers
        relevant_part = snake[:20]
        print(f"Path: {relevant_part}")
        
        self.assertEqual(relevant_part.count("CSE"), 10)
        self.assertEqual(relevant_part.count("IT"), 10)
        self.assertEqual(relevant_part.count("_"), 0)
        
        # Verify alternation
        # Index 0: CSE, Index 1: IT...
        self.assertEqual(relevant_part[0], 'CSE')
        self.assertEqual(relevant_part[1], 'IT')
        self.assertEqual(relevant_part[2], 'CSE')
        
        print("Internal Dept Mixing Verified!")

    def test_same_subject_same_dept_spacer(self):
        print("\nTesting Same Subject Same Dept (Spacer check)...")
        # 5 students Same Sub, Same Dept. Hall 20.
        # Should have spacers: CSE _ CSE _ CSE...
        
        hall = Hall(id='1', name='H1', block='B', rows=5, columns=4, capacity=20)
        students = []
        for i in range(5): students.append(Student(f"C{i}", 'A', 'CSE', 'D', 'S'))
        
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        snake = []
        for c in range(4): 
            row_iter = range(5) if c%2==0 else range(4,-1,-1)
            for r in row_iter:
                s = grid[r][c].student
                if s: snake.append(s.department)
                else: snake.append("_")
                
        # First few items should show gaps
        print(f"Path: {snake[:10]}")
        self.assertEqual(snake[0], 'CSE')
        self.assertEqual(snake[1], '_')
        self.assertEqual(snake[2], 'CSE')
        
        print("Spacer for single dept verified!")

if __name__ == '__main__':
    unittest.main()
