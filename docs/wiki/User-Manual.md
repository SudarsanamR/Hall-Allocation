# User Manual

This guide explains how to use the Exam Seat Allotment application.

## 1. Dashboard Overview
Upon logging in, you are greeted by the Dashboard.
*   **Stats**: View total students, halls, and capacity.
*   **Actions**: "Upload Data" and "Manage Halls" are your primary tools.

## 2. Step 1: Manage Halls
Go to the **Hall Management** page.
1.  **Add Halls**: Click "Add Hall" to define a new room.
    *   **Auditoriums**: Use `9` Rows x `3` Columns for standard Auditoriums (The system automatically caps capacity at 25).
    *   **Classrooms**: Use standard dimensions (e.g., `5x5`).
2.  **Order Priority**:
    *   Drag and drop the **Blocks** (grouped halls) to set the order of filling.
    *   *Example*: Drag "Auditorium" to the top to fill it first.

## 3. Step 2: Upload Data
Go to the **Upload Data** page.
1.  **PDF Timetables**: Upload the university exam schedule PDF. The system extracts subject codes and exam dates.
2.  **Student Excel**: Upload the student name list if available (optional/specific format).
3.  **Wait**: The system parses the files. Check the log for any "Skipped" or "Error" entries.

## 4. Step 3: Generate Seating
Once data is loaded and halls are ready:
1.  Go to **Dashboard** or **Seating** page.
2.  Click **"Generate Allocation"**.
3.  The algorithm processes the data. This may take a few seconds.

## 5. Step 4: View & Export Results
Go to the **Results** page.
1.  **Select a Hall**: Choose a hall from the dropdown.
2.  **Visual Grid**: See the generated seating plan.
    *   Hover over seats to see student details.
    *   Check for empty seats (Spacers) which separate same-subject students.
3.  **Export**: Click "Export to Excel" to download the final report for printing.
