
import unittest
from app.models import Hall, Student
from app.services.seating_algorithm import allocate_seats

class TestRoundRobin(unittest.TestCase):
    def test_multi_subject_mixing(self):
        print("\nTesting Round Robin Mixing...")
        
        # 1 Hall (100 seats)
        hall = Hall(id='1', name='H1', block='B', rows=10, columns=10, capacity=100)
        
        # 3 Subjects: A, B, C. 30 students each. Total 90.
        students = []
        for i in range(30):
            students.append(Student(f"A{i:02d}", 'SUB_A', 'D1', '19-11', 'FN'))
            students.append(Student(f"B{i:02d}", 'SUB_B', 'D2', '19-11', 'FN'))
            students.append(Student(f"C{i:02d}", 'SUB_C', 'D3', '19-11', 'FN'))
            
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        # Verify first few student in Col 1 (Top-Down)
        # Sequence should be A, B, C, A, B, C...
        
        s1 = grid[0][0].student.subjectCode
        s2 = grid[1][0].student.subjectCode
        s3 = grid[2][0].student.subjectCode
        s4 = grid[3][0].student.subjectCode
        
        print(f"Sequence: {s1} -> {s2} -> {s3} -> {s4}")
        
        self.assertEqual(s1, 'SUB_A')
        self.assertEqual(s2, 'SUB_B')
        self.assertEqual(s3, 'SUB_C')
        self.assertEqual(s4, 'SUB_A')
        
        print("Round Robin mixed verified!")

    def test_dynamic_spacer(self):
        print("\nTesting Dynamic Spacer with Tail...")
        # Hall 25 seats
        hall = Hall(id='1', name='H1', block='B', rows=5, columns=5, capacity=25)
        # 5 A, 5 B, 10 C. Total 20.
        # Queue should be: A, B, C, A, B, C... (A/B exhaust) ... C, Spacer, C, Spacer...
        
        students = []
        for i in range(5):
            students.append(Student(f"A{i}", 'A', 'D', 'D', 'S'))
            students.append(Student(f"B{i}", 'B', 'D', 'D', 'S'))
        for i in range(10):
            students.append(Student(f"C{i}", 'C', 'D', 'D', 'S'))
            
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        # Visualize
        flat_grid = []
        for c in range(5):
             col_vals = []
             row_iter = range(5) if c%2==0 else range(4,-1,-1)
             for r in row_iter:
                 s = grid[r][c].student
                 if s: col_vals.append(s.subjectCode)
                 else: col_vals.append("_")
             flat_grid.extend(col_vals)
             
        print("Snake Path:", flat_grid)
        
        # Check adjacent C's in path
        for i in range(len(flat_grid)-1):
            if flat_grid[i] == 'C' and flat_grid[i+1] == 'C':
                self.fail(f"Found adjacent C at index {i} in path!")
                
        print("Dynamic Spacer prevents tail conflict!")

if __name__ == '__main__':
    unittest.main()
