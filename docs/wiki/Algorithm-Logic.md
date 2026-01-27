# Algorithm Logic: Vertical Snake & Conflict Avoidance

The core of this system is a robust seating algorithm designed to ensure fairness and prevent malpractice.

## The Strategy

### 1. Vertical Snake Pattern
Instead of filling seats row-by-row (standard), we use a "Vertical Snake" pattern.
*   **Column 1**: Top to Bottom
*   **Column 2**: Bottom to Top
*   **Column 3**: Top to Bottom
*   ...and so on.

**Why?** This maximizes the physical distance between sequence numbers. If Student A sits at (0,0) and Student B sits at (1,0), they are neighbors. But in vertical snake, neighbors in the *list* are placed vertically, not horizontally, which is often harder to peek at.

### 2. Active Pair Subject Mixing
To prevent students of the same subject sitting together, the algorithm doesn't just fill one subject then the next.
1.  **Group Sorting**: All subject groups are sorted by size (Descending).
2.  **Pair Selection**: The two largest groups are selected (e.g., Python (50) and Math (40)).
3.  **Interleaving**: We verify if the next seat can take a student from Group A. If yes, place A. Then we try Group B.
4.  **Result**: The queue looks like `A, B, A, B, A...` effectively separating them.

### 3. Department Round Robin
Even within a single subject (e.g., "Python"), students might come from different departments (CSE, IT, ECE).
*   The system ensures validation *within* the subject group.
*   It picks one student from CSE, then one from IT, then one from ECE, cycling through available departments.

### 4. Spacers (The Fail-Safe)
If, despite mixing, the only available student for the next seat belongs to the *same* subject and *same* department as their immediate neighbor (Left, Right, or Diagonal), the system inserts a **Spacer** (Empty Seat).
*   *Note*: Spacers are only used if the hall is not at 100% capacity. If packed, the system prioritizes filling the seat over conflict avoidance (Administrator override).
