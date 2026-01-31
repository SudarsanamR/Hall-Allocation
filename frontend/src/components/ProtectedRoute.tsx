import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // Redirect based on role if trying to access unauthorized page
        if (userRole === 'super_admin') {
            return <Navigate to="/super-admin" replace />;
        } else {
            return <Navigate to="/admin" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
