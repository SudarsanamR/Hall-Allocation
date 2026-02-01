import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchCsrfToken } from './utils/api';
import TopBar from './components/layout/TopBar';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import HallManagement from './pages/HallManagement';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <TopBar />

          <ErrorBoundary>
            <main className="pt-36 md:pt-32 p-4 md:p-8 animate-fade-in">
              <div className="w-full max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/halls"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <HallManagement />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/super-admin"
                    element={
                      <ProtectedRoute allowedRoles={['super_admin']}>
                        <SuperAdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </main>
          </ErrorBoundary>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
