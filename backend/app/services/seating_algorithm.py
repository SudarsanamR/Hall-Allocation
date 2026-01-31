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

# --- CONFIGURATION ---
DRAWING_SUBJECT_CODES = {
    "AU3501", "ME3491", "GE3251", 
    "PR8451", "ME8492", "ME8594", "GE8152", "ME25C01"
}

DRAWING_HALL_NAMES = {
    "AH1", "AH2", "AH3", "T6A", "T6B", "AUD1", "AUD2", "AUD3", "AUD4"
}

PRIORITY_SUBJECT_CODES = {
    "ME3591", "ME3691", "ME3391", "ME3491", "ME3451", "CME384", "GE3251", "CME385", "MA3251", 
    "ST25120", "ST25103", "CE3601", "CE3501", "CE3405", "CE3403", "ST4201", "ST4102", 
    "AU3301", "AU3701", "AU3501", "ST4202", "ST4091", "ME8651", "ME8792", "ME8071", 
    "ME8493", "ME8693", "ME8492", "ME8391", "ME8593", "MA8452", "ME8594", "GE8152", 
    "CE8601", "CE8501", "CE8404", "CE8604", "CE8703", "AT8503", "AT8602", "AT8601", "PR8451"
}

def allocate_session_strict(students: List[Student], halls: List[Hall]) -> SeatingResult:
    """
    Wrapper around allocate_seats that enforces strict separation:
    - Drawing Subjects -> ONLY in Drawing Halls.
    - Regular Subjects -> ONLY in Regular Halls.
    """
    
    # 1. Split Students
    drawing_students = []
    regular_students = []
    
    for s in students:
        # Check if subject code matches (case-insensitive just in case, though usually exact)
        if s.subjectCode.strip().upper() in DRAWING_SUBJECT_CODES:
            drawing_students.append(s)
        else:
            regular_students.append(s)
            
    # 2. Split Halls
    drawing_halls = []
    regular_halls = []
    
    for h in halls:
        if h.name.strip() in DRAWING_HALL_NAMES:
            drawing_halls.append(h)
        else:
            regular_halls.append(h)
            
    # 3. Allocations
    # Sort Halls: Ground Floor First
    # Assuming 'is_ground_floor' attribute exists (added to Model)
    # We sort strictly: True < False is wrong? Sort key True(1) vs False(0). Reverse=True puts True first.
    # Or key=lambda x: not x.is_ground_floor (False < True) -> Ground Floor First
    
    def hall_sort_key(h):
        return (not getattr(h, 'is_ground_floor', False), h.name)

    drawing_halls.sort(key=hall_sort_key)
    regular_halls.sort(key=hall_sort_key)

    # Setup results containers
    combined_halls = []
    combined_allocations = []
    total_students_processed = 0
    halls_used_count = 0
    
    # Helper to merge result
    def merge_result(res: SeatingResult):
        if not res: return
        nonlocal total_students_processed, halls_used_count
        combined_halls.extend(res.halls)
        combined_allocations.extend(res.studentAllocation)
        total_students_processed += res.totalStudents
        halls_used_count += res.hallsUsed

    # A. Allocate Drawing (Strict)
    if drawing_students:
        if not drawing_halls:
           # Fallback or Error? 
           # Requirement: "only allocated to [Drawing Halls]"
           # If no drawing halls, we can't allocate them properly under strict rules.
           # However, raising error might block entire session. 
           # Let's try to allocate but it will likely fail if we pass empty list.
           # Better approach: Try to allocate, if no halls, these students are unallocated (or handled graciously).
           print(f"WARNING: {len(drawing_students)} drawing students found but no Drawing Halls available!")
        else:
            try:
                res_drawing = allocate_seats(drawing_students, drawing_halls)
                merge_result(res_drawing)
            except ValueError as e:
                print(f"Error allocating drawing students: {e}")

    # B. Allocate Regular
    if regular_students:
        if not regular_halls:
            print(f"WARNING: {len(regular_students)} regular students found but no Regular Halls available!")
            # OPTIONAL: Allow regular students to spill into Drawing Halls if space permits?
            # User said: "Drawing subject students should ONLY be allocated to..."
            # Does not explicitly say "Regular students cannot use Drawing Halls".
            # Usually we use remaining space.
            # For now, let's keep them separate as per 'Strict' implied naming.
        else:
             try:
                res_regular = allocate_seats(regular_students, regular_halls)
                merge_result(res_regular)
             except ValueError as e:
                print(f"Error allocating regular students: {e}")

    return SeatingResult(
        halls=combined_halls,
        studentAllocation=combined_allocations,
        totalStudents=total_students_processed,
        hallsUsed=halls_used_count
    )

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
        is_prio = s.subjectCode.strip().upper() in PRIORITY_SUBJECT_CODES
        is_physically_challenged = getattr(s, 'is_physically_challenged', False)
        
        # Sort key: (NOT Physically Challenged, NOT Priority, Department, Subject, RegNo)
        # 1. Physical Challenge: True (First) -> Not True = False (0).
        # 2. Priority: True (First) -> Not True = False (0).
        
        reg_val = reg
        if reg.isdigit():
            reg_val = int(reg)
            
        return (not is_physically_challenged, not is_prio, s.department, s.subjectCode, reg_val)

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
    
    total_halls = len(halls)
    for i, hall in enumerate(halls):
        # Check if we have students left
        remaining = sum(len(g) for g in available_groups.values())
        if remaining == 0:
            break

        # Calculate Future Capacity (seats in subsequent halls)
        # This allows us to push students to next halls if we need spacers here.
        future_capacity = sum(h.capacity for h in halls[i+1:])

        # Generate Queue for this hall
        if use_spacers:
            queue = _build_spacer_queue(available_groups, hall.capacity)
        else:
            queue = _build_mixing_queue(available_groups, hall, future_capacity)

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
    hall: Hall,
    future_capacity: int = 0
) -> List[Optional[Student]]:
    """
    Mixing Mode:
    - Pick 2 groups based on defined priority (Alphabetical).
    - Start with the LARGER of the two.
    - Strictly alternate.
    - If one depletes, replace with next available group (Alphabetical).
    - TAIL LOGIC: If only 1 group remains, try to space intelligently using Global Capacity.
    """
    queue = []
    capacity = hall.capacity
    rows = hall.rows
    cols = hall.columns
    
    # Helper to get keys sorted dynamically
    def get_sorted_keys():
        # Filter active groups
        active_keys = [k for k in groups if groups[k]]
        
        def priority_sort_key(k):
            # Check if next student is Priority
            next_student = groups[k][0]
            is_prio = next_student.subjectCode.strip().upper() in PRIORITY_SUBJECT_CODES
            is_physically_challenged = getattr(next_student, 'is_physically_challenged', False)
            
            # Sort: 
            # 1. Physically Challenged (False < True) -> Use (not is_ph)
            # 2. Priority Subject (False < True) -> Use (not is_prio)
            # 3. Alphabetical Key
            return (not is_physically_challenged, not is_prio, k)
            
        return sorted(active_keys, key=priority_sort_key)

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
    
    # Helper: Get coords for an index
    def get_coords(idx):
        if idx < 0: return None
        # Simplified Snake Logic
        c = idx // rows
        if c >= cols: return None
        r_step = idx % rows
        if c % 2 == 0: # Down
            r = r_step
        else: # Up
            r = rows - 1 - r_step
        return (r, c)
        
    # Helper: Check potential conflict
    def check_conflict(idx, subject_code, dept_code):
        r, c = get_coords(idx)
        # Check Neighbors in Queue
        
        # Optimization: We check "Predecessors"
        # 1. Previous in Sequence (idx-1). (Vertical neighbor)
        # 2. Horizontal Neighbor (Same row, prev col).
        
        # Vertical Neighbor: Always idx-1.
        prev_idx = idx - 1
        if prev_idx >= 0 and queue[prev_idx]:
             s = queue[prev_idx]
             if s.subjectCode == subject_code or s.department == dept_code:
                 # Check if they are physically adjacent
                 pr, pc = get_coords(prev_idx)
                 if abs(pr - r) + abs(pc - c) == 1:
                     return True
                     
        # Horizontal Neighbor (Previous Col)
        # (r, c-1)
        if c > 0:
            # Need to find index of (r, c-1)
            # Col c-1. 
            target_c = c - 1
            if target_c % 2 == 0:
                target_idx = (target_c * rows) + r
            else:
                target_idx = (target_c * rows) + (rows - 1 - r)
            
            if 0 <= target_idx < len(queue):
                s = queue[target_idx]
                if s and (s.subjectCode == subject_code or s.department == dept_code):
                    return True
                    
        return False

    while len(queue) < capacity:
        # 1. Identify Target Group
        target_key = None
        if turn == 'A':
            target_key = key_a
        else:
            target_key = key_b
            
        if target_key is None or target_key not in groups:
           if key_a and key_a in groups: target_key = key_a
           elif key_b and key_b in groups: target_key = key_b
           else: break 
        
        # 2. Pop Student
        student = None
        if target_key and groups.get(target_key):
            # Peek first 
            student_candidate = groups[target_key][0]
            
            # --- SMART TAIL SPACING CHECK ---
            # If this is the LAST group, try to insert spacer if conflict detected
            active_keys = [k for k in groups if groups[k]]
            if len(active_keys) <= 1:
                # Check for conflict at current position
                current_idx = len(queue)
                if check_conflict(current_idx, student_candidate.subjectCode, student_candidate.department):
                    # CONFLICT DETECTED!
                    
                    # GLOBAL BALANCING CHECK:
                    # Can we afford to use a seat here for a spacer?
                    # Yes, IF (Remaining Local Space + Future Space) > Remaining Students
                    
                    local_space = capacity - len(queue)
                    remaining_demand = sum(len(g) for g in groups.values())
                    total_available_space = local_space + future_capacity
                    
                    if total_available_space > remaining_demand: 
                        # We have wiggle room. Insert spacer.
                        queue.append(None)
                        # Loop again to try placing student at new position
                        continue 
            # -------------------------------
            
            student = groups[target_key].pop(0)
            
            # Check depletion
            if not groups[target_key]:
                del groups[target_key]
                new_keys = get_sorted_keys()
                other_active = key_b if target_key == key_a else key_a
                replacement = None
                for k in new_keys:
                    if k != other_active:
                        replacement = k
                        break
                if target_key == key_a: key_a = replacement
                else: key_b = replacement
                    
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
                            return False
    return True

def get_snake_seat_number(row: int, col: int, total_rows: int) -> int:
    """
    Calculate seat number based on Vertical Snake pattern.
    Col 0 (Down): 1, 2, 3...
    Col 1 (Up): 2R, ..., R+1
    """
    if col % 2 == 0:
        # Down
        return (col * total_rows) + row + 1
    else:
        # Up
        return (col * total_rows) + (total_rows - row)
