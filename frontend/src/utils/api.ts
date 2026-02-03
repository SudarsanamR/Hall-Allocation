import axios from 'axios';
import type { Hall, Student, UploadFileResponse, SeatingResult, AdminUser, AuditLog, HallFormData, GenericResponse, AuthResponse, SecurityQuestionResponse } from '../types';

// Localhost-only API URL (Tauri desktop app - offline mode)
const API_BASE_URL = 'http://localhost:5001/api';

// Only log in development
if (import.meta.env.DEV) {
    console.log('🔌 API Base URL:', API_BASE_URL);
}

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true, // Important for Sessions
    headers: {
        'Content-Type': 'application/json',
    },
});

let csrfToken: string | null = null;

export const getCsrfToken = () => csrfToken;

export const fetchCsrfToken = async () => {
    try {
        const response = await api.get('/csrf-token');
        csrfToken = response.data.csrf_token;
        if (csrfToken) {
            api.defaults.headers.common['X-CSRFToken'] = csrfToken;
        }
        return csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
    }
};

// Interceptors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Network error (no internet, server down, etc.)
        if (!error.response) {
            // Dispatch event for components to show network status
            window.dispatchEvent(new CustomEvent('network:error', {
                detail: { message: 'Unable to connect to the local server. Please restart the application.' }
            }));
        }

        // CSRF Retry
        if (error.response?.status === 400 && error.response?.data?.message?.includes('CSRF')) {
            await fetchCsrfToken();
            if (csrfToken) {
                error.config.headers['X-CSRFToken'] = csrfToken;
                return api.request(error.config);
            }
        }

        // 401 Unauthorized - Session Expired or Invalid
        if (error.response?.status === 401) {
            // Dispatch event for AuthContext to handle (clear state, redirect)
            window.dispatchEvent(new Event('auth:unauthorized'));
            // Optionally clear storage here too as redundancy
            localStorage.removeItem('isAuthenticated');
            // Do not redirect if checking auth status (e.g. /me) to avoid infinite loops if handled gracefully
            if (!error.config.url?.endsWith('/auth/me')) {
                // The Context will handle redirect
            }
        }

        return Promise.reject(error);
    }
);

// Authentication
export const login = async (username: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>('/auth/login', { username, password });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Network error (no internet, server down, etc.)
            if (!error.response) {
                return {
                    success: false,
                    message: 'Network error: Unable to connect to the server. Please check your internet connection.'
                };
            }
            return error.response.data as AuthResponse;
        }
        return { success: false, message: 'Login failed' };
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

export const registerAdmin = async (data: any): Promise<GenericResponse> => {
    try {
        const response = await api.post<GenericResponse>('/auth/register', data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data as GenericResponse;
        }
        return { success: false, message: 'Registration failed' };
    }
};

export const getSecurityQuestion = async (username: string): Promise<SecurityQuestionResponse> => {
    try {
        const response = await api.post<SecurityQuestionResponse>('/auth/security-task', { username });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data as SecurityQuestionResponse;
        }
        return { success: false, message: 'User not found' };
    }
};

export const resetPassword = async (data: any): Promise<GenericResponse> => {
    try {
        const response = await api.post<GenericResponse>('/auth/reset-password', data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data as GenericResponse;
        }
        return { success: false, message: 'Reset failed' };
    }
};

export const changePassword = async (data: any): Promise<GenericResponse> => {
    try {
        const response = await api.post<GenericResponse>('/auth/change-password', data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data as GenericResponse;
        }
        return { success: false, message: 'Change failed' };
    }
};

export const updateProfile = async (data: { username?: string; current_password: string; new_password?: string }): Promise<AuthResponse> => {
    try {
        const response = await api.put<AuthResponse>('/auth/update-profile', data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data as AuthResponse;
        }
        return { success: false, message: 'Update failed' };
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
            'X-CSRFToken': csrfToken,
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
// Download Excel
export const downloadHallWiseExcel = async (session?: string): Promise<void> => {
    const url = session
        ? `/download/hall-wise?session=${encodeURIComponent(session)}`
        : `/download/hall-wise`;

    try {
        const response = await api.get(url, { responseType: 'blob' });

        // Create blob link to download
        const href = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = href;

        // Extract filename from header or default
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'Hall_Sketch.xlsx';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length === 2)
                filename = fileNameMatch[1];
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(href);
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
        // Use api instance which has credentials
        const response = await api.get(url, { responseType: 'blob' });

        const href = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = href;

        const contentDisposition = response.headers['content-disposition'];
        let filename = 'Student_Allocation.xlsx';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length === 2)
                filename = fileNameMatch[1];
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(href);
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
