from app.extensions import db
from datetime import datetime

class Hall(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    block = db.Column(db.String(50), nullable=False)
    rows = db.Column(db.Integer, nullable=False)
    columns = db.Column(db.Integer, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'block': self.block,
            'rows': self.rows,
            'columns': self.columns,
            'capacity': self.capacity
        }

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    register_number = db.Column(db.String(20), nullable=False)
    subject_code = db.Column(db.String(20), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    exam_date = db.Column(db.String(20), nullable=False)
    session = db.Column(db.String(10), nullable=False)
    
    # Optional: Original file source or timestamp if needed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def registerNumber(self): return self.register_number
    @property
    def subjectCode(self): return self.subject_code
    @property
    def examDate(self): return self.exam_date

class Allocation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    register_number = db.Column(db.String(20), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    subject_code = db.Column(db.String(20), nullable=False)
    hall_name = db.Column(db.String(50), nullable=False)
    row_num = db.Column(db.Integer, nullable=False)
    col_num = db.Column(db.Integer, nullable=False)
    seat_number = db.Column(db.String(10), nullable=False)
    session_key = db.Column(db.String(50), nullable=False) # e.g. "25-05-2024_FN"
    
    @property
    def registerNumber(self): return self.register_number
    @property
    def subject(self): return self.subject_code
    @property
    def hallName(self): return self.hall_name
    @property
    def row(self): return self.row_num
    @property
    def col(self): return self.col_num
    @property
    def seatNumber(self): return self.seat_number

class Admin(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    security_question = db.Column(db.String(255), nullable=False)
    security_answer_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

