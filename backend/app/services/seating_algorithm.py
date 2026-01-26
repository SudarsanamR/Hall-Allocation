"""
Seating Algorithm Implementation

CRITICAL LOGIC:
- Active Pair Strategy (Subject Mixing): Limits mixing to 2 subjects at a time.
- Internal Department Mixing: Within each Subject Group, students are Round-Robin mixed by Department.
    - Ensures that if Subject A (95%) fills the hall, A(CSE) sits next to A(IT) etc.
- Fills Hall using Vertical Snake Pattern.
- Intelligent Spacers: Used if Department Mixing also fails (same dept, same subject).
- Conflict Fallback: Allowed if packed.
"""
from typing import List, Dict, Set, Tuple, Optional
from collections import defaultdict
from app.models import Hall, Student, Seat, HallSeating, StudentAllocation, SeatingResult

def allocate_seats(students: List[Student], halls: List[Hall]) -> SeatingResult:
    """
    Main seating allocation function using Active Pair with Dept Mixing
    """
    if not students:
        raise ValueError("No students to allocate")
    
    if not halls:
        raise ValueError("No halls available")
    
    total_capacity = sum(h.capacity for h in halls)
    
    sorted_students = sorted(students, key=lambda s: s.registerNumber)
    
    # 1. Group by Subject
    unique_subjects = set(s.subjectCode for s in sorted_students)
    group_key = 'subject' if len(unique_subjects) > 1 else 'department'
    
    if group_key == 'subject':
        # Primary Grouping by Subject
        subject_groups = _group_by_subject(sorted_students)
        
        # 2. INTERNAL MIXING: Sort each Subject Group by Department (Round Robin)
        # This solves the "95% same subject" issue by verifying neighbors are diff dept.
        mixed_subject_groups = {}
        for subj, subj_students in subject_groups.items():
            mixed_subject_groups[subj] = _mix_by_department(subj_students)
            
        groups_dict = mixed_subject_groups
    else:
        # If input is already single subject, we just group by department directly
        groups_dict = _group_by_department(sorted_students)
        
    # Create Queue using Active Pair Strategy
    allocation_queue = _generate_pair_interleaved_queue(groups_dict, total_capacity, group_key)
    
    # Allocate to halls
    hall_seatings = []
    student_allocations = []
    
    current_idx = 0
    total_items = len(allocation_queue)
    
    for hall in halls:
        if current_idx >= total_items:
            break
            
        remaining_items = allocation_queue[current_idx:]
        grid, consumed_count, valid_student_count = _fill_hall_snake(hall, remaining_items, group_key)
        
        current_idx += consumed_count
        
        hall_seating = HallSeating(
            hall=hall,
            grid=grid,
            studentsCount=valid_student_count
        )
        hall_seatings.append(hall_seating)
        
        for r_idx, row in enumerate(grid):
            for c_idx, seat in enumerate(row):
                # Vertical Snake Numbering Logic (Apply to ALL seats)
                rows_in_hall = hall.rows
                if c_idx % 2 == 0:
                    # Even column: Top -> Bottom (e.g. 1 to rows)
                    num = (c_idx * rows_in_hall) + r_idx + 1
                else:
                    # Odd column: Bottom -> Top
                    num = (c_idx * rows_in_hall) + (rows_in_hall - r_idx)
                
                # Assign seat number to Seat object
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
    
    return SeatingResult(
        halls=hall_seatings,
        studentAllocation=student_allocations,
        totalStudents=len(sorted_students),
        hallsUsed=len(hall_seatings)
    )

def _group_by_subject(students: List[Student]) -> Dict[str, List[Student]]:
    groups = defaultdict(list)
    for student in students:
        groups[student.subjectCode].append(student)
    return dict(groups)

def _group_by_department(students: List[Student]) -> Dict[str, List[Student]]:
    groups = defaultdict(list)
    for student in students:
        groups[student.department].append(student)
    return dict(groups)

def _mix_by_department(students: List[Student]) -> List[Student]:
    """
    Takes a list of students (same subject), groups them by department,
    and round-robins them to ensure Department diversity.
    Input: [CSE, CSE, IT, IT]
    Output: [CSE, IT, CSE, IT]
    """
    dept_map = defaultdict(list)
    for s in students:
        dept_map[s.department].append(s)
        
    # Round robin mix
    subgroups = list(dept_map.values())
    mixed = []
    
    pointers = [0] * len(subgroups)
    lengths = [len(g) for g in subgroups]
    max_len = max(lengths) if lengths else 0
    
    for i in range(max_len):
        for g_idx, group in enumerate(subgroups):
            if pointers[g_idx] < lengths[g_idx]:
                mixed.append(group[pointers[g_idx]])
                pointers[g_idx] += 1
                
    return mixed

