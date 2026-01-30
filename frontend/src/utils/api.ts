import axios from 'axios';
import type { Hall, Student, UploadFileResponse, SeatingResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://127.0.0.1:5001/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Authentication
export const login = async (password: string): Promise<boolean> => {
    try {
        const response = await api.post('/login', { password });
        return response.data.success;
    } catch {
        return false;
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
    const response = await api.get('/halls');
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

export const initializeDefaultHalls = async (): Promise<Hall[]> => {
    const response = await api.post('/halls/initialize');
    return response.data;
};

// Seating Generation
export const generateSeating = async (): Promise<{ success: boolean, sessions: string[] }> => {
    const response = await api.post('/generate');
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
