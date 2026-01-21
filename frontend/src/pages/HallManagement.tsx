import { useState, useEffect } from 'react';
import HallManager from '../components/halls/HallManager';
import HallForm from '../components/halls/HallForm';
import { getHalls, createHall, updateHall, deleteHall, initializeDefaultHalls } from '../utils/api';
import type { Hall, HallFormData } from '../types';
import { RefreshCw, AlertCircle } from 'lucide-react';

const HallManagement = () => {
    const [halls, setHalls] = useState<Hall[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingHall, setEditingHall] = useState<Hall | null>(null);
    const [initializing, setInitializing] = useState(false);

    useEffect(() => {
        fetchHalls();
    }, []);

    const fetchHalls = async () => {
        try {
            setLoading(true);
            const data = await getHalls();
            setHalls(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load halls');
        } finally {
            setLoading(false);
        }
    };

    const handleAddHall = async (hallData: HallFormData) => {
        try {
            const newHall = await createHall({
                ...hallData,
                capacity: hallData.rows * hallData.columns,
            });
            setHalls(prev => [...prev, newHall]);
            setShowForm(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create hall');
        }
    };

    const handleUpdateHall = async (hallData: HallFormData) => {
        if (!editingHall) return;

        try {
            const updated = await updateHall(editingHall.id, {
                ...hallData,
                capacity: hallData.rows * hallData.columns,
            });
            setHalls(prev => prev.map(h => h.id === updated.id ? updated : h));
            setEditingHall(null);
            setShowForm(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update hall');
        }
    };

    const handleDeleteHall = async (id: string) => {
        try {
            await deleteHall(id);
            setHalls(prev => prev.filter(h => h.id !== id));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete hall');
        }
    };

    const handleEdit = (hall: Hall) => {
        setEditingHall(hall);
        setShowForm(true);
    };

    const handleInitializeDefaults = async () => {
        try {
            setInitializing(true);
            const defaultHalls = await initializeDefaultHalls();
            setHalls(defaultHalls);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize default halls');
        } finally {
            setInitializing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <div>
                        <p className="font-semibold text-red-900">Error</p>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {halls.length === 0 && !showForm && (
                <div className="card text-center py-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        No Halls Configured
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Initialize default halls or create custom halls manually
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleInitializeDefaults}
                            disabled={initializing}
                            className="btn-primary flex items-center gap-2"
                        >
                            <RefreshCw size={20} className={initializing ? 'animate-spin' : ''} />
                            {initializing ? 'Initializing...' : 'Initialize Default Halls'}
                        </button>
                        <button onClick={() => setShowForm(true)} className="btn-secondary">
                            Create Custom Hall
                        </button>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {editingHall ? 'Edit Hall' : 'Add New Hall'}
                    </h2>
                    <HallForm
                        onSubmit={editingHall ? handleUpdateHall : handleAddHall}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingHall(null);
                        }}
                        initialData={editingHall || undefined}
                    />
                </div>
            )}

            {halls.length > 0 && !showForm && (
                <HallManager
                    halls={halls}
                    onEdit={handleEdit}
                    onDelete={handleDeleteHall}
                    onAdd={() => setShowForm(true)}
                />
            )}
        </div>
    );
};

export default HallManagement;
