import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from './components/layout/TopBar';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import HallManagement from './pages/HallManagement';
import NetworkStatus from './components/ui/NetworkStatus';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <TopBar />
        <NetworkStatus />

        <ErrorBoundary>
          <main className="pt-36 md:pt-32 p-4 md:p-8 animate-fade-in">
            <div className="w-full max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/search" element={<StudentDashboard />} />
                <Route path="/halls" element={<HallManagement />} />
              </Routes>
            </div>
          </main>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default App;
