
import unittest
from app.models import Hall, Student, Seat
from app.services.seating_algorithm import allocate_seats

class TestSnakeAlgorithm(unittest.TestCase):
    def test_snake_pattern(self):
        print("\nTesting Vertical Snake Pattern...")
        
        # 5x5 Hall
        hall = Hall(id='1', name='H1', block='B', rows=5, columns=5, capacity=25)
        
        # 25 Students: 13 CSE (X), 12 ECE (Y)
        students = []
        for i in range(13):
            students.append(Student(f"X{i+1:02d}", 'SUB1', 'CSE', '19-11-25', 'FN'))
        for i in range(12):
            students.append(Student(f"Y{i+1:02d}", 'SUB2', 'ECE', '19-11-25', 'FN'))
            
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        # Verify Col 1 (Top-Down): X1, Y1, X2, Y2, X3
        # Indices in my code might be 0-based.
        # X1 (00), Y1(01), X2(02)... 
        # Wait, if sorted by RegNo: X01, X02... Y01, Y02...
        # Interleaved: X01, Y01, X02, Y02, X03
        
        # Check (0,0) -> X01
        self.assertEqual(grid[0][0].student.subjectCode, 'SUB1')
        self.assertEqual(grid[1][0].student.subjectCode, 'SUB2')
        self.assertEqual(grid[2][0].student.subjectCode, 'SUB1')
        
        # Check Col 2 (Bottom-Up)
        # Sequence continues... 
        # Col 1 ends at (4,0) -> X3 (Index 4 in interleaved)
        # Col 2 starts at (4,1) -> Y3 (Index 5)
        self.assertEqual(grid[4][1].student.subjectCode, 'SUB2')
        self.assertEqual(grid[3][1].student.subjectCode, 'SUB1') # X4
        
        print("Pattern verification passed!")

if __name__ == '__main__':
    unittest.main()