def _generate_pair_interleaved_queue(
    groups: Dict[str, List[Student]], 
    total_capacity: int,
    group_key: str
) -> List[Optional[Student]]:
    """
    Active Pair mixing.
    """
    queue: List[Optional[Student]] = []
    
    # Sort groups by size desc
    sorted_groups = sorted(groups.items(), key=lambda x: len(x[1]), reverse=True)
    
    pool = []
    for k, s_list in sorted_groups:
        pool.append({'key': k, 'students': list(s_list), 'idx': 0})
        
    active_a = pool.pop(0) if pool else None
    active_b = pool.pop(0) if pool else None
    
    total_students = sum(len(g) for g in groups.values())
    processed_count = 0
    
    while active_a or active_b:
        # 1. Process Active A
        if active_a:
            if active_a['idx'] < len(active_a['students']):
                student = active_a['students'][active_a['idx']]
                _try_insert_spacer(queue, student, total_capacity, total_students, processed_count, group_key)
                queue.append(student)
                active_a['idx'] += 1
                processed_count += 1
            
            if active_a['idx'] >= len(active_a['students']):
                active_a = pool.pop(0) if pool else None
        
        # 2. Process Active B
        if active_b:
            if active_b['idx'] < len(active_b['students']):
                student = active_b['students'][active_b['idx']]
                _try_insert_spacer(queue, student, total_capacity, total_students, processed_count, group_key)
                queue.append(student)
                active_b['idx'] += 1
                processed_count += 1
            
            if active_b['idx'] >= len(active_b['students']):
                active_b = pool.pop(0) if pool else None
                
    return queue

def _try_insert_spacer(
    queue: List[Optional[Student]], 
    next_student: Student, 
    total_capacity: int, 
    total_students: int, 
    processed_count: int,
    group_key: str
):
    if not queue:
        return
    last_item = queue[-1]
    if last_item is None:
        return
    
    # If Group Key is Subject, we primarily separate by Subject.
    # BUT user requirement: If Same Subject, check Department!
    
    last_sub = last_item.subjectCode
    curr_sub = next_student.subjectCode
    
    last_dept = last_item.department
    curr_dept = next_student.department
    
    conflict = False
    
    if group_key == 'subject':
        # Primary Conflict: Same Subject
        if last_sub == curr_sub:
            # Secondary Check: Are Depts also same?
            # User wants "nearby student should be other department".
            # So if Subject Same AND Dept Same -> HARD CONFLICT.
            if last_dept == curr_dept:
                conflict = True
            else:
                # Same Subject, Diff Dept -> Allowed by user ("can be seated in same hall").
                # So NO spacer needed here.
                conflict = False
    else:
        # Single Subject case
        if last_dept == curr_dept:
            conflict = True
            
    if conflict:
        remaining_students = total_students - processed_count
        current_len = len(queue)
        if (current_len + remaining_students + 1) <= total_capacity:
            queue.append(None)

def _fill_hall_snake(
    hall: Hall,
    items: List[Optional[Student]],
    group_key: str
) -> Tuple[List[List[Seat]], int, int]:
    rows = hall.rows
    cols = hall.columns
    grid = [[Seat(row=r, col=c) for c in range(cols)] for r in range(rows)]
    
    item_idx = 0
    total_items = len(items)
    valid_count = 0
    
    for c in range(cols):
        if c % 2 == 0:
            row_iter = range(rows)
        else:
            row_iter = range(rows - 1, -1, -1)
            
        for r in row_iter:
            if item_idx < total_items:
                item = items[item_idx]
                if item:
                    seat = grid[r][c]
                    seat.student = item
                    seat.subject = item.subjectCode if group_key == 'subject' else None
                    seat.department = item.department if group_key == 'department' else None
                    valid_count += 1
                item_idx += 1
            else:
                return grid, item_idx, valid_count

    return grid, item_idx, valid_count

def validate_no_adjacent_conflict(grid: List[List[Seat]], group_key: str) -> bool:
    rows = len(grid)
    cols = len(grid[0]) if rows > 0 else 0
    for row in range(rows):
        for col in range(cols):
            if not grid[row][col].student: continue
            current_key = (grid[row][col].subject if group_key == 'subject' else grid[row][col].department)
            adjacents = [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]
            for adj_row, adj_col in adjacents:
                if 0 <= adj_row < rows and 0 <= adj_col < cols:
                    adj_seat = grid[adj_row][adj_col]
                    if adj_seat.student:
                        adj_key = (adj_seat.subject if group_key == 'subject' else adj_seat.department)
                        if current_key == adj_key:
                            return False
    return True
