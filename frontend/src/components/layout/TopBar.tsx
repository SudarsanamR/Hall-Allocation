import { Sun, Moon, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

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
        <div className="fixed top-0 left-0 right-0 min-h-[7rem] h-auto py-2 md:py-0 md:h-28 glass dark:glass-dark flex flex-col md:flex-row items-center justify-between px-4 md:px-8 z-40 transition-all duration-300 shadow-sm border-b border-white/20 dark:border-gray-800">
            {/* Left: Anna Univ Logo */}
            <div className="hidden md:block flex-shrink-0 w-24">
                <img
                    src="https://www.freelogovectors.net/wp-content/uploads/2022/03/anna_university_logo_freelogovectors.net_.png"
                    alt="Anna University"
                    className="h-16 md:h-20 w-auto object-contain drop-shadow-sm"
                />
            </div>

            {/* Center: Title */}
            <div className="flex flex-col items-center text-center mx-2 md:mx-0 my-2 md:my-0 md:absolute md:left-1/2 md:-translate-x-1/2">
                <h1 className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 uppercase tracking-wide leading-tight px-2">
                    Government College of Engineering
                </h1>
                <h2 className="text-sm md:text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1">
                    University Exam Hall Allocation
                </h2>
            </div>

            {/* Right: GCEE Logo + Controls */}
            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end px-4 md:px-0">

                {/* Mobile: Anna Univ Logo (Shown only on mobile left) */}
                <div className="block md:hidden flex-shrink-0">
                    <img
                        src="https://www.freelogovectors.net/wp-content/uploads/2022/03/anna_university_logo_freelogovectors.net_.png"
                        alt="Anna University"
                        className="h-12 w-auto object-contain drop-shadow-sm"
                    />
                </div>

                {/* Controls Group */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/halls')}
                        className="p-2 md:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm"
                        title="Hall Configuration"
                    >
                        <Settings size={20} />
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="p-2 md:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                    </button>

                    {/* Mobile GCEE (Shown on right) */}
                    <div className="block md:hidden flex-shrink-0">
                        <img
                            src="/gcee_logo.png"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                            alt="GCEE"
                            className="h-12 w-auto object-contain drop-shadow-sm"
                        />
                    </div>
                </div>

                {/* Desktop GCEE Logo */}
                <div className="hidden md:flex flex-shrink-0 border-l pl-6 border-gray-200 dark:border-gray-700 h-16 items-center">
                    <img
                        src="/gcee_logo.png"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerText = 'GCEE';
                        }}
                        alt="GCEE"
                        className="h-20 w-auto object-contain drop-shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default TopBar;
