# Exam Allocation Backend

The core logic and data processing engine for the Seat Allotment System. Built with Flask, this service handles PDF parsing, intelligent seat allocation, and data management.

## 🧠 Core Logic

### 1. Seating Algorithm
The system uses a custom **"Vertical Snake"** allocation strategy designed to minimize cheating opportunities by preventing students from the same subject or department from sitting adjacently.

**Key Components:**
-   **Active Pair Strategy (Subject Mixing)**:
    -   Sorts all subject groups by size (largest first).
    -   Picks the two largest groups as an "Active Pair".
    -   Interleaves students from these two groups to fill the queue.
    -   Once a group is exhausted, the next largest group enters the active pair.

-   **Internal Department Mixing (Round Robin)**:
    -   *Problem*: A subject might have 95% of students. Even with mixing, they might sit together.
    -   *Solution*: Within a single Subject Group, students are further grouped by Department.
    -   The system uses a **Round Robin** selector to pick students from different departments sequentially (e.g., CSE -> IT -> ECE -> CSE...) before adding them to the allocation queue.
    -   This ensures that even if a hall is filled with only "Python" exam students, a CSE student will sit next to an IT student, not another CSE student.

-   **Vertical Snake Pattern**:
    -   Fills the seating grid column by column.
    -   **Even Columns (0, 2, ...)**: Filled Top-to-Bottom.
    -   **Odd Columns (1, 3, ...)**: Filled Bottom-to-Top.
    -   This serpentine path maximizes the distance between sequence neighbors in the grid structure.

-   **Intelligent Spacers**:
    -   If the algorithm detects that the next student in the queue causes a hard conflict (Same Subject AND Same Department) with the previous seated student, it inserts a **Spacer** (empty seat).
    -   Spacers are only used if the hall is not fully packed.

### 2. Hall Configuration & Priority
-   **Block Priority**: Halls are grouped by "Block" (e.g., Main Block, Mechanical Block). The allocation algorithm fills blocks in a specific order. This order can be customized via the API.
-   **Auditorium Layouts**: Specific logic exists for Auditoriums, defined as 9x3 grids. Despite having 27 physical slots, they are explicitly capped at a **capacity of 25 students** to meet exam standards.

### 3. PDF Parsing Logic
The `pdf_parser.py` service extracts structured data from university exam timetables (PDFs).

-   **Context Extraction**: Scans the PDF line-by-line using Regex to find "Exam Date", "Session", and "Subject Code/Name". These values persist as "context" until they change.
-   **Registration Number Extraction**: Regex `\b\d{12}\b` identifies 12-digit register numbers suitable for the active context.
-   **Department Inference**: Automatically infers the department code from the 7th-9th digits of the register number (Standard Anna University format).
    -   `104` -> CSE
    -   `205` -> IT
    -   `106` -> ECE
    -   (and so on...)

## 📂 Project Structure

```
backend/
├── app/
│   ├── routes/
│   │   ├── seating.py       # API for generating/retrieving allotments
│   │   ├── upload.py        # API for PDF/Excel uploads
│   │   └── halls.py         # API for Hall CRUD and Block Reordering
│   ├── services/
│   │   ├── seating_algorithm.py  # (Logic described above)
│   │   ├── pdf_parser.py         # (Logic described above)
│   │   └── excel_generator.py    # Export formatting
│   └── models/               # Data classes (Student, Hall, Seat)
├── run.py                    # App entry point
└── requirements.txt          # Python dependencies
```

## 🚀 Setup & Run

1.  **Create Virtual Environment**:
    ```bash
    python -m venv venv
    venv\Scripts\activate  # Windows
    # or
    source venv/bin/activate  # Mac/Linux
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run Application**:
    ```bash
    python run.py
    ```
    Server starts at `http://localhost:5000`.

## 📡 API Endpoints

-   `POST /upload`: Upload PDF/Excel files.
-   `GET /halls`: List all configured halls.
-   `POST /halls`: Create a new hall.
-   `POST /halls/reorder_blocks`: Reorder the priority of hall blocks (expects list of block names).
-   `POST /generate`: Trigger the allocation algorithm.
-   `GET /allocations`: Retrieve the latest allocation results.
