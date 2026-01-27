"""
Seating Algorithm Implementation

LOGIC:
1. Grouping:
   - Default: Group by DEPARTMENT.
   - Exception: If Single Department, Group by SUBJECT.

2. Mode Selection:
   - SPACER MODE: Used if (Unique Subjects == 1) AND (Total Capacity >= 2 * Total Students).
     - Strategy: Fill sequentially (Group A, then B...) but insert Empty Seat after every student.
   - MIXING MODE: Used otherwise.
     - Strategy: Pick pairs (Alphabetical), Start with Largest, Interleave A-B-A-B.
     - Depletion: If 'A' runs out, immediately replace with next largest group 'C'.

3. Filling Pattern:
   - Vertical Snake: Col 0 (Down), Col 1 (Up), Col 2 (Down)...

4. Sorting:
   - Students are sorted naturally by Register Number (1, 2, ... 10) to ensure consistent Snake filling order.
"""
from typing import List, Dict, Tuple, Optional
from collections import defaultdict
from app.models import Hall, Student, Seat, HallSeating, StudentAllocation, SeatingResult

def allocate_seats(students: List[Student], halls: List[Hall]) -> SeatingResult:
    """Main allocation function."""
    if not students:
        raise ValueError("No students to allocate")
    if not halls:
        raise ValueError("No halls available")

    # Sort master list for consistency
    # Use valid natural sort for register numbers (try int, fallback to str)
    def natural_key(s: Student):
        reg = s.registerNumber.strip()
        # Try to convert to int for sorting if purely numeric
        if reg.isdigit():
            return (s.department, s.subjectCode, int(reg))
        return (s.department, s.subjectCode, reg)

    sorted_students = sorted(students, key=natural_key)

    # --- 1. Determine Grouping Strategy ---
    unique_depts = set(s.department.strip() for s in sorted_students)
    unique_subjects = set(s.subjectCode.strip() for s in sorted_students)

    if len(unique_depts) > 1:
        # Multiple Departments -> Group by Department
        group_key_fn = lambda s: s.department.strip()
    else:
        # Single Department -> Group by Subject
        group_key_fn = lambda s: s.subjectCode.strip()

    # Build Groups (Mutable Lists)
    groups_dict = defaultdict(list)
    for s in sorted_students:
        groups_dict[group_key_fn(s)].append(s)
    
    # Filter empty groups
    available_groups = {k: v for k, v in groups_dict.items() if v}

    # --- 2. Determine Mode (Spacers vs Mixing) ---
    total_students = len(sorted_students)
    total_capacity = sum(h.capacity for h in halls)
    
    # Condition: Single Subject & Sufficient Space
    use_spacers = (len(unique_subjects) == 1) and (total_capacity >= total_students * 2)

    # --- 3. Allocate Hall by Hall ---
    hall_seatings = []
    student_allocations = []
    
    for hall in halls:
        # Check if we have students left
        remaining = sum(len(g) for g in available_groups.values())
        if remaining == 0:
            break

        # Generate Queue for this hall
        if use_spacers:
            queue = _build_spacer_queue(available_groups, hall.capacity)
        else:
            queue = _build_mixing_queue(available_groups, hall.capacity)

        # Fill Grid (Snake)
        grid, valid_count = _fill_hall_snake(hall, queue)
        
        # Create Result Objects
        hall_seating = HallSeating(
            hall=hall,
            grid=grid,
            studentsCount=valid_count
        )
        hall_seatings.append(hall_seating)

        # Generate Allocations (Seat Numbers)
        for r_idx, row in enumerate(grid):
            for c_idx, seat in enumerate(row):
                # Calculate human-readable seat number
                # Vertical Snake: Col 0 (1..R), Col 1 (2R..R+1), etc.
                rows_in_hall = hall.rows
                if c_idx % 2 == 0:
                    # Down: (col * rows) + row + 1
                    num = (c_idx * rows_in_hall) + r_idx + 1
                else:
                    # Up: (col * rows) + (rows - row)
                    num = (c_idx * rows_in_hall) + (rows_in_hall - r_idx)
                
                seat.seatNumber = str(num)

                if seat.student:
                    allocation = StudentAllocation(
                        registerNumber=seat.student.registerNumber,
                        department=seat.student.department,
                        subject=seat.student.subjectCode,
                        hallName=hall.name,
                        row=r_idx,
                        col=c_idx,
                        seatNumber=str(num)
                    )
                    student_allocations.append(allocation)

    # Final Result
    return SeatingResult(
        halls=hall_seatings,
        studentAllocation=student_allocations,
        totalStudents=total_students,
        hallsUsed=len(hall_seatings)
    )


