import axios from 'axios';
import type { Hall, Student, UploadFileResponse, SeatingResult, HallFormData } from '../types';

// Localhost-only API URL (Tauri desktop app - offline mode)
const API_BASE_URL = 'http://127.0.0.1:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Suppress network error toast during backend startup (sidecar takes 3-5s to boot)
let startupGracePeriod = true;
setTimeout(() => { startupGracePeriod = false; }, 30000); // 30s grace for slower machines

// Interceptors
api.interceptors.response.use(
    (response) => {
        startupGracePeriod = false; // Backend is up, end grace period immediately
        window.dispatchEvent(new CustomEvent('network:success'));
        return response;
    },
    async (error) => {
        // Network error (server down, etc.)
        if (!error.response && !startupGracePeriod) {
            window.dispatchEvent(new CustomEvent('network:error', {
                detail: { message: 'Unable to connect to the local server. Please restart the application.' }
            }));
        }
        return Promise.reject(error);
    }
);

// File Upload
export const uploadFile = async (file: File): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
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
    const response = await api.get('/sessions');
    return response.data;
};

export const clearAllocations = async (): Promise<void> => {
    await api.delete('/clear');
};

export const getSessionSeating = async (session: string): Promise<SeatingResult> => {
    const response = await api.get(`/seating/${encodeURIComponent(session)}`);
    return response.data;
};

// Universal Download Helper (Tauri native save + fallback)
const handleFileDownload = async (blob: Blob, defaultFilename: string) => {
    try {
        // @ts-ignore
        if (window.__TAURI_INTERNALS__) {
            const { save } = await import('@tauri-apps/plugin-dialog');
            const { writeFile } = await import('@tauri-apps/plugin-fs');
            
            const extParts = defaultFilename.split('.');
            const extension = extParts.length > 1 ? extParts.pop()! : '*';

            const filePath = await save({
                defaultPath: defaultFilename,
                filters: [{
                    name: extension.toUpperCase() + ' File',
                    extensions: [extension]
                }]
            });

            if (filePath) {
                const arrayBuffer = await blob.arrayBuffer();
                await writeFile(filePath, new Uint8Array(arrayBuffer));
            }
            return;
        }
    } catch (e) {
        console.warn("Tauri native save failed, trying browser download", e);
    }

    // Fallback to browser
    const href = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
};

// Download Excel
export const downloadHallWiseExcel = async (session?: string): Promise<void> => {
    const url = session
        ? `/download/hall-wise?session=${encodeURIComponent(session)}`
        : `/download/hall-wise`;

    try {
        const response = await api.get(url, { responseType: 'blob' });
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'Hall_Sketch.xlsx';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length === 2)
                filename = fileNameMatch[1];
        }

        await handleFileDownload(response.data, filename);
    } catch (error) {
        console.error("Download failed", error);
        throw error;
    }
};

export const downloadStudentWiseExcel = async (session?: string): Promise<void> => {
    const url = session
        ? `/download/student-wise?session=${encodeURIComponent(session)}`
        : `/download/student-wise`;

    try {
        const response = await api.get(url, { responseType: 'blob' });
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'Student_Allocation.xlsx';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length === 2)
                filename = fileNameMatch[1];
        }

        await handleFileDownload(response.data, filename);
    } catch (error) {
        console.error("Download failed", error);
        throw error;
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

// Subject Configuration
export interface SubjectConfig {
    subject_code: string;
    is_default: boolean;
}

export interface SubjectConfigsResponse {
    success: boolean;
    priority_subjects: SubjectConfig[];
    drawing_subjects: SubjectConfig[];
}

export const getSubjectConfigs = async (): Promise<SubjectConfigsResponse> => {
    const response = await api.get('/config/subjects');
    return response.data;
};

export const addSubjectConfig = async (type: 'priority' | 'drawing', subject_code: string): Promise<void> => {
    await api.post('/config/subjects', { type, subject_code });
};

export const deleteSubjectConfig = async (type: 'priority' | 'drawing', subject_code: string): Promise<void> => {
    await api.delete(`/config/subjects/${subject_code}`, { params: { type } });
};

// Export Allocations as JSON (for student web viewer)
// Health check for backend readiness
export const healthCheck = async (): Promise<boolean> => {
    try {
        const response = await api.get('/health');
        return response.data?.status === 'ok';
    } catch {
        return false;
    }
};

export const exportAllocationsJSON = async (): Promise<void> => {
    try {
        const response = await api.get('/export/allocations');
        const data = response.data;

        // Create and download JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const defaultFilename = `seat_allocations_${new Date().toISOString().split('T')[0]}.json`;
        
        await handleFileDownload(blob, defaultFilename);
    } catch (error) {
        console.error("Export failed", error);
        throw error;
    }
};
