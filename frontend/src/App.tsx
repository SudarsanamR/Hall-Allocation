import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <TopBar />

        <main className="pt-36 md:pt-32 p-4 md:p-8 animate-fade-in">
          <div className="w-full max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
