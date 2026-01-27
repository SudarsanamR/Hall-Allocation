import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import type { Hall } from '../../types';

interface HallManagerProps {
    halls: Hall[];
    onEdit: (hall: Hall) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

const SortableBlock = ({
    block,
    halls,
    onEdit,
    deleteConfirm,
    handleDelete
}: {
    block: string,
    halls: Hall[],
    onEdit: (h: Hall) => void,
    deleteConfirm: string | null,
    handleDelete: (id: string) => void
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: block });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="card touch-none">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-white select-none">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing p-1">
                    <GripVertical size={20} />
                </div>
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
                {block}
                <span className="text-sm font-normal text-gray-500 ml-2 dark:text-gray-400">
                    ({halls.length} halls)
                </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {halls.map((hall) => (
                    <div
                        key={hall.id}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors dark:bg-gray-800/50 dark:hover:bg-gray-800"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {hall.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {hall.rows} × {hall.columns} = {hall.capacity} seats
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit(hall)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-blue-400 dark:hover:bg-blue-900/20"
                                    title="Edit hall"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(hall.id)}
                                    className={`p-2 rounded-lg transition-colors ${deleteConfirm === hall.id
                                        ? 'bg-red-600 text-white'
                                        : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
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
    );
};

const HallManager = ({ halls, onEdit, onDelete, onAdd }: HallManagerProps) => {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [orderedBlocks, setOrderedBlocks] = useState<string[]>([]);

    // Group halls by block
    const hallsByBlock = halls.reduce((acc, hall) => {
        if (!acc[hall.block]) {
            acc[hall.block] = [];
        }
        acc[hall.block].push(hall);
        return acc;
    }, {} as Record<string, Hall[]>);

    // Initialize ordered blocks based on appearance in halls array
    useEffect(() => {
        const uniqueBlocks = Array.from(new Set(halls.map(h => h.block)));
        setOrderedBlocks(uniqueBlocks);
    }, [halls]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setOrderedBlocks((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Persist to backend
                axios.post('http://localhost:5000/api/halls/reorder_blocks', newOrder)
                    .catch(err => console.error('Failed to save block order:', err));

                return newOrder;
            });
        }
    };

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
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Hall Management</h2>
                    <p className="text-gray-600 mt-1 dark:text-gray-400">
                        {halls.length} halls configured across {orderedBlocks.length} blocks
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Drag blocks to reorder priority</p>
                </div>
                <button onClick={onAdd} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Add Hall
                </button>
            </div>

            {/* Halls by Block (Sortable) */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={orderedBlocks}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-6">
                        {orderedBlocks.map((block) => (
                            <SortableBlock
                                key={block}
                                block={block}
                                halls={hallsByBlock[block] || []}
                                onEdit={onEdit}
                                deleteConfirm={deleteConfirm}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default HallManager;
