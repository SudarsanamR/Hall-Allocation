import { Sun, Moon, Shield, GraduationCap, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gceeLogo from '../../assets/gcee-logo.png';
import annaUnivLogo from '../../assets/anna-univ-logo.png';

const TopBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-16 md:h-28 glass dark:glass-dark flex flex-row items-center justify-between px-4 md:px-8 z-40 transition-all duration-300 shadow-sm border-b border-white/20 dark:border-gray-800">
            {/* Left: Anna Univ Logo & Mobile Menu */}
            <div className="flex-shrink-0 flex items-center gap-2 md:gap-4 justify-start">
                <a href="https://www.annauniv.edu" target="_blank" rel="noopener noreferrer">
                    <img
                        src={annaUnivLogo}
                        alt="Anna University"
                        className="h-12 md:h-20 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform cursor-pointer"
                    />
                </a>

                {/* Mobile Menu Button - Moved Here */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Center: Title */}
            <div
                className="hidden lg:flex flex-col items-center text-center absolute left-1/2 -translate-x-1/2 cursor-pointer group"
                onClick={() => navigate('/')}
            >
                <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 uppercase tracking-wide leading-tight px-2 group-hover:scale-[1.02] transition-transform">
                    Government College of Engineering, Erode
                </h1>
                <h2 className="text-sm md:text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1">
                    University Exam Hall Allocation
                </h2>
            </div>

            {/* Center Mobile: Title */}
            <div
                className="lg:hidden absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-center cursor-pointer w-max"
                onClick={() => navigate('/')}
            >
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight whitespace-nowrap">GCE Erode</h1>
                <h2 className="text-[10px] sm:text-xs text-primary-600 dark:text-primary-400 whitespace-nowrap">Exam Hall Allocator</h2>
            </div>

            {/* Right: GCEE Logo + Controls */}
            <div className="flex items-center gap-2 md:gap-6 ml-auto">

                {/* Desktop Nav Items */}
                <div className="hidden md:flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className={`p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm flex items-center gap-2 ${location.pathname === '/' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : ''}`}
                        title="Student Dashboard"
                    >
                        <GraduationCap size={20} />
                        <span className="hidden lg:inline text-sm font-medium">Student</span>
                    </button>

                    <button
                        onClick={() => navigate('/admin')}
                        className={`p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm flex items-center gap-2 ${location.pathname === '/admin' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : ''}`}
                        title="Admin Dashboard"
                    >
                        <Shield size={20} />
                        <span className="hidden lg:inline text-sm font-medium">Admin</span>
                    </button>
                </div>

                {/* Theme Toggle - Always Visible */}
                <button
                    onClick={toggleTheme}
                    className="p-2 md:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                </button>



                {/* GCEE Logo - Always Visible */}
                <div className="flex flex-shrink-0 border-l pl-2 md:pl-6 border-gray-200 dark:border-gray-700 h-10 md:h-16 items-center">
                    <a href="https://gcee.ac.in" target="_blank" rel="noopener noreferrer">
                        <img
                            src={gceeLogo}
                            alt="GCEE"
                            className="h-10 md:h-20 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform cursor-pointer"
                        />
                    </a>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="absolute top-[4.5rem] left-16 w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl p-2 rounded-2xl md:hidden flex flex-col gap-1 z-50 animate-fade-in-down origin-top-left">
                    <button
                        onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                        className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${location.pathname === '/' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <GraduationCap size={20} />
                        <span className="font-medium">Student Dashboard</span>
                    </button>
                    <button
                        onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                        className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${location.pathname.startsWith('/admin') ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <Shield size={20} />
                        <span className="font-medium">Admin Dashboard</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TopBar;
