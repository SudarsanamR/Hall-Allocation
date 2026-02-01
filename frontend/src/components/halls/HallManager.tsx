import { useState, useEffect, memo, useCallback } from 'react';
import { Edit2, Trash2, Plus, GripVertical, CheckSquare, Square, Settings, Grid } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { reorderHalls, updateHallCapacityBulk, updateHallDimensionsBulk } from '../../utils/api';
import type { Hall } from '../../types';

interface HallManagerProps {
    halls: Hall[];
    onEdit: (hall: Hall) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
    onRefresh?: () => void;
}

// 1. Sortable Hall Item
const SortableHall = memo(({
    hall,
    onEdit,
    deleteConfirm,
    handleDelete,
    isSelected,
    onToggleSelect
}: {
    hall: Hall,
    onEdit: (h: Hall) => void,
    deleteConfirm: string | null,
    handleDelete: (id: string) => void,
    isSelected: boolean,
    onToggleSelect: (id: string) => void
}) => {
    // Unique ID for dnd-kit
    const sortableId = `hall-${hall.id}`;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: sortableId,
        data: {
            type: 'Hall',
            hall
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-xl p-4 transition-colors touch-none ${isSelected
                ? 'bg-blue-50 border-2 border-primary-500 dark:bg-blue-900/20 dark:border-primary-400'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800'
                }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2">
                    <div className="flex items-center gap-2 mt-1">
                        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing">
                            <GripVertical size={16} />
                        </div>
                        <button
                            onClick={() => onToggleSelect(hall.id)}
                            className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                            aria-label={isSelected ? `Deselect ${hall.name}` : `Select ${hall.name}`}
                        >
                            {isSelected ? <CheckSquare size={18} className="text-primary-600 dark:text-primary-400" /> : <Square size={18} />}
                        </button>
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
                        aria-label={`Edit ${hall.name}`}
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
                        aria-label={deleteConfirm === hall.id ? 'Confirm delete hall' : `Delete ${hall.name}`}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
});

// 2. Sortable Block (Which contains Halls)
const SortableBlock = memo(({
    block,
    halls,
    onEdit,
    deleteConfirm,
    handleDelete,
    selectedHalls,
    onToggleSelect,
    onSelectAllInBlock
}: {
    block: string,
    halls: Hall[],
    onEdit: (h: Hall) => void,
    deleteConfirm: string | null,
    handleDelete: (id: string) => void,
    selectedHalls: string[],
    onToggleSelect: (id: string) => void,
    onSelectAllInBlock: (ids: string[]) => void
}) => {
    // Unique ID for dnd-kit
    const sortableId = `block-${block}`;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: sortableId,
        data: {
            type: 'Block',
            block
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    const blockHallIds = halls.map(h => h.id);
    const allSelected = blockHallIds.every(id => selectedHalls.includes(id));

    return (
        <div ref={setNodeRef} style={style} className="card touch-none mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3 dark:text-white select-none">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing p-1">
                    <GripVertical size={20} />
                </div>

                <button
                    onClick={() => onSelectAllInBlock(blockHallIds)}
                    className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Select/Deselect all in block"
                    aria-label={allSelected ? `Deselect all halls in ${block}` : `Select all halls in ${block}`}
                >
                    {allSelected ? <CheckSquare size={20} className="text-primary-600 dark:text-primary-400" /> : <Square size={20} />}
                </button>

                <div className="w-2 h-2 bg-primary-600 rounded-full" />
                {block}
                <span className="text-sm font-normal text-gray-500 ml-2 dark:text-gray-400">
                    ({halls.length} halls)
                </span>
            </h3>

            {/* Nested Sortable Context for Halls within this Block */}
            <SortableContext items={halls.map(h => `hall-${h.id}`)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {halls.map((hall) => (
                        <SortableHall
                            key={hall.id}
                            hall={hall}
                            onEdit={onEdit}
                            deleteConfirm={deleteConfirm}
                            handleDelete={handleDelete}
                            isSelected={selectedHalls.includes(hall.id)}
                            onToggleSelect={onToggleSelect}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
});

// 3. Main HallManager Component
const HallManager = ({ halls, onEdit, onDelete, onAdd, onRefresh }: HallManagerProps) => {
    const [orderedBlocks, setOrderedBlocks] = useState<string[]>([]);
    const [localHalls, setLocalHalls] = useState<Hall[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Bulk Selection State
    const [selectedHalls, setSelectedHalls] = useState<string[]>([]);
    const [showBulkCapacity, setShowBulkCapacity] = useState(false);
    const [bulkCapacityValue, setBulkCapacityValue] = useState<number>(25);

    // Bulk Dimensions State
    const [showBulkDimensions, setShowBulkDimensions] = useState(false);
    const [bulkRowsValue, setBulkRowsValue] = useState<number>(5);
    const [bulkColumnsValue, setBulkColumnsValue] = useState<number>(5);

    // Sync props to local state
    useEffect(() => {
        setLocalHalls(halls);
    }, [halls]);

    // Group halls by block
    useEffect(() => {
        const uniqueBlocks = Array.from(new Set(halls.map(h => h.block)));

        const currentSet = new Set(orderedBlocks);
        const newSet = new Set(uniqueBlocks);

        let changed = currentSet.size !== newSet.size;
        if (!changed) {
            for (let b of newSet) {
                if (!currentSet.has(b)) changed = true;
            }
        }

        if (changed || orderedBlocks.length === 0) {
            const sortedBlocks = uniqueBlocks.sort((a, b) => {
                const hallA = halls.find(h => h.block === a);
                const hallB = halls.find(h => h.block === b);
                return (hallA?.priority || 0) - (hallB?.priority || 0);
            });
            setOrderedBlocks(sortedBlocks);
        }
    }, [halls]);

    // Bulk Handlers
    const handleToggleSelect = useCallback((id: string) => {
        setSelectedHalls(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }, []);

    const handleSelectAllInBlock = useCallback((ids: string[]) => {
        // We need to check current state, so valid to use functional update or dependency?
        // Functional update with checking inclusion is tricky because we need to know if ALL are selected.
        // Better to pass the logic or use dependency.
        // Given 'selectedHalls' is needed to decide toggle on/off:
        setSelectedHalls(prev => {
            const allSelected = ids.every(id => prev.includes(id));
            if (allSelected) {
                return prev.filter(id => !ids.includes(id));
            } else {
                return [...new Set([...prev, ...ids])];
            }
        });
    }, []);

    const handleBulkUpdate = async () => {
        if (selectedHalls.length === 0) return;
        try {
            await updateHallCapacityBulk(selectedHalls, bulkCapacityValue);
            setSelectedHalls([]);
            setShowBulkCapacity(false);
            if (onRefresh) await onRefresh();
        } catch (e) {
            console.error('Failed to update capacity', e);
            alert('Failed to update capacity');
        }
    };

    const handleBulkDimensionsUpdate = async () => {
        if (selectedHalls.length === 0) return;
        try {
            await updateHallDimensionsBulk(selectedHalls, bulkRowsValue, bulkColumnsValue);
            setSelectedHalls([]);
            setShowBulkDimensions(false);
            if (onRefresh) await onRefresh();
        } catch (e) {
            console.error('Failed to update dimensions', e);
            alert('Failed to update dimensions');
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require movement before drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;
        if (active.id === over.id) return;

        const activeType = active.data.current?.type;
        const overType = over.data.current?.type;

        // Block Reordering
        if (activeType === 'Block' && overType === 'Block') {
            setOrderedBlocks((items) => {
                const activeBlock = active.data.current?.block;
                const overBlock = over.data.current?.block;

                if (!activeBlock || !overBlock) return items;

                const oldIndex = items.indexOf(activeBlock);
                const newIndex = items.indexOf(overBlock);

                if (oldIndex === -1 || newIndex === -1) return items;

                const newOrder = arrayMove(items, oldIndex, newIndex);
                // reorderBlocks(newOrder).catch(...) 
                return newOrder;
            });
            return;
        }

        // Hall Reordering
        if (activeType === 'Hall') {
            const activeHallId = (active.id as string).replace('hall-', '');
            const overHallId = (over.id as string).replace('hall-', '');

            const activeHall = localHalls.find(h => h.id === activeHallId);
            const overHall = localHalls.find(h => h.id === overHallId);

            if (activeHall && overHall && activeHall.block === overHall.block) {
                // Only allow reordering within same block
                const blockHalls = localHalls.filter(h => h.block === activeHall.block);

                const oldIndex = blockHalls.findIndex(h => h.id === activeHallId);
                const newIndex = blockHalls.findIndex(h => h.id === overHallId);

                const newBlockOrder = arrayMove(blockHalls, oldIndex, newIndex);

                // Reconstruct full list
                const newFullList = orderedBlocks.flatMap(block => {
                    if (block === activeHall.block) return newBlockOrder;
                    return localHalls.filter(h => h.block === block);
                });

                setLocalHalls(newFullList);

                const hallIds = newBlockOrder.map(h => h.id);
                reorderHalls(hallIds).catch(err => console.error("Failed to reorder halls:", err));
            }
        }
    };

    const handleDelete = useCallback((id: string) => {
        // We can't easily access deleteConfirm state inside callback without dependency.
        // But we can use functional update for setDeleteConfirm? No, we need to read it.
        // Actually, we can just let it depend on deleteConfirm. It changes rarely.
        setDeleteConfirm(prev => {
            if (prev === id) {
                onDelete(id);
                return null;
            } else {
                setTimeout(() => setDeleteConfirm(null), 3000);
                return id;
            }
        });
    }, [onDelete]);

    // Helper to get halls for a block (from local state)
    const getBlockHalls = (block: string) => localHalls.filter(h => h.block === block);

    return (
        <div className="space-y-6 relative">
            {/* Bulk Action Bar */}
            {selectedHalls.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-4 z-50 animate-slide-up">
                    <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {selectedHalls.length} Selected
                    </span>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                    <button
                        onClick={() => setShowBulkCapacity(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
                    >
                        <Settings size={18} />
                        Set Capacity
                    </button>
                    <button
                        onClick={() => setShowBulkDimensions(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                    >
                        <Grid size={18} />
                        Set Dimensions
                    </button>
                    <button
                        onClick={() => setSelectedHalls([])}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Bulk Capacity Modal */}
            <Dialog open={showBulkCapacity} onClose={() => setShowBulkCapacity(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Set Capacity for {selectedHalls.length} Halls
                        </DialogTitle>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="bulkCapacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    New Max Capacity
                                </label>
                                <input
                                    id="bulkCapacity"
                                    type="number"
                                    value={bulkCapacityValue}
                                    onChange={(e) => setBulkCapacityValue(parseInt(e.target.value) || 0)}
                                    className="input-field"
                                    min={1}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBulkUpdate}
                                    className="btn-primary flex-1"
                                >
                                    Update All
                                </button>
                                <button
                                    onClick={() => setShowBulkCapacity(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Bulk Dimensions Modal */}
            <Dialog open={showBulkDimensions} onClose={() => setShowBulkDimensions(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Set Dimensions for {selectedHalls.length} Halls
                        </DialogTitle>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="bulkRows" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Rows
                                    </label>
                                    <input
                                        id="bulkRows"
                                        type="number"
                                        value={bulkRowsValue}
                                        onChange={(e) => setBulkRowsValue(parseInt(e.target.value) || 1)}
                                        className="input-field"
                                        min={1}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bulkCols" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Columns
                                    </label>
                                    <input
                                        id="bulkCols"
                                        type="number"
                                        value={bulkColumnsValue}
                                        onChange={(e) => setBulkColumnsValue(parseInt(e.target.value) || 1)}
                                        className="input-field"
                                        min={1}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Capacity will be set to {bulkRowsValue * bulkColumnsValue} seats
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBulkDimensionsUpdate}
                                    className="btn-primary flex-1"
                                >
                                    Update All
                                </button>
                                <button
                                    onClick={() => setShowBulkDimensions(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Hall Management</h2>
                    <p className="text-gray-600 mt-1 dark:text-gray-400">
                        {localHalls.length} halls configured across {orderedBlocks.length} blocks
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Drag blocks or halls to reorder priority</p>
                </div>
                <button onClick={onAdd} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Add Hall
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={orderedBlocks.map(b => `block-${b}`)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-6">
                        {orderedBlocks.map((block) => (
                            <SortableBlock
                                key={block}
                                block={block}
                                halls={getBlockHalls(block)}
                                onEdit={onEdit}
                                deleteConfirm={deleteConfirm}
                                handleDelete={handleDelete}
                                selectedHalls={selectedHalls}
                                onToggleSelect={handleToggleSelect}
                                onSelectAllInBlock={handleSelectAllInBlock}
                            />
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: { opacity: '0.4' },
                        },
                    }),
                }}>
                    {activeId ? (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-primary-500 opacity-90 pointer-events-none">
                            {activeId.startsWith('block-') ? 'Moving Block' : 'Moving Hall'}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default HallManager;
