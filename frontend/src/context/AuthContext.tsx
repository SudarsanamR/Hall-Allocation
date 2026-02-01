import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentUser, logout as apiLogout } from '../utils/api';
import type { AdminUser } from '../types';

interface AuthContextType {
    user: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: AdminUser) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // Invalidate any local storage auth flags to prevent stale state usage elsewhere
            // (We don't remove them yet if other parts depend on them, but we won't use them here)
            try {
                const { authenticated, user } = await getCurrentUser();
                if (authenticated && user) {
                    setUser(user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // Listen for 401 Unauthorized events from API interceptor
    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    const login = (userData: AdminUser) => {
        setUser(userData);
        // Keep localStorage for legacy support if needed mostly for other tabs sync, 
        // but strictly we should move away. 
        // For now, update them to keep other components (like TopBar before refactor) happy?
        // No, I am refactoring them too.
        localStorage.setItem('isAuthenticated', 'true'); // Optional: for non-react usage?
        localStorage.setItem('userRole', userData.role);
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setUser(null);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
