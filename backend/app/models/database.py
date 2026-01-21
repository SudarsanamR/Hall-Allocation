"""
Data models and in-memory storage
"""
from typing import List, Dict, Optional
from dataclasses import dataclass, field
import uuid

@dataclass
class Hall:
    id: str
    name: str
    block: str
    rows: int
    columns: int
    capacity: int

@dataclass
class Student:
    registerNumber: str
    subjectCode: str
    department: str
    examDate: str
    session: str  # 'FN' or 'AN'

@dataclass
class Seat:
    row: int
    col: int
    student: Optional[Student] = None
    subject: Optional[str] = None
    department: Optional[str] = None

@dataclass
class HallSeating:
    hall: Hall
    grid: List[List[Seat]]
    studentsCount: int

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
    halls: List[HallSeating]
    studentAllocation: List[StudentAllocation]
    totalStudents: int
    hallsUsed: int

class Database:
    """In-memory database"""
    def __init__(self):
        self.halls: List[Hall] = []
        self.students: List[Student] = []
        # Changed from single result to dictionary keyed by session ID
        self.seating_results: Dict[str, SeatingResult] = {}
        self.initialize_default_halls()

    def initialize_default_halls(self):
        """Initialize default halls"""
        # Avoid circular imports if reusing from routes, defining here for robustness
        # Actually better to import or move the constant, but to fix immediately:
        default_halls_data = [
            {'name': 'I1', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
            {'name': 'I2', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
            {'name': 'I5', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
            {'name': 'I6', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
            {'name': 'I7', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
            {'name': 'I8', 'block': 'Maths / 1st Year Block', 'rows': 5, 'columns': 5},
            {'name': 'T1', 'block': 'Civil Block', 'rows': 5, 'columns': 5},
            {'name': 'T2', 'block': 'Civil Block', 'rows': 5, 'columns': 5},
            {'name': 'T3', 'block': 'Civil Block', 'rows': 5, 'columns': 5},
            {'name': 'T6A', 'block': 'Civil Block', 'rows': 5, 'columns': 5},
            {'name': 'T6B', 'block': 'Civil Block', 'rows': 5, 'columns': 5},
            {'name': 'EEE1', 'block': 'EEE Block', 'rows': 5, 'columns': 5},
            {'name': 'EEE2', 'block': 'EEE Block', 'rows': 5, 'columns': 5},
            {'name': 'CT10', 'block': 'ECE Block', 'rows': 5, 'columns': 5},
            {'name': 'CT11', 'block': 'ECE Block', 'rows': 5, 'columns': 5},
            {'name': 'CT12', 'block': 'ECE Block', 'rows': 5, 'columns': 5},
            {'name': 'M2', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
            {'name': 'M3', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
            {'name': 'M6', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
            {'name': 'AH1', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
            {'name': 'AH2', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
            {'name': 'AH3', 'block': 'Mech Block', 'rows': 5, 'columns': 5},
            {'name': 'A4', 'block': 'Auto Block', 'rows': 5, 'columns': 5},
            {'name': 'AUD1', 'block': 'Auditorium', 'rows': 5, 'columns': 5},
            {'name': 'AUD2', 'block': 'Auditorium', 'rows': 5, 'columns': 5},
            {'name': 'AUD3', 'block': 'Auditorium', 'rows': 5, 'columns': 5},
            {'name': 'AUD4', 'block': 'Auditorium', 'rows': 5, 'columns': 5},
        ]
        
        self.halls = []
        for h in default_halls_data:
            self.halls.append(Hall(
                id=str(uuid.uuid4()),
                name=h['name'],
                block=h['block'],
                rows=h['rows'],
                columns=h['columns'],
                capacity=h['rows'] * h['columns']
            )) 
    
    def reset_halls(self):
        """Reset halls to default configuration"""
        self.halls = []
    
    def reset_students(self):
        """Reset student data"""
        self.students = []
        self.seating_results = {}

# Global database instance
db = Database()
