import { useState } from 'react';
import type { Hall, HallFormData } from '../../types';

interface HallFormProps {
    onSubmit: (hall: HallFormData) => void;
    onCancel: () => void;
    initialData?: Hall;
}

const HallForm = ({ onSubmit, onCancel, initialData }: HallFormProps) => {
    // Check if initial capacity matches dimensional capacity
    const initialDimensionalCapacity = (initialData?.rows || 5) * (initialData?.columns || 5);
    const hasCustomCapacity = initialData ? initialData.capacity !== initialDimensionalCapacity : true; // Default to custom for new halls

    const [formData, setFormData] = useState<HallFormData>({
        name: initialData?.name || '',
        block: initialData?.block || '',
        rows: initialData?.rows || 5,
        columns: initialData?.columns || 5,
    });

    const [isCustomCapacity, setIsCustomCapacity] = useState(hasCustomCapacity);
    const [customCapacity, setCustomCapacity] = useState<number>(
        initialData?.capacity || 25
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            capacity: isCustomCapacity ? customCapacity : formData.rows * formData.columns
        });
    };

    const handleChange = (field: keyof HallFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="hallName" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Hall Name
                </label>
                <input
                    id="hallName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="input-field"
                    placeholder="e.g., I1, T6A, AUD1"
                    required
                    autoFocus
                />
            </div>

            <div>
                <label htmlFor="hallBlock" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Block
                </label>
                <input
                    id="hallBlock"
                    type="text"
                    value={formData.block}
                    onChange={(e) => handleChange('block', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Maths Block, Civil Block"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="hallRows" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                        Rows
                    </label>
                    <input
                        id="hallRows"
                        type="number"
                        value={formData.rows}
                        onChange={(e) => handleChange('rows', parseInt(e.target.value) || 0)}
                        className="input-field"
                        min={1}
                        max={20}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="hallCols" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                        Columns
                    </label>
                    <input
                        id="hallCols"
                        type="number"
                        value={formData.columns}
                        onChange={(e) => handleChange('columns', parseInt(e.target.value) || 0)}
                        className="input-field"
                        min={1}
                        max={20}
                        required
                    />
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="customCapacity"
                        checked={isCustomCapacity}
                        onChange={(e) => setIsCustomCapacity(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="customCapacity" className="text-sm font-medium text-gray-900 dark:text-white">
                        Set Fixed Capacity (Default: 25)
                    </label>
                </div>

                {isCustomCapacity && (
                    <div>
                        <input
                            type="number"
                            value={customCapacity}
                            onChange={(e) => setCustomCapacity(parseInt(e.target.value) || 0)}
                            className="input-field"
                            min={1}
                            placeholder="Enter max capacity"
                            aria-label="Custom Capacity"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Use this to limit seats regardless of rows/columns
                        </p>
                    </div>
                )}

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-blue-800 dark:text-blue-300 flex justify-between items-center">
                        <span className="font-semibold">Final Capacity:</span>
                        <span className="text-lg font-bold">
                            {isCustomCapacity ? customCapacity : formData.rows * formData.columns} seats
                        </span>
                    </p>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                    {initialData ? 'Update Hall' : 'Create Hall'}
                </button>
                <button type="button" onClick={onCancel} className="btn-secondary flex-1">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default HallForm;
