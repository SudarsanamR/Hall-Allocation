
import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { downloadHallWiseExcel, downloadStudentWiseExcel, generateSeating } from '../utils/api';

const Results = () => {
    const [sessions, setSessions] = useState<string[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        setLoading(true);
        try {
            const res = await generateSeating();
            setSessions(res.sessions);
            if (res.sessions.length > 0) {
                setSelectedSession(res.sessions[0]);
            }
        } catch (err) {
            setError("No seating generated yet. Please go to Dashboard.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadHall = () => {
        if (selectedSession) downloadHallWiseExcel(selectedSession);
    };

    const handleDownloadStudent = () => {
        if (selectedSession) downloadStudentWiseExcel(selectedSession);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (error || sessions.length === 0) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="text-red-600 mx-auto mb-2" size={32} />
                <p className="text-red-700 font-medium">{error || "No results available"}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Allocation Results
                </h1>
                <p className="text-gray-600">
                    Download final seating arrangements and allocation lists
                </p>
            </div>

            {/* Session Selector */}
            {sessions.length > 0 && (
                <div className="flex gap-2 mb-6">
                    {sessions.map(session => (
                        <button
                            key={session}
                            onClick={() => setSelectedSession(session)}
                            className={`
                                px-4 py-2 rounded-xl font-medium transition-all
                                ${selectedSession === session
                                    ? 'bg-primary-600 text-white shadow-soft'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }
                            `}
                            aria-current={selectedSession === session}
                        >
                            {session.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Hall-wise Excel */}
                <div className="card hover:border-primary-200 border border-transparent transition-all">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                        <FileSpreadsheet className="text-green-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Hall Sketch (Excel)
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Download the visual grid layout for each hall, formatted for printing and notice boards.
                    </p>
                    <button
                        onClick={handleDownloadHall}
                        className="w-full flex items-center justify-center gap-2 btn-secondary border-green-200 text-green-700 hover:bg-green-50"
                        aria-label={`Download Hall Sketch for ${selectedSession.replace('_', ' ')}`}
                    >
                        <Download size={20} />
                        Download {selectedSession.replace('_', ' ')}
                    </button>
                </div>

                {/* Student-wise Excel */}
                <div className="card hover:border-primary-200 border border-transparent transition-all">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                        <FileSpreadsheet className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Student Allocation List
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Download the master list of all student allocations sorted by registration number.
                    </p>
                    <button
                        onClick={handleDownloadStudent}
                        className="w-full flex items-center justify-center gap-2 btn-secondary border-blue-200 text-blue-700 hover:bg-blue-50"
                        aria-label={`Download Student List for ${selectedSession.replace('_', ' ')}`}
                    >
                        <Download size={20} />
                        Download {selectedSession.replace('_', ' ')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Results;
