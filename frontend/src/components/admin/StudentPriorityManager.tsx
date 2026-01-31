import { useState } from 'react';
import { Search, UserCheck, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { searchStudentDetails, toggleStudentDisability } from '../../utils/api';
import type { Student } from '../../types';

const StudentPriorityManager = () => {
    const [regNo, setRegNo] = useState('');
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    // Toggle state specifically for the checkbox
    const [isPhysicallyChallenged, setIsPhysicallyChallenged] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!regNo.trim()) return;

        setLoading(true);
        setError(null);
        setMsg(null);
        setStudent(null);

        try {
            const data = await searchStudentDetails(regNo);
            setStudent(data);
            setIsPhysicallyChallenged(!!data.isPhysicallyChallenged);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Student not found');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!student) return;
        setLoading(true);
        setError(null);
        setMsg(null);

        try {
            await toggleStudentDisability(student.registerNumber, isPhysicallyChallenged);
            setMsg('Status updated successfully');
            // Allow time for user to see success
            setTimeout(() => setMsg(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Special Allocation Management
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Flag students for ground floor allocation (I1, I2)
                    </p>
                </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={regNo}
                        onChange={(e) => setRegNo(e.target.value)}
                        placeholder="Enter Register Number"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-orange-500 focus:ring-0 transition-all font-mono"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-secondary bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
                </button>
            </form>

            {/* Result */}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {msg && <p className="text-sm text-green-500">{msg}</p>}

            {student && (
                <div className="animate-fade-in space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                            <span>Register No:</span>
                            <span className="font-mono font-medium text-gray-900 dark:text-gray-200">{student.registerNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Department:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{student.department}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Subject:</span>
                            <span className="font-mono text-gray-900 dark:text-gray-200">{student.subjectCode}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                        <div className="flex items-center gap-3">
                            <UserCheck className="text-orange-600 dark:text-orange-400" size={20} />
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-200">Physically Challenged</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Prioritize for Ground Floor (I1, I2)</p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPhysicallyChallenged}
                                onChange={(e) => setIsPhysicallyChallenged(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                        </label>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full btn-primary bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentPriorityManager;
