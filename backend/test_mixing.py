
import unittest
from app.models import Hall, Student
from app.services.seating_algorithm import allocate_seats

class TestInternalMixing(unittest.TestCase):
    def test_imbalanced_subjects(self):
        print("\nTesting Internal Mixing of Group X...")
        # Hall 100 seats
        hall = Hall(id='1', name='H1', block='B', rows=10, columns=10, capacity=100)
        
        # 3 Subjects: A, B, C.
        # Counts: A=10, C=10 (Group X = 20).
        # B=2 (Group Y = 2).
        
        # Expected without mixing:
        # X = A, A... C, C...
        # Queue: A, B, A, B, A, A... (Conflict! -> Spacer -> A _ A _)
        # This wastes space.
        
        # Expected WITH mixing:
        # X = A, C, A, C...
        # Queue: A, B, C, B, A, C, A, C...
        # No Conflict within X! No spacers needed.
        
        students = []
        for i in range(10): students.append(Student(f"A{i}", 'A', 'D', 'D', 'S'))
        for i in range(2): students.append(Student(f"B{i}", 'B', 'D', 'D', 'S'))
        for i in range(10): students.append(Student(f"C{i}", 'C', 'D', 'D', 'S'))
        
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        # Flatten
        snake = []
        for c in range(10): 
            row_iter = range(10) if c%2==0 else range(9,-1,-1)
            for r in row_iter:
                s = grid[r][c].student
                if s: snake.append(s.subjectCode)
                else: snake.append("_")
        
        # Filter trailing empty seats (genuine empty, not spacers)
        # We need to find the last student index
        last_student_idx = -1
        for i in range(len(snake)):
            if snake[i] != "_": last_student_idx = i
            
        snake = snake[:last_student_idx+1]
        
        print(f"Snake Path ({len(snake)}): {snake}")
        
        # Check for Spacers ("_") inside the sequence
        spacers_count = snake.count("_")
        print(f"Spacers found: {spacers_count}")
        
        self.assertEqual(spacers_count, 0, "Mixing failed! Found unnecessary spacers.")
        
        # Check sequence
        # Should be A B C B A C A C...
        
        print("Internal Mixing Verified!")

if __name__ == '__main__':
    unittest.main()
