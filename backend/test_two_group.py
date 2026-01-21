
import unittest
from app.models import Hall, Student
from app.services.seating_algorithm import allocate_seats

class TestTwoGroupSplit(unittest.TestCase):
    def test_xy_interleaving(self):
        print("\nTesting X/Y Split Logic...")
        # Hall 100 seats
        hall = Hall(id='1', name='H1', block='B', rows=10, columns=10, capacity=100)
        
        # 3 Subjects: A, B, C.
        # X = A + C (Since A=0, B=1, C=2)
        # Y = B
        # Expected Queue: X1, Y1, X2, Y2...
        # i.0: X(A0), Y(B0)
        # i.1: X(A1), Y(B1)
        # ... A runs out or switching? A... then C...
        
        students = []
        for i in range(5): students.append(Student(f"A{i}", 'A', 'D', 'D', 'S'))
        for i in range(5): students.append(Student(f"B{i}", 'B', 'D', 'D', 'S'))
        for i in range(5): students.append(Student(f"C{i}", 'C', 'D', 'D', 'S'))
        
        # total 15 students.
        # Sorted Keys: A, B, C.
        # X: A(5), C(5). Total 10.
        # Y: B(5). Total 5.
        
        # Allocation:
        # 0: X[0]=A0, Y[0]=B0
        # 1: X[1]=A1, Y[1]=B1
        # 2: X[2]=A2, Y[2]=B2
        # ...
        # 4: X[4]=A4, Y[4]=B4
        # 5: X[5]=C0, Y[5]=IndexError? No, logic handles exhausted Y.
        
        result = allocate_seats(students, [hall])
        grid = result.halls[0].grid
        
        # Flatten
        snake = []
        count = 15
        for c in range(10): 
            row_iter = range(10) if c%2==0 else range(9,-1,-1)
            for r in row_iter:
                s = grid[r][c].student
                if s: snake.append(s.subjectCode)
                
        print("Snake:", snake)
        
        # Verify sequence
        # Should be A B A B A B A B A B C C C C C 
        # Wait, if Y runs out, X continues.
        # X continues with C...
        # So C C C C C.
        # BUT Spacer logic should kick in!
        # C _ C _ C _ C...
        
        self.assertEqual(snake[0], 'A')
        self.assertEqual(snake[1], 'B')
        
        # Check tail for spacers or alternation
        # Index 10 starts the C tail.
        # snake[10] should be C.
        self.assertEqual(snake[10], 'C')
        
        # Wait, strictly speaking, Spacer is NOT inserted if we read grid.student.
        # My flatten loop ignores empty seats.
        # Let's check grid positions.
        # 15 Students + Spacers.
        # Total capacity 100.
        # Tail C should have spacers.
        # So total Allocated Count should be > 15?
        # Actually allocate_seats returns `studentsCount`. It doesn't count spacers.
        
        # Let's count non-none/non-empty objects in the grid items really.
        
        # Manually check grid for gap
        # The 10th item (A, B... pairs -> 10 items 0-9)
        # item 10 is C.
        # item 11 should be EMPTY (Spacer).
        # item 12 should be C.
        
        # Where is item 11 in grid?
        # 0..9 filled. 
        # Col 0 (0-9) filled?
        # A B A B A B A B A B (10 items) -> Row 0-9.
        # Col 0 is Full.
        # Col 1 (Bottom Up).
        # Col 1 Row 9 -> Item 10 (C).
        # Col 1 Row 8 -> Item 11 (Spacer).
        # Col 1 Row 7 -> Item 12 (C).
        
        c1r9 = grid[9][1].student
        c1r8 = grid[8][1].student
        c1r7 = grid[7][1].student
        
        self.assertIsNotNone(c1r9) # C
        self.assertEqual(c1r9.subjectCode, 'C')
        
        self.assertIsNone(c1r8) # Spacer
        
        self.assertIsNotNone(c1r7) # C
        self.assertEqual(c1r7.subjectCode, 'C')
        
        print("Two Group Split + Spacer Verified!")

if __name__ == '__main__':
    unittest.main()
