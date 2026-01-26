# Presentation Content: Automated University Theory Examination Seating Arrangement System

## Base Template Structure
Based on `SCH_2026_Template.pdf`

---

## Slide 1: Title Slide

**Project Title:**
Automated University Theory Examination Seating Arrangement System

**Team ID:** PS09

**Team Members:**
- Sudarsanam R
- Kanagaraj M
- Prime R S
- Sanjith N C
- Sriram T

---

## Slide 2: Problem Statement

**Core Challenges in Manual Seating:**
1.  **Manual Inefficiency:**
    *   Traditional planning is time-consuming, tedious, and prone to human error, especially for large universities.
2.  **Malpractice Prevention:**
    *   Manually ensuring physical separation between students of the same subject to prevent copying is extremely complex.
3.  **Data Management Chaos:**
    *   Handling thousands of student records, subjects, and hall tickets manually leads to data silos and fragmentation.
4.  **Lack of Audit Trails:**
    *   Paper-based records are difficult to verify post-exam and lack transparency.

---

## Slide 3: Abstract

**Overview:**
A comprehensive **Cross-Platform Desktop Application** designed to automate and optimize the university exam seating process. The system replaces manual effort with an intelligent algorithmic engine that guarantees fair and organized seating arrangements, packaged as a standalone executable.

**Key Highlights:**
*   **Hybrid Native Architecture:** Built with **Tauri v2**, combining a **React/Vite** frontend with a native **Python/Flask** backend.
*   **Offline-First & Privacy-Focused:** Runs entirely locally on the client machine; no external servers or data leaks.
*   **Robust Algorithmic Engine:** Utilizes `pandas` and `pdfplumber` within a compiled Python sidecar for precise data processing.
*   **Vertical Snake Algorithm:** A unique seating pattern that fills halls in a zigzag logical flow to maximize student separation.
*   **One-Click Installation:** Automated installers for Windows with built-in auto-update capabilities via GitHub Releases.

---

## Slide 4: Proposed Solution & Architecture

**1. Intelligent Data Ingestion (One-Click ETL)**
*   **Drag-and-Drop Interface:** Seamless upload for raw university data files (PDFs).
*   **Automated Parsing:** Custom Regex Engine utilizes `pdfplumber` to extract Student Names, Registration Numbers, and Exam Schedules with high accuracy.

**2. Algorithmic Allocation Engine (The Core)**
*   **Vertical Snake Traversal:** Fills seats in an alternating Top-Down / Bottom-Up pattern across columns.
*   **Subject Interleaving:** Mathematically interleaves students from different departments (e.g., mixing CSE and IT) to prevent clusters.

**3. Digital "Hall Sketch" & Tracking**
*   **Visual Output:** Generates printable Excel/PDF seating grids that mimic physical hall layouts.

**4. Modern Desktop Experience**
*   **Secure Isolation:** Frontend runs in a secure WebView, communicating with the Python backend via verified local HTTP.

**System Architecture Flowchart:**
*(Place this diagram below the solution points)*

```mermaid
graph TD
    User[User / Admin] -->|Uploads PDF| Frontend[Tauri Frontend\n(React + Vite)]
    Frontend -->|Send File| Backend[Python Sidecar\n(Flask Engine)]
    
    subgraph Core Logic
        Backend -->|Extract Data| Parser[PDF Parser\n(pdfplumber)]
        Parser -->|Clean Data| DB[(SQLite Database)]
        DB -->|Fetch Students| SnakeAlgo[Vertical Snake\nAlgorithm]
        SnakeAlgo -->|Allocate Seats| DB
    end
    
    Backend -->|Return Status| Frontend
    SnakeAlgo -->|Generate Layout| Excel[Excel / PDF Report]
    Excel -->|Download| User
```

---

## Slide 5: Methodology & Algorithm

**Technical Workflow:**

1.  **Data Ingestion (ETL Layer)**
    *   **Process:** Extracts unstructured data from PDFs; validates student metadata and subject codes.

2.  **Infrastructure Mapping**
    *   **Configuration:** Digital modeling of physical halls (Blocks -> Halls -> Rows x Columns).

3.  **Vertical Snake Engine (Logic Layer)**
    *   **Algorithm:** Serpentine filling (Odd Cols: Top-Down | Even Cols: Bottom-Up).
    *   **Security:** Physically disrupts lines of sight.

**Vertical Snake Logic Flowchart:**
*(Place this diagram to visualize the core algorithm)*

```mermaid
graph TD
    Start([Start Allocation]) --> GetHall[Get Hall Dimensions\n(Rows x Cols)]
    GetHall --> GetStudents[Fetch Students Grouped\nby Subject (A, B)]
    
    subgraph "Column Traversal Loop"
        ColCheck{Is Column\nOdd or Even?}
        
        ColCheck -->|Odd Column| FillDown[Fill Top -> Bottom]
        ColCheck -->|Even Column| FillUp[Fill Bottom -> Top]
        
        FillDown -->|Next Seat| SeatCheck{Is Seat\nOccupied?}
        FillUp -->|Next Seat| SeatCheck
        
        SeatCheck -->|No| PlaceStudent[Place Student\n(Interleave Logic)]
        SeatCheck -->|Yes| Skip[Skip Seat]
    end
    
    PlaceStudent --> CheckMore{More Students?}
    CheckMore -->|Yes| NextCol[Move to Next Column]
    NextCol --> ColCheck
    CheckMore -->|No| Finish([End Allocation])
```

---

## Slide 6: Conclusion

**Summary:**
*   **Efficient:** Reduces planning time from days to minutes.
*   **Secure:** Offline-first architecture ensures data privacy.
*   **Scalable:** Handles thousands of students with ease.
*   **Maintainable:** Automated CI/CD pipeline ensures easy updates and rapid iteration.

**Thank You!**
*   **Q & A**
