import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Sun, Moon, Shield, GraduationCap, Menu, X, LogOut as LogOutIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import gceeLogo from '../../assets/gcee-logo.png';
import annaUnivLogo from '../../assets/anna-univ-logo.png';
import { useAuth } from '../../context/AuthContext';

const TopBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, user } = useAuth(); // Use AuthContext
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        // Disable transitions temporarily to prevent lag
        const css = document.createElement('style');
        css.appendChild(
            document.createTextNode(
                `* {
                    -webkit-transition: none !important;
                    -moz-transition: none !important;
                    -o-transition: none !important;
                    -ms-transition: none !important;
                    transition: none !important;
                }`
            )
        );
        document.head.appendChild(css);

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);

        // Force reflow
        window.getComputedStyle(document.body).opacity;

        // Re-enable transitions
        setTimeout(() => {
            document.head.removeChild(css);
        }, 0);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-16 md:h-28 glass dark:glass-dark grid grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8 z-40 transition-all duration-300 shadow-sm border-b border-white/20 dark:border-gray-800">
            {/* Left: Anna Univ Logo & Mobile Menu */}
            <div className="flex-shrink-0 flex items-center gap-2 md:gap-4 justify-self-start">
                <a href="https://www.annauniv.edu" target="_blank" rel="noopener noreferrer">
                    <img
                        src={annaUnivLogo}
                        alt="Anna University"
                        className="h-12 md:h-20 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform cursor-pointer"
                    />
                </a>

                {/* Desktop Nav Items - Moved to Left */}
                <div className="hidden md:flex items-center gap-2 ml-2">
                    <button
                        onClick={() => navigate('/')}
                        className={`p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm flex items-center gap-2 ${location.pathname === '/' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : ''}`}
                        title="Student Dashboard"
                    >
                        <GraduationCap size={20} />
                        <span className="hidden xl:inline text-sm font-medium">Student</span>
                    </button>

                    <button
                        onClick={() => {
                            if (isAuthenticated) {
                                const role = user?.role;
                                navigate(role === 'super_admin' ? '/super-admin' : '/admin');
                            } else {
                                navigate('/login');
                            }
                        }}
                        className={`p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm flex items-center gap-2 ${location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin') ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : ''}`}
                        title="Admin Dashboard"
                    >
                        <Shield size={20} />
                        <span className="hidden xl:inline text-sm font-medium">
                            {isAuthenticated ? 'Dashboard' : 'Admin'}
                        </span>
                    </button>
                </div>

                {/* Mobile Menu Button - Replaced with Popover */}
                <Popover className="md:hidden flex items-center relative">
                    {({ open, close }) => (
                        <>
                            <PopoverButton
                                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                                aria-label={open ? "Close menu" : "Open menu"}
                            >
                                {open ? <X size={24} /> : <Menu size={24} />}
                            </PopoverButton>

                            {/* Mobile Menu Dropdown */}
                            {open && (
                                <PopoverPanel static className="absolute top-12 left-0 w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl p-2 rounded-2xl flex flex-col gap-1 z-50 animate-fade-in-down origin-top-left">
                                    <button
                                        onClick={() => { navigate('/'); close(); }}
                                        className={`p-3 rounded-xl flex items-center gap-3 transition-colors w-full text-left ${location.pathname === '/' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        <GraduationCap size={20} />
                                        <span className="font-medium">Student Dashboard</span>
                                    </button>
                                    <button
                                        onClick={() => { navigate('/admin'); close(); }}
                                        className={`p-3 rounded-xl flex items-center gap-3 transition-colors w-full text-left ${location.pathname.startsWith('/admin') ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        <Shield size={20} />
                                        <span className="font-medium">Admin Dashboard</span>
                                    </button>

                                    {isAuthenticated && (
                                        <button
                                            onClick={() => { handleLogout(); close(); }}
                                            className="p-3 rounded-xl flex items-center gap-3 transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 w-full text-left"
                                        >
                                            <LogOutIcon size={20} />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    )}
                                </PopoverPanel>
                            )}
                        </>
                    )}
                </Popover>
            </div>

            {/* Center: Title */}
            <Link
                to="/"
                className="hidden xl:flex flex-col items-center text-center cursor-pointer group justify-self-center mx-4"
                aria-label="Go to Home"
            >
                <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 uppercase tracking-wide leading-tight px-2 group-hover:scale-[1.02] transition-transform">
                    Government College of Engineering, Erode
                </h1>
                <h2 className="text-sm md:text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1">
                    University Exam Hall Allocation
                </h2>
            </Link>

            {/* Center Mobile: Title - stays within grid column, no absolute */}
            <Link
                to="/"
                className="xl:hidden flex flex-col items-center text-center cursor-pointer justify-self-center overflow-hidden"
                aria-label="Go to Home"
            >
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">GCE Erode</h1>
                <h2 className="text-[9px] sm:text-[10px] text-primary-600 dark:text-primary-400 truncate max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">Exam Hall Allocator</h2>
            </Link>

            {/* Right: GCEE Logo + Controls */}
            <div className="flex items-center gap-2 md:gap-6 justify-self-end">

                {/* Logout Button - Kept on Right */}
                <div className="hidden md:flex items-center gap-3">
                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm flex items-center gap-2"
                            title="Sign Out"
                        >
                            <LogOutIcon size={20} />
                            <span className="hidden xl:inline text-sm font-medium">Logout</span>
                        </button>
                    )}
                </div>

                {/* Theme Toggle - Always Visible */}
                <button
                    onClick={toggleTheme}
                    className="p-2 md:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm"
                    title="Toggle Theme"
                    aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
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


        </div>
    );
};
export default TopBar;
