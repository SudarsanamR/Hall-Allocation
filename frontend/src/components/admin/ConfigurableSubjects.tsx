import { useState, useEffect } from 'react';
import { Plus, Trash2, ShieldAlert, PenTool, AlertCircle } from 'lucide-react';
import { getSubjectConfigs, addSubjectConfig, deleteSubjectConfig } from '../../utils/api';
import type { SubjectConfig } from '../../utils/api';
import LoadingSpinner from '../ui/LoadingSpinner';

const ConfigurableSubjects = () => {
    const [loading, setLoading] = useState(false);
    const [prioritySubjects, setPrioritySubjects] = useState<SubjectConfig[]>([]);
    const [drawingSubjects, setDrawingSubjects] = useState<SubjectConfig[]>([]);

    // Form states
    const [newPriority, setNewPriority] = useState('');
    const [newDrawing, setNewDrawing] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const data = await getSubjectConfigs();
            setPrioritySubjects(data.priority_subjects);
            setDrawingSubjects(data.drawing_subjects);
            setError(null);
        } catch (err) {
            console.error('Failed to load configs', err);
            setError('Failed to load subject configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (type: 'priority' | 'drawing', code: string, setInput: (s: string) => void) => {
        if (!code.trim()) return;

        try {
            await addSubjectConfig(type, code.trim());
            setInput('');
            await loadConfigs();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add subject code');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleDelete = async (type: 'priority' | 'drawing', code: string) => {
        if (!confirm(`Are you sure you want to remove ${code} from ${type} subjects?`)) return;

        try {
            await deleteSubjectConfig(type, code);
            await loadConfigs();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete subject code');
            setTimeout(() => setError(null), 3000);
        }
    };

    if (loading && prioritySubjects.length === 0) return <LoadingSpinner text="Loading configurations..." />;

    return (
        <div className="space-y-8 animate-fade-in">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Priority / Databook Subjects */}
                <div className="card h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                        <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                            <ShieldAlert className="text-orange-600 dark:text-orange-300" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Priority / Databook Subjects</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allocated first (e.g. valid for databook)</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] mb-4 pr-2 space-y-2">
                        {prioritySubjects.map((subj) => (
                            <div
                                key={subj.subject_code}
                                className="flex justify-between items-center p-3 rounded-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-medium">{subj.subject_code}</span>
                                    {subj.is_default && (
                                        <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 rounded-full">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete('priority', subj.subject_code)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                                    title="Remove code"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <input
                            type="text"
                            placeholder="Add Subject Code (e.g. ME1234)"
                            className="input-field flex-1 uppercase"
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd('priority', newPriority, setNewPriority)}
                        />
                        <button
                            onClick={() => handleAdd('priority', newPriority, setNewPriority)}
                            disabled={!newPriority.trim()}
                            className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Drawing Subjects */}
                <div className="card h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                            <PenTool className="text-purple-600 dark:text-purple-300" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Drawing Subjects</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allocated to Drawing Halls only (e.g. AH1, AH2)</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] mb-4 pr-2 space-y-2">
                        {drawingSubjects.map((subj) => (
                            <div
                                key={subj.subject_code}
                                className="flex justify-between items-center p-3 rounded-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-medium">{subj.subject_code}</span>
                                    {subj.is_default && (
                                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete('drawing', subj.subject_code)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                                    title="Remove code"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <input
                            type="text"
                            placeholder="Add Subject Code (e.g. GE3251)"
                            className="input-field flex-1 uppercase"
                            value={newDrawing}
                            onChange={(e) => setNewDrawing(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd('drawing', newDrawing, setNewDrawing)}
                        />
                        <button
                            onClick={() => handleAdd('drawing', newDrawing, setNewDrawing)}
                            disabled={!newDrawing.trim()}
                            className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigurableSubjects;
