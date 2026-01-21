
import unittest
from app.models import Hall, Student
from app.services.seating_algorithm import allocate_seats

class TestSpacerLogic(unittest.TestCase):
    def test_spacer_insertion(self):
        print("\nTesting Intelligent Spacers...")
        
        # 5x5 Hall (25 seats)
        hall = Hall(id='1', name='H1', block='B', rows=5, columns=5, capacity=25)
        
        # 10 Students: 8 CSE (X), 2 ECE (Y)
        # Total 10 students, 25 capacity -> PLENTY of space.
        # Should NOT see X next to X.
        # Expected: X, Y, X, Y, X, None, X, None, X, None...
        
        students = []
        for i in range(8):
            students.append(Student(f"X{i+1}", 'SUB1', 'CSE', '19-11-25', 'FN'))
        for i in range(2):
            students.append(Student(f"Y{i+1}", 'SUB2', 'ECE', '19-11-25', 'FN'))
            
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        print("Grid Visualization:")
        for r_idx, row in enumerate(grid):
            line = []
            for seat in row:
                val = seat.student.registerNumber if seat.student else "____"
                line.append(val)
            print(f"Row {r_idx}: {line}")
            
        # Verify no adjacent X next to X (Vertical or Horizontal)
        # Check (0,0)=X1, (1,0)=Y1, (2,0)=X2, (3,0)=Y2, (4,0)=X3
        # Then Col 2 (Bottom Up):
        # (4,1)=Spacer? (3,1)=X4?
        
        # Let's count conflicts
        conflicts = 0
        for r in range(5):
            for c in range(5):
                seat = grid[r][c]
                if not seat.student: continue
                
                my_sub = seat.student.subjectCode
                # check neighbors
                neighbors = [(r+1,c), (r-1,c), (r,c+1), (r,c-1)]
                for nr, nc in neighbors:
                    if 0 <= nr < 5 and 0 <= nc < 5:
                        ns = grid[nr][nc]
                        if ns.student and ns.student.subjectCode == my_sub:
                            conflicts += 1
                            print(f"Conflict at ({r},{c}) with ({nr},{nc})")
                            
        self.assertEqual(conflicts, 0, "Found adjacent conflicts despite having extra space!")
        print("Spacer test passed!")

if __name__ == '__main__':
    unittest.main()
