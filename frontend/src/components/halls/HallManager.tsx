import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, GripVertical, Users, LayoutGrid } from 'lucide-react';
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
import { reorderBlocks, bulkUpdateHalls } from '../../utils/api';
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
    handleDelete,
    selectedHalls,
    onToggleSelection,
    onToggleBlock
}: {
    block: string,
    halls: Hall[],
    onEdit: (h: Hall) => void,
    deleteConfirm: string | null,
    handleDelete: (id: string) => void,
    selectedHalls: Set<string>,
    onToggleSelection: (id: string) => void,
    onToggleBlock: (block: string, select: boolean) => void
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

    const allSelected = halls.length > 0 && halls.every(h => selectedHalls.has(h.id));
    const someSelected = halls.some(h => selectedHalls.has(h.id));

    return (
        <div ref={setNodeRef} style={style} className="card touch-none relative group">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-white select-none">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing p-1">
                    <GripVertical size={20} />
                </div>

                <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => {
                        if (input) {
                            input.indeterminate = someSelected && !allSelected;
                        }
                    }}
                    onChange={(e) => onToggleBlock(block, e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />

                <div className="w-2 h-2 bg-primary-600 rounded-full" />
                {block}
                <span className="text-sm font-normal text-gray-500 ml-2 dark:text-gray-400">
                    ({halls.length} halls)
                </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {halls.map((hall) => {
                    const isSelected = selectedHalls.has(hall.id);
                    return (
                        <div
                            key={hall.id}
                            className={`rounded-xl p-4 border-2 transition-all cursor-pointer ${isSelected
                                ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20 dark:border-primary-500'
                                : 'bg-gray-50 border-transparent hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800'
                                }`}
                            onClick={(e) => {
                                // Prevent triggering if clicking buttons
                                if ((e.target as HTMLElement).closest('button')) return;
                                onToggleSelection(hall.id);
                            }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3">
                                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleSelection(hall.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {hall.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {hall.rows} × {hall.columns} = {hall.capacity} seats
                                        </p>
                                    </div>
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
                    );
                })}
            </div>
        </div>
    );
};

const HallManager = ({ halls, onEdit, onDelete, onAdd }: HallManagerProps) => {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [orderedBlocks, setOrderedBlocks] = useState<string[]>([]);
    const [selectedHalls, setSelectedHalls] = useState<Set<string>>(new Set());
    const [bulkRows, setBulkRows] = useState<string>('');
    const [bulkCols, setBulkCols] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

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
                reorderBlocks(newOrder)
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

    const handleToggleSelection = (id: string) => {
        const newSelection = new Set(selectedHalls);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedHalls(newSelection);
    };

    const handleToggleBlock = (block: string, select: boolean) => {
        const blockHalls = hallsByBlock[block] || [];
        const newSelection = new Set(selectedHalls);

        blockHalls.forEach(h => {
            if (select) {
                newSelection.add(h.id);
            } else {
                newSelection.delete(h.id);
            }
        });

        setSelectedHalls(newSelection);
    };

    const handleBulkUpdate = async () => {
        if (!bulkRows && !bulkCols) return;

        setIsUpdating(true);
        try {
            await bulkUpdateHalls(Array.from(selectedHalls), {
                rows: bulkRows ? parseInt(bulkRows) : undefined,
                columns: bulkCols ? parseInt(bulkCols) : undefined
            });

            // Clear selection and refresh (user will likely trigger a refresh via parent or we should assume parent will re-fetch if we had a callback, 
            // but for now we are just making the API call. Ideally, onEdit/onAdd triggers a refresh in parent.
            // As a quick fix, we can reload or if the parent passess a refresh capability. 
            // Looking at props: onEdit, onDelete, onAdd. None seem to be "refresh".
            // However, modifying the data on the server should eventually reflect if the parent re-fetches.
            // Since we can't easily trigger parent refresh without adding a prop, we'll just clear selection 
            // and maybe trigger onAdd() to force refresh or just rely on manual refresh/polling? 
            // Actually, usually these apps have some state sync. 
            // Let's assume user will refresh or we add a "onRefresh" prop if needed.
            // Wait, I can try to simply reload the page or assume the periodic fetch (if any) picks it up.
            // Let's just clear selection for now.

            setSelectedHalls(new Set());
            setBulkRows('');
            setBulkCols('');

            // Trigger a page reload to see changes immediately since we don't have a refresh prop
            window.location.reload();

        } catch (error) {
            console.error('Failed to update halls', error);
            alert('Failed to update halls');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedHalls.size === halls.length) {
            setSelectedHalls(new Set());
        } else {
            setSelectedHalls(new Set(halls.map(h => h.id)));
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
                <div className="flex gap-3">
                    <button
                        onClick={handleSelectAll}
                        className="px-4 py-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg font-medium transition-colors dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                    >
                        {selectedHalls.size === halls.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button onClick={onAdd} className="btn-primary flex items-center gap-2">
                        <Plus size={20} />
                        Add Hall
                    </button>
                </div>
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
                    <div className="space-y-6 pb-24">
                        {orderedBlocks.map((block) => (
                            <SortableBlock
                                key={block}
                                block={block}
                                halls={hallsByBlock[block] || []}
                                onEdit={onEdit}
                                deleteConfirm={deleteConfirm}
                                handleDelete={handleDelete}
                                selectedHalls={selectedHalls}
                                onToggleSelection={handleToggleSelection}
                                onToggleBlock={handleToggleBlock}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Bulk Actions Floating Bar */}
            {selectedHalls.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-6 z-50 animate-slide-up w-[90%] max-w-3xl">
                    <div className="flex items-center gap-4 border-r border-gray-200 dark:border-gray-700 pr-6">
                        <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                            {selectedHalls.size}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Selected</p>
                            <button
                                onClick={() => setSelectedHalls(new Set())}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-gray-400" />
                            <input
                                type="number"
                                placeholder="Rows"
                                value={bulkRows}
                                onChange={(e) => setBulkRows(e.target.value)}
                                className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            />
                        </div>
                        <span className="text-gray-400">×</span>
                        <div className="flex items-center gap-2">
                            <LayoutGrid size={18} className="text-gray-400" />
                            <input
                                type="number"
                                placeholder="Cols"
                                value={bulkCols}
                                onChange={(e) => setBulkCols(e.target.value)}
                                className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleBulkUpdate}
                            disabled={isUpdating || (!bulkRows && !bulkCols)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isUpdating ? 'Updating...' : 'Update All'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HallManager;
