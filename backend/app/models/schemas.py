from dataclasses import dataclass, field
from typing import List, Optional, Any

@dataclass
class Seat:
    row: int
    col: int
    seatNumber: str = None
    student: Any = None # Student object (SQL Model or similar)
    subject: str = None
    department: str = None

@dataclass
class HallSeating:
    hall: Any # Hall object
    grid: List[List[Seat]]
    studentsCount: int = 0

@dataclass
class StudentAllocation:
    registerNumber: str
    department: str
    subject: str
    hallName: str
    row: int
    col: int
    seatNumber: str

@dataclass
class SeatingResult:
    totalStudents: int
    hallsUsed: int
    halls: List[HallSeating] = field(default_factory=list)
    studentAllocation: List[StudentAllocation] = field(default_factory=list)
