from app.extensions import db
from datetime import datetime

class Hall(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    block = db.Column(db.String(50), nullable=False)
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
            'priority': self.priority
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
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='admin', nullable=False) # 'super_admin' or 'admin'
    is_verified = db.Column(db.Boolean, default=False)
    security_question = db.Column(db.String(255), nullable=True) # Null for super_admin initially if not set
    security_answer_hash = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=True) # Nullable if admin deleted
    admin = db.relationship('Admin', backref=db.backref('logs', lazy=True))
    action = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'admin_id': self.admin_id,
            'admin_username': self.admin.username if self.admin else 'Unknown/Deleted',
            'action': self.action,
            'details': self.details,
            'timestamp': self.timestamp.isoformat() + 'Z'  # Append Z to indicate UTC
        }
