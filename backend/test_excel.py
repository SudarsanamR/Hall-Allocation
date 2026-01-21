
import unittest
import pandas as pd
from app.models import Hall, Student, Seat, HallSeating, SeatingResult
from app.services.excel_generator import generate_hall_wise_excel

class TestExcelGeneration(unittest.TestCase):
    def test_hall_sketch(self):
        print("\nTesting Hall Sketch Excel Generation...")
        
        # Create Dummy Data
        hall = Hall(id='1', name='I-1', block='Maths', rows=5, columns=5, capacity=25)
        students = []
        grid = []
        
        # Fill grid with dummy students
        # 5 rows x 5 cols
        for r in range(5):
            row_seats = []
            for c in range(5):
                s = Student(
                    registerNumber=f"731122{r}{c}00", 
                    subjectCode='SUB1', 
                    department='CSE',
                    examDate='19-Nov-2025',
                    session='FN'
                )
                seat = Seat(row=r, col=c, student=s, subject='SUB1', department='CSE')
                row_seats.append(seat)
            grid.append(row_seats)
            
        hall_seating = HallSeating(hall=hall, grid=grid, studentsCount=25)
        result = SeatingResult(halls=[hall_seating], studentAllocation=[], totalStudents=25, hallsUsed=1)
        
        # Generate Excel
        excel_file = generate_hall_wise_excel(result)
        
        # read back to verify
        df = pd.read_excel(excel_file, sheet_name='I-1', header=None)
        print("Generated Excel Preview (First 10 rows):")
        print(df.head(10))
        
        # Verify structure
        # Row 0: Title
        # Row 1: Hall Info
        # Row 2: Headers (I - ROW...)
        # Row 3+: Data
        
        self.assertTrue("HALL NO : I-1" in str(df.iloc[1, 0]))
        self.assertTrue("I - ROW" in str(df.iloc[2, 1])) # Col index 1 is usually first data col in 0-indexed?
        # Wait, my logic used Columns 1, 3, 5... (0-indexed 1, 3, 5) for Headers?
        # Let's check logic: col_start = (r_idx * 2) + 1. For r=0 -> col 1 (which is 'B' in Excel).
        # Ah, 'A' is col 1 in openpyxl/Excel (1-indexed). So col index 1 = 'A'.
        # My code: cell(row=3, column=col_start). col_start=(0*2)+1 = 1 ('A').
        # So "I - ROW" is in 'A3'.
        
        val_a3 = df.iloc[2, 0] # Row 2 (0,1,2), Col 0 (A)
        print(f"Cell A3 content: {val_a3}")
        self.assertTrue("I - ROW" in str(val_a3))

if __name__ == '__main__':
    unittest.main()
