import { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import type { Hall } from '../../types';

interface HallManagerProps {
    halls: Hall[];
    onEdit: (hall: Hall) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

const HallManager = ({ halls, onEdit, onDelete, onAdd }: HallManagerProps) => {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Group halls by block
    const hallsByBlock = halls.reduce((acc, hall) => {
        if (!acc[hall.block]) {
            acc[hall.block] = [];
        }
        acc[hall.block].push(hall);
        return acc;
    }, {} as Record<string, Hall[]>);

    const handleDelete = (id: string) => {
        if (deleteConfirm === id) {
            onDelete(id);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(id);
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Hall Management</h2>
                    <p className="text-gray-600 mt-1">
                        {halls.length} halls configured across {Object.keys(hallsByBlock).length} blocks
                    </p>
                </div>
                <button onClick={onAdd} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Add Hall
                </button>
            </div>

            {/* Halls by Block */}
            <div className="space-y-6">
                {Object.entries(hallsByBlock).map(([block, blockHalls]) => (
                    <div key={block} className="card">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full" />
                            {block}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({blockHalls.length} halls)
                            </span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {blockHalls.map((hall) => (
                                <div
                                    key={hall.id}
                                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {hall.name}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {hall.rows} × {hall.columns} = {hall.capacity} seats
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onEdit(hall)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit hall"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(hall.id)}
                                                className={`p-2 rounded-lg transition-colors ${deleteConfirm === hall.id
                                                        ? 'bg-red-600 text-white'
                                                        : 'text-red-600 hover:bg-red-50'
                                                    }`}
                                                title={deleteConfirm === hall.id ? 'Click again to confirm' : 'Delete hall'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HallManager;
