import axios from 'axios';
import type { Hall, Student, UploadFileResponse, SeatingResult, AdminUser, AuditLog, HallFormData } from '../types';

// Sync Requirement: Desktop should use Online Server
// If PROD -> Use Render.
// If DEV -> Use Localhost/Vite Env.

const API_BASE_URL = 'http://localhost:5001/api';
// import.meta.env.VITE_API_URL ||
// (import.meta.env.PROD
//     ? 'https://hall-allocation-7n1u.onrender.com/api'
//     : 'http://localhost:5001/api'
// );

console.log('🔌 API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true, // Important for Sessions
    headers: {
        'Content-Type': 'application/json',
    },
});

// Authentication
export const login = async (username: string, password: string): Promise<{ success: boolean; user?: AdminUser; message?: string }> => {
    try {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
};

export const logout = async (): Promise<void> => {
    await api.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<{ authenticated: boolean; user?: AdminUser }> => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch {
        return { authenticated: false };
    }
};

export const registerAdmin = async (data: any): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await api.post('/auth/register', data);
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
};

export const getSecurityQuestion = async (username: string): Promise<{ success: boolean; question?: string; message?: string }> => {
    try {
        const response = await api.post('/auth/security-task', { username });
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'User not found' };
    }
};

export const resetPassword = async (data: any): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Reset failed' };
    }
};

export const changePassword = async (data: any): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await api.post('/auth/change-password', data);
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Change failed' };
    }
};

export const updateProfile = async (data: { username?: string; current_password: string; new_password?: string }): Promise<{ success: boolean; message: string; user?: AdminUser }> => {
    try {
        const response = await api.put('/auth/update-profile', data);
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
};

// File Upload
export const uploadFile = async (file: File): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        withCredentials: true, // Added for authentication
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

// Hall Management
export const getHalls = async (): Promise<Hall[]> => {
    const response = await api.get('/halls');
    return response.data;
};

export const createHall = async (hall: Omit<Hall, 'id'>): Promise<Hall> => {
    const response = await api.post('/halls', hall);
    return response.data;
};

export const updateHall = async (id: string, hall: Partial<HallFormData>): Promise<Hall> => {
    const response = await api.put(`/halls/${id}`, hall);
    return response.data;
};

export const updateHallCapacityBulk = async (hallIds: string[], capacity: number): Promise<void> => {
    await api.post('/halls/bulk-capacity', { hallIds, capacity });
};

export const updateHallDimensionsBulk = async (hallIds: string[], rows: number, columns: number): Promise<void> => {
    await api.post('/halls/bulk-dimensions', { hallIds, rows, columns });
};

export const deleteHall = async (id: string): Promise<void> => {
    await api.delete(`/halls/${id}`);
};

export const reorderBlocks = async (newOrder: string[]): Promise<void> => {
    await api.post('/halls/reorder_blocks', newOrder);
};

export const reorderHalls = async (hallIds: string[]): Promise<void> => {
    await api.post('/halls/reorder', { hallIds });
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

export const getSessions = async (): Promise<{ success: boolean, sessions: string[] }> => {
    const response = await api.get('/sessions'); // Note: bp prefix is /api, route is /sessions. So /api/sessions. Wait, bp url_prefix is /api in seating.py? Yes.  
    return response.data;
};

export const clearAllocations = async (): Promise<void> => {
    await api.delete('/clear');
};

export const getSessionSeating = async (session: string): Promise<SeatingResult> => {
    const response = await api.get(`/seating/${encodeURIComponent(session)}`);
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
    const response = await api.get('/students');
    return response.data;
};

// Search Student Allocation
export const searchStudent = async (registerNumber: string): Promise<any> => {
    const response = await api.post('/search', { registerNumber });
    return response.data;
};
// Admin Management
export const getAdmins = async (): Promise<AdminUser[]> => {
    const response = await api.get('/admin/users');
    return response.data.users;
};

export const verifyAdmin = async (id: number): Promise<void> => {
    await api.put(`/admin/users/${id}/verify`);
};

export const deleteAdmin = async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const response = await api.get('/admin/logs');
    return response.data.logs;
};

export const clearAuditLogs = async (): Promise<void> => {
    const response = await api.delete('/admin/logs');
    return response.data;
};
