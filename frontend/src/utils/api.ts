import axios from 'axios';
import type { Hall, Student, UploadFileResponse, SeatingResult } from '../types';

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__;

const CLOUD_URL = 'https://hall-allocation-7n1u.onrender.com/api';
const LOCAL_URL = 'http://127.0.0.1:5001/api';

// Logic:
// 1. If Tauri (Desktop) -> ALWAYS use Cloud URL (Remote Control Mode)
// 2. If VITE_API_URL set -> Use it
// 3. If PROD (Web Build) -> Use Cloud URL
// 4. If DEV (Local Web) -> Use Local URL
const API_BASE_URL = isTauri
    ? CLOUD_URL
    : (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? CLOUD_URL : LOCAL_URL));

console.log('API_BASE_URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Increased timeout for Render cold starts
    headers: {
        'Content-Type': 'application/json',
    },
});

// Authentication
// Authentication
// Authentication
export const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.post('/login', { username, password });
        return { success: response.data.success, message: response.data.message };
    } catch (error: any) {
        if (error.response && error.response.data) {
            return { success: false, message: error.response.data.message || 'Invalid credentials' };
        }
        return { success: false, message: 'Server connection failed' };
    }
};

export const register = async (data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.post('/register', data);
        return { success: response.data.success, message: response.data.message };
    } catch (error: any) {
        if (error.response && error.response.data) {
            return { success: false, message: error.response.data.message || 'Registration failed' };
        }
        return { success: false, message: 'Server connection failed' };
    }
};

export const getSecurityQuestion = async (username: string): Promise<{ success: boolean; question?: string; message?: string }> => {
    try {
        const response = await api.post('/get_security_question', { username });
        return { success: true, question: response.data.question };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'User not found' };
    }
};

export const resetPassword = async (data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.post('/reset_password', data);
        return { success: true, message: response.data.message };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Reset failed' };
    }
};

// File Upload
export const uploadFile = async (file: File): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

// Hall Management
export const getHalls = async (): Promise<Hall[]> => {
    const response = await api.get(`/halls?_t=${Date.now()}`);
    return response.data;
};

export const createHall = async (hall: Omit<Hall, 'id'>): Promise<Hall> => {
    const response = await api.post('/halls', hall);
    return response.data;
};

export const updateHall = async (id: string, hall: Partial<Hall>): Promise<Hall> => {
    const response = await api.put(`/halls/${id}`, hall);
    return response.data;
};

export const deleteHall = async (id: string): Promise<void> => {
    await api.delete(`/halls/${id}`);
};

export const reorderBlocks = async (newOrder: string[]): Promise<void> => {
    await api.post('/halls/reorder_blocks', newOrder);
};

export const bulkUpdateHalls = async (ids: string[], updates: { rows?: number; columns?: number; }): Promise<void> => {
    await api.post('/halls/bulk_update', { ids, updates });
};

export const initializeDefaultHalls = async (): Promise<Hall[]> => {
    const response = await api.post('/halls/initialize');
    return response.data;
};

// Seating Generation
export const generateSeating = async (): Promise<{ success: boolean, sessions: string[] }> => {
    const response = await api.post('/generate');
    return response.data;
};

export const getExistingSessions = async (): Promise<{ success: boolean, sessions: string[] }> => {
    const response = await api.get(`/sessions?_t=${Date.now()}`);
    return response.data;
};

export const clearAllocations = async (): Promise<void> => {
    await api.delete('/clear');
};

export const getSessionSeating = async (session: string): Promise<SeatingResult> => {
    const response = await api.get(`/seating/${encodeURIComponent(session)}?_t=${Date.now()}`);
    return response.data;
};

// Download Excel
import { open } from '@tauri-apps/plugin-shell';

// Download Excel
export const downloadHallWiseExcel = async (session?: string): Promise<void> => {
    const url = session
        ? `${API_BASE_URL}/download/hall-wise?session=${encodeURIComponent(session)}`
        : `${API_BASE_URL}/download/hall-wise`;

    // Check if running in Tauri
    if (window.__TAURI__) {
        await open(url);
    } else {
        window.open(url, '_blank');
    }
};

export const downloadStudentWiseExcel = async (session?: string): Promise<void> => {
    const url = session
        ? `${API_BASE_URL}/download/student-wise?session=${encodeURIComponent(session)}`
        : `${API_BASE_URL}/download/student-wise`;

    // Check if running in Tauri
    if (window.__TAURI__) {
        await open(url);
    } else {
        window.open(url, '_blank');
    }
};

// Get current students
export const getStudents = async (): Promise<Student[]> => {
    const response = await api.get(`/students?_t=${Date.now()}`);
    return response.data;
};

// Search Student Allocation
export const searchStudent = async (registerNumber: string): Promise<any> => {
    const response = await api.post('/search', { registerNumber });
    return response.data;
};

// Student Details Manager
export const searchStudentDetails = async (registerNumber: string): Promise<Student> => {
    const response = await api.post('/students/search', { registerNumber });
    return response.data;
};

export const toggleStudentDisability = async (registerNumber: string, status: boolean): Promise<any> => {
    const response = await api.put(`/students/${registerNumber}/toggle-disability`, { isPhysicallyChallenged: status });
    return response.data;
};