def _build_spacer_queue(
    groups: Dict[str, List[Student]], 
    capacity: int
) -> List[Optional[Student]]:
    """
    Spacer Mode:
    - Flatten groups sequentially (sorted by name).
    - Insert None after every student.
    """
    queue = []
    sorted_keys = sorted(groups.keys()) 
    
    current_key_idx = 0
    
    while len(queue) < capacity:
        if current_key_idx >= len(sorted_keys):
            break 
            
        key = sorted_keys[current_key_idx]
        group_list = groups[key]
        
        if not group_list:
            current_key_idx += 1
            continue
            
        student = group_list.pop(0)
        queue.append(student)
        
        # Add Spacer
        if len(queue) < capacity:
            queue.append(None)
            
        if not group_list:
            del groups[key]
            # Key removed, but our idx points to current key string in sorted_keys list.
            # Next iteration we should move to next key in list.
            current_key_idx += 1
            
    return queue


def _build_mixing_queue(
    groups: Dict[str, List[Student]], 
    capacity: int
) -> List[Optional[Student]]:
    """
    Mixing Mode:
    - Pick 2 groups based on defined priority (Alphabetical).
    - Start with the LARGER of the two.
    - Strictly alternate.
    - If one depletes, replace with next available group (Alphabetical).
    """
    queue = []
    
    # Helper to get keys sorted alphabetically
    def get_sorted_keys():
        return sorted([k for k, v in groups.items() if v])

    # Initialize Active Pair
    keys = get_sorted_keys()
    key_a = keys[0] if len(keys) > 0 else None
    key_b = keys[1] if len(keys) > 1 else None
    
    # Determine Starting Turn (Largest First)
    turn = 'A'
    if key_a and key_b:
        len_a = len(groups[key_a])
        len_b = len(groups[key_b])
        if len_b > len_a:
            turn = 'B'
    
    while len(queue) < capacity:
        # 1. Identify Target Group
        target_key = None
        if turn == 'A':
            target_key = key_a
        else:
            target_key = key_b
            
        # If target key is None or invalid, try to handle
        if target_key is None or target_key not in groups:
           # If one key is missing, check if we have the other
           if key_a and key_a in groups: target_key = key_a
           elif key_b and key_b in groups: target_key = key_b
           else: break # All done
        
        # 2. Pop Student
        student = None
        if target_key and groups.get(target_key):
            student = groups[target_key].pop(0)
            
            # Check depletion
            if not groups[target_key]:
                del groups[target_key]
                # Replacement Logic
                new_keys = get_sorted_keys()
                # Find first key that is NOT the other active key
                other_active = key_b if target_key == key_a else key_a
                
                replacement = None
                for k in new_keys:
                    if k != other_active:
                        replacement = k
                        break
                
                # Assign replacement
                if target_key == key_a:
                    key_a = replacement
                else:
                    key_b = replacement
                    
        # 3. Add to Queue
        if student:
            queue.append(student)
            
            # 4. Swap Turn
            turn = 'B' if turn == 'A' else 'A'
        else:
            if not any(groups.values()):
                break
            turn = 'B' if turn == 'A' else 'A'
            
    return queue

def _fill_hall_snake(
    hall: Hall, 
    items: List[Optional[Student]]
) -> Tuple[List[List[Seat]], int]:
    """
    Standard Vertical Snake Fill
    """
    rows = hall.rows
    cols = hall.columns
    grid = [[Seat(row=r, col=c) for c in range(cols)] for r in range(rows)]
    
    item_idx = 0
    valid_count = 0
    seats_filled = 0
    
    for c in range(cols):
        # Determine Row Iterator based on Snake Direction
        if c % 2 == 0:
            # Down
            row_iter = range(rows)
        else:
            # Up
            row_iter = range(rows - 1, -1, -1)
            
        for r in row_iter:
            if seats_filled >= hall.capacity:
                return grid, valid_count
                
            if item_idx < len(items):
                item = items[item_idx]
                item_idx += 1
                
                seats_filled += 1
                
                if item:
                    seat = grid[r][c]
                    seat.student = item
                    # Store Allocation Metadata
                    seat.subject = item.subjectCode
                    seat.department = item.department
                    valid_count += 1
            else:
                return grid, valid_count
                
    return grid, valid_count


def validate_no_adjacent_conflict(grid: List[List[Seat]], group_key: str) -> bool:
    """Helper: Validate conflicts (unused by core logic but good for testing)"""
    rows = len(grid)
    cols = len(grid[0]) if rows > 0 else 0
    for r in range(rows):
        for c in range(cols):
            s1 = grid[r][c]
            if not s1.student: continue
            
            # Key to check
            val1 = s1.subject if group_key == 'subject' else s1.department
            
            # Neighbors
            for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    s2 = grid[nr][nc]
                    if s2.student:
                        val2 = s2.subject if group_key == 'subject' else s2.department
                        if val1 == val2:
                            return False
    return True
