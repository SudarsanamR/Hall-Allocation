import { useState, useMemo } from 'react';
import { Search, MapPin, Armchair, ChevronRight } from 'lucide-react';
import { searchStudent } from '../utils/api';
import SeatingGrid from '../components/seating/SeatingGrid';

const StudentDashboard = () => {
    const [registerNumber, setRegisterNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allocations, setAllocations] = useState<any[] | null>(null);

    // Simple Color Map for subjects (could be dynamic)
    const colorMap = useMemo(() => new Map<string, string>(), []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!registerNumber.trim()) return;

        setLoading(true);
        setError(null);
        setAllocations(null);

        try {
            const data = await searchStudent(registerNumber);
            if (data.allocations) {
                setAllocations(data.allocations);
            } else {
                setError('No allocation details found.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Student not found or allocation not generated.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 pt-36 md:pt-32 pb-12 px-4 transition-colors duration-300">
            <div className="max-w-xl mx-auto space-y-8 animate-fade-in">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
                        Check Your Seat
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Enter your register number to find your exam hall.
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={registerNumber}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 12) setRegisterNumber(val);
                                }}
                                maxLength={12}
                                placeholder="Register Number (12 digits)"
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 dark:text-white placeholder-gray-400 text-lg transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || registerNumber.length !== 12}
                            className={`
                                w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2
                                ${loading || registerNumber.length !== 12
                                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-primary-500/25 active:scale-95'
                                }
                            `}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Search
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-800 text-center animate-fade-in">
                        {error}
                    </div>
                )}

                {/* Results List */}
                {allocations && (
                    <div className="space-y-6 animate-slide-up">
                        {allocations.map((alloc, idx) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
                            >
                                {/* Decorative Texture */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors" />

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 mb-6">
                                        <div>
                                            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                                                Exam Session
                                            </p>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {alloc.formattedSession}
                                            </h3>
                                        </div>
                                        <div className="bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg font-medium text-sm self-start md:self-center">
                                            {alloc.subject.split(':')[0]}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Hall Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400">
                                                <MapPin size={28} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                                                    Allocated Hall
                                                </p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                                    {alloc.hallName}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Seat Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                                                <Armchair size={28} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                                                    Seat Number
                                                </p>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                                        {alloc.seatNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    {/* Seating Grid */}
                                    {alloc.hallSeating && (
                                        <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                                <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
                                                Seating Arrangement
                                            </h4>
                                            {/* Adjusted Grid for Mobile/Desktop */}
                                            <div className="bg-gray-50 dark:bg-gray-950/50 p-2 md:p-4 rounded-2xl overflow-hidden">
                                                <SeatingGrid
                                                    hallSeating={alloc.hallSeating}
                                                    colorMap={colorMap}
                                                    highlightStudentId={registerNumber}
                                                />
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
