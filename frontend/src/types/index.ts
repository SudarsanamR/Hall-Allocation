// Hall Configuration
export interface Hall {
    id: string;
    name: string;
    block: string;
    rows: number;
    columns: number;
    capacity: number;
    priority?: number;
}

// Student Data
export interface Student {
    registerNumber: string;
    subjectCode: string;
    department: string;
    examDate: string;
    session: 'FN' | 'AN';
}

// Seat in Grid
export interface Seat {
    row: number;
    col: number;
    student: Student | null;
    subject?: string;
    department?: string;
    seatNumber?: string;
}

// Seating Grid for a Hall
export interface HallSeating {
    hall: Hall;
    grid: Seat[][];
    studentsCount: number;
}

// Complete Seating Result
export interface SeatingResult {
    halls: HallSeating[];
    studentAllocation: StudentAllocation[];
    totalStudents: number;
    hallsUsed: number;
}

// Response from Generate API
export interface GenerateResponse {
    success: boolean;
    sessions: string[];
    results: Record<string, SeatingResult>;
}

// Student-wise Allocation
export interface StudentAllocation {
    registerNumber: string;
    name?: string;
    department: string;
    subject: string;
    hallName: string;
    row: number;
    col: number;
    seatNumber: string;
}

// API Request Types
export interface GenerateSeatingRequest {
    examDate?: string;
    session?: 'FN' | 'AN';
}

export interface UploadFileResponse {
    success: boolean;
    message: string;
    studentsCount: number;
    students: Student[];
}

// Statistics
export interface Stats {
    totalStudents: number;
    hallsUsed: number;
    sessions: number;
    departmentBreakdown?: Record<string, number>;
    subjectBreakdown?: Record<string, number>;
}

// Form Types
export interface HallFormData {
    name: string;
    block: string;
    rows: number;
    columns: number;
    capacity?: number; // Optional manual override
}

export interface AdminUser {
    id: number;
    username: string;
    role: 'super_admin' | 'admin';
    is_verified: boolean;
    created_at: string;
    last_login: string | null;
}

export interface AuditLog {
    id: number;
    admin_id: number;
    admin_username?: string;
    action: string;
    details: string;
    timestamp: string;
}
