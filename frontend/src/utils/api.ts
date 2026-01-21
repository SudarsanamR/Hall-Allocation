import axios from 'axios';
import type { Hall, Student, GenerateResponse, UploadFileResponse } from '../types';

const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

export const initializeDefaultHalls = async (): Promise<Hall[]> => {
    const response = await api.post('/halls/initialize');
    return response.data;
};

// Seating Generation
export const generateSeating = async (): Promise<GenerateResponse> => {
    const response = await api.post('/generate');
    return response.data;
};

// Download Excel
export const downloadHallWiseExcel = (session?: string): void => {
    const url = session
        ? `${API_BASE_URL}/download/hall-wise?session=${encodeURIComponent(session)}`
        : `${API_BASE_URL}/download/hall-wise`;
    window.open(url, '_blank');
};

export const downloadStudentWiseExcel = (session?: string): void => {
    const url = session
        ? `${API_BASE_URL}/download/student-wise?session=${encodeURIComponent(session)}`
        : `${API_BASE_URL}/download/student-wise`;
    window.open(url, '_blank');
};

// Get current students
export const getStudents = async (): Promise<Student[]> => {
    const response = await api.get('/students');
    return response.data;
};
