import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle2, AlertCircle, Download, RefreshCw, LayoutGrid } from 'lucide-react';
import { uploadFile, generateSeating, getStudents, downloadHallWiseExcel, downloadStudentWiseExcel } from '../utils/api';
import type { SeatingResult, GenerateResponse, UploadFileResponse, Stats } from '../types';
import SeatingGrid from '../components/seating/SeatingGrid';
import StatCards from '../components/layout/StatCards';

const AdminDashboard = () => {
    const navigate = useNavigate();
    // State for Upload
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadFileResponse | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for Results
    const [response, setResponse] = useState<GenerateResponse | null>(null);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasStudents, setHasStudents] = useState(false);
    const [backendError, setBackendError] = useState<boolean>(false);

    // Initial load check
    useEffect(() => {
        checkStudentsAndLoad();
    }, []);

    const checkStudentsAndLoad = async () => {
        try {
            const students = await getStudents();
            setBackendError(false);
            if (students.length > 0) {
                setHasStudents(true);
                handleGenerate(); // Auto generate if data exists
            } else {
                setHasStudents(false);
            }
        } catch (err) {
            console.error("Backend check failed:", err);
            setHasStudents(false);
            setBackendError(true);
        }
    };

    // --- Upload Handlers ---
    const handleFile = async (file: File) => {
        if (!file) return;

        const validTypes = [
            'application/pdf',
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.pdf$/i)) {
            setError('Please upload a valid PDF (.pdf) file');
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setUploadResult(null);

            const res = await uploadFile(file);
            setUploadResult(res);
            setHasStudents(true);

            // Auto generate after successful upload
            await handleGenerate();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    // --- Generate & Results Handlers ---
    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await generateSeating();
            setResponse(res);
            // Preserve session or default to first
            if (res.sessions.length > 0) {
                setSelectedSession(prev => res.sessions.includes(prev) ? prev : res.sessions[0]);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to generate seating allocation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadHall = () => {
        if (selectedSession) downloadHallWiseExcel(selectedSession);
    };

    const handleDownloadStudent = () => {
        if (selectedSession) downloadStudentWiseExcel(selectedSession);
    };

    // --- Helpers ---
    const currentResult: SeatingResult | null =
        response && selectedSession ? response.results[selectedSession] : null;

    const stats: Stats = {
        totalStudents: currentResult?.totalStudents || 0,
        hallsUsed: currentResult?.hallsUsed || 0,
        sessions: response?.sessions.length || 0,
    };

    // Color map logic
    const colorMap = new Map<string, string>();
    const colors = [
        'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
        'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
        'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
    ];

    if (currentResult) {
        const uniqueKeys = new Set<string>();
        currentResult.halls.forEach(hall => {
            hall.grid.forEach(row => {
                row.forEach(seat => {
                    if (seat.student) {
                        const key = seat.subject || seat.department || 'default';
                        uniqueKeys.add(key);
                    }
                });
            });
        });

        const sortedKeys = Array.from(uniqueKeys).sort();
        sortedKeys.forEach((key, index) => {
            colorMap.set(key, colors[index % colors.length]);
        });
    }

    return (
        <div className="space-y-12 animate-fade-in pb-12 max-w-7xl mx-auto">

            {/* 1. Upload Section */}
            <section className="space-y-6">

                {/* Backend Error Banner */}
                {backendError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                        <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
                        <div>
                            <h3 className="font-semibold text-red-900 dark:text-red-200">Backend Service Unavailable</h3>
                            <p className="text-sm text-red-700 dark:text-red-300">
                                Could not connect to the server. Please check if the backend is running at http://localhost:5000
                            </p>
                        </div>
                    </div>
                )}

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Exam Seating Automation
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Upload your exam schedule PDF directly from the university portal.
                    </p>
                </div>

                <div className="card max-w-3xl mx-auto">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleChange}
                        className="hidden"
                    />

                    <div
                        className={`
                            border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                            transition-all duration-300
                            ${dragActive
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400" />
                            ) : (
                                <UploadIcon className="text-primary-600 dark:text-primary-400" size={32} />
                            )}
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {uploading ? 'Processing File...' : 'Drop PDF file here to upload'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Supported: PDF
                        </p>
                    </div>

                    {/* Upload Status / Error */}
                    {error && (
                        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {uploadResult && (
                        <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
                            <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
                            <div>
                                <p className="font-semibold text-green-900 dark:text-green-200">Upload Complete</p>
                                <p className="text-xs text-green-700 dark:text-green-400">
                                    Processed {uploadResult.studentsCount} students. Generating seating...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 2. Results Section (Only if we have data) */}
            {(hasStudents || isLoading) && (
                <section className="space-y-8 border-t border-gray-200 dark:border-gray-800 pt-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Allocation Dashboard
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Review seating and download reports
                            </p>
                        </div>

                        {!isLoading && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate('/halls')}
                                    className="btn-secondary flex items-center gap-2 text-sm bg-white dark:bg-gray-800"
                                >
                                    <LayoutGrid size={16} />
                                    Manage Halls
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    className="btn-secondary flex items-center gap-2 text-sm"
                                >
                                    <RefreshCw size={16} />
                                    Refresh Allocation
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats */}


                    {/* Loading State */}
                    {isLoading && (
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                            <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
                        </div>
                    )}

                    {/* Results Content */}
                    {!isLoading && response && response.sessions.length > 0 && (
                        <>
                            {/* Controls Bar */}
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">

                                {/* Session Switcher */}
                                <div className="flex flex-wrap gap-2">
                                    {response.sessions.map(session => (
                                        <button
                                            key={session}
                                            onClick={() => setSelectedSession(session)}
                                            className={`
                                                px-4 py-2 rounded-xl font-medium text-sm transition-all
                                                ${selectedSession === session
                                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                                }
                                            `}
                                        >
                                            {session.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>

                                {/* Downloads */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDownloadHall}
                                        className="btn-accent flex items-center gap-2 py-2 px-4 text-sm bg-green-600 hover:bg-green-700 shadow-none"
                                        title="Download excel for notice board"
                                    >
                                        <FileSpreadsheet size={18} />
                                        <span className="hidden sm:inline">Hall Sketch</span>
                                    </button>
                                    <button
                                        onClick={handleDownloadStudent}
                                        className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
                                        title="Download student allocation list"
                                    >
                                        <Download size={18} />
                                        <span className="hidden sm:inline">Student List</span>
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mt-8 mb-8">
                                <StatCards stats={stats} />
                            </div>

                            {/* Seating Grid */}
                            {currentResult && (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                                    {currentResult.halls.map((hallSeating) => (
                                        <SeatingGrid
                                            key={hallSeating.hall.id}
                                            hallSeating={hallSeating}
                                            colorMap={colorMap}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>
            )}
        </div>
    );
};

export default AdminDashboard;
