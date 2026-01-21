
import pandas as pd
from io import BytesIO
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from app.models import SeatingResult, HallSeating

def generate_hall_wise_excel(seating_result: SeatingResult) -> BytesIO:
    """
    Generate Excel file with hall-wise seating arrangement in 'Hall Sketch' format.
    Transposes rows to columns (Vertical Rows).
    """
    output = BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        for hall_seating in seating_result.halls:
            _write_hall_sketch(writer, hall_seating, seating_result)
    
    output.seek(0)
    return output

def generate_student_wise_excel(seating_result: SeatingResult) -> BytesIO:
    # ... (Same as before, keep implementation or re-include it)
    output = BytesIO()
    data = []
    for allocation in seating_result.studentAllocation:
        data.append({
            'Registration Number': allocation.registerNumber,
            'Subject': allocation.subject,
            'Department': allocation.department,
            'Hall': allocation.hallName,
            'Seat Number': allocation.seatNumber,
            'Row': allocation.row + 1,
            'Column': allocation.col + 1
        })
    df = pd.DataFrame(data)
    df = df.sort_values(['Registration Number'])
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Student Allocations', index=False)
        worksheet = writer.sheets['Student Allocations']
        for idx, col in enumerate(df.columns):
            worksheet.column_dimensions[chr(65 + idx)].width = 20
            
    output.seek(0)
    return output

def _write_hall_sketch(writer, hall_seating, result_context):
    hall = hall_seating.hall
    grid = hall_seating.grid
    
    # Create the sheet
    sheet_name = hall.name[:31]
    # We will write directly using openpyxl for complex formatted headers
    # Create a dummy dataframe to initialize sheet
    df_dummy = pd.DataFrame()
    df_dummy.to_excel(writer, sheet_name=sheet_name, index=False)
    
    worksheet = writer.sheets[sheet_name]
    
    # Styles
    bold_center = Alignment(horizontal='center', vertical='center', wrap_text=True)
    header_font = Font(name='Calibri', size=11, bold=True)
    title_font = Font(name='Calibri', size=14, bold=True, underline='single')
    border_style = Side(style='thin')
    full_border = Border(left=border_style, right=border_style, top=border_style, bottom=border_style)
    
    # 1. Main Title
    # Extract date from first student if available
    exam_date = "NOV/DEC 2025" # Default
    session = "FN"
    for row in grid:
        for seat in row:
            if seat.student:
                exam_date_obj = seat.student.examDate
                session = seat.student.session
                break
    
    # Row 1: Main Title
    worksheet.merge_cells(start_row=1, start_column=1, end_row=1, end_column=hall.rows * 2)
    title_cell = worksheet.cell(row=1, column=1)
    title_cell.value = "GCE : : ERODE - 638 316 - ANNA UNIVERSITY EXAMS - HALL SKETCH - " + "2025"
    title_cell.font = title_font
    title_cell.alignment = bold_center
    
    # Row 2: Hall Info and Date
    # "HALL NO : <Name>" at left ----- "Date & Session : <Date> <Session>" at right?
    # Reference shows Hall No at Col A, Date at Col C?
    worksheet['A2'] = f"HALL NO : {hall.name}"
    worksheet['A2'].font = header_font
    
    # Calculate merged center for date
    mid_point = (hall.rows * 2) // 2
    worksheet.cell(row=2, column=mid_point).value = f"Date & Session : {exam_date} {session}"
    
    # Row 3: Column Headers (Which represent Physical Rows)
    # Pairs of columns: "I - ROW with Seat No", "Empty" (merged?)
    # Reference: "I - ROW with Seat No" takes up one column?
    # Sample: Col A: "I - ROW...", Col B: NaN (Seat numbers in data row?)
    # Let's assume Col A is Reg No, Col B is Seat No. Title "I - ROW with Seat No" spans A & B? 
    # Or just sits in A. Let's merge for better look.
    
    row_numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
    
    start_data_row = 4
    
    for r_idx in range(hall.rows):
        # Calculate Excel columns for this Physical Row
        # Physical Row 0 -> Excel Cols A, B (Idx 1, 2)
        # Physical Row 1 -> Excel Cols C, D (Idx 3, 4)
        col_start = (r_idx * 2) + 1
        col_end = col_start + 1
        
        # Header: "X - ROW with Seat No"
        roman = row_numerals[r_idx] if r_idx < len(row_numerals) else f"{r_idx+1}"
        header_text = f"{roman} - ROW with Seat No"
        
        # Merge for header
        cell = worksheet.cell(row=3, column=col_start)
        cell.value = header_text
        cell.font = header_font
        cell.alignment = bold_center
        # worksheet.merge_cells(start_row=3, start_column=col_start, end_row=3, end_column=col_end) 
        # Actually reference shows "Seat No" is explicit in data, maybe implicit in header?
        # Let's put header in Left cell, leave Right cell empty or merge?
        # Reference has "Unnamed: 1" as NaN, so likely merged or just overflow.
        
        # Column Widths
        worksheet.column_dimensions[chr(64 + col_start)].width = 15 # Student Reg No
        worksheet.column_dimensions[chr(64 + col_end)].width = 5    # Seat No
        
        # Fill Data
        # Physical Row `r_idx` has seats 0 to hall.columns-1
        # In Excel, these go vertically down from `start_data_row`
        
        if r_idx < len(grid):
            p_row = grid[r_idx]
            for c_idx, seat in enumerate(p_row):
                # Data Row index
                d_row = start_data_row + c_idx
                
                # Reg No Cell
                reg_cell = worksheet.cell(row=d_row, column=col_start)
                seat_cell = worksheet.cell(row=d_row, column=col_end)
                
                if seat.student:
                    reg_cell.value = seat.student.registerNumber
                else:
                    reg_cell.value = ""
                
                # Seat Number (Calculated: Row * Cols + Col + 1)
                # Or just sequential?
                # Physical Seat Num = (r_idx * hall.columns) + c_idx + 1
                seat_num = (r_idx * hall.columns) + c_idx + 1
                seat_cell.value = seat_num
                
                # Styles
                reg_cell.alignment = Alignment(horizontal='center')
                seat_cell.alignment = Alignment(horizontal='center')
                reg_cell.border = full_border
                seat_cell.border = full_border

