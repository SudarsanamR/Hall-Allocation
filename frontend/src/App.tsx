import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from './components/layout/TopBar';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import HallManagement from './pages/HallManagement';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <TopBar />

        <main className="pt-36 md:pt-32 p-4 md:p-8 animate-fade-in">
          <div className="w-full max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<StudentDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/halls"
                element={
                  <ProtectedRoute>
                    <HallManagement />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
