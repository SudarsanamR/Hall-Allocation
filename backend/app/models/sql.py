"""
SQL Models — Offline Desktop Mode
Admin and AuditLog models removed (no auth system).
Actions are logged to file via logging_config.py.
"""
from app.extensions import db
from datetime import datetime


class Hall(db.Model):
    __tablename__ = 'halls'
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    block = db.Column(db.String(100), nullable=False)
    rows = db.Column(db.Integer, nullable=False)
    columns = db.Column(db.Integer, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    priority = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'block': self.block,
            'rows': self.rows,
            'columns': self.columns,
            'capacity': self.capacity,
            'priority': self.priority,
        }


class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    register_number = db.Column(db.String(20), nullable=False)  # Not unique — may appear in multiple sessions
    subject_code = db.Column(db.String(20), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    exam_date = db.Column(db.String(20), nullable=False)
    session = db.Column(db.String(5), nullable=False)  # FN or AN
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Allocation(db.Model):
    __tablename__ = 'allocations'
    id = db.Column(db.Integer, primary_key=True)
    register_number = db.Column(db.String(20), nullable=False)
    department = db.Column(db.String(50))
    subject_code = db.Column(db.String(20))
    hall_name = db.Column(db.String(50), nullable=False)
    row_num = db.Column(db.Integer, nullable=False)
    col_num = db.Column(db.Integer, nullable=False)
    seat_number = db.Column(db.String(10))
    session_key = db.Column(db.String(30), nullable=False)  # e.g., "25-05-2024_FN"


class SubjectConfig(db.Model):
    __tablename__ = 'subject_configs'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False)  # "priority" or "drawing"
    subject_code = db.Column(db.String(20), nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'subject_code': self.subject_code,
            'is_default': self.is_default,
        }
