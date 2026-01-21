import { useState } from 'react';
import type { Hall, HallFormData } from '../../types';

interface HallFormProps {
    onSubmit: (hall: HallFormData) => void;
    onCancel: () => void;
    initialData?: Hall;
}

const HallForm = ({ onSubmit, onCancel, initialData }: HallFormProps) => {
    const [formData, setFormData] = useState<HallFormData>({
        name: initialData?.name || '',
        block: initialData?.block || '',
        rows: initialData?.rows || 5,
        columns: initialData?.columns || 5,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (field: keyof HallFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hall Name
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="input-field"
                    placeholder="e.g., I1, T6A, AUD1"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Block
                </label>
                <input
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rows
                    </label>
                    <input
                        type="number"
                        value={formData.rows}
                        onChange={(e) => handleChange('rows', parseInt(e.target.value))}
                        className="input-field"
                        min={1}
                        max={20}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Columns
                    </label>
                    <input
                        type="number"
                        value={formData.columns}
                        onChange={(e) => handleChange('columns', parseInt(e.target.value))}
                        className="input-field"
                        min={1}
                        max={20}
                        required
                    />
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    <span className="font-semibold">Capacity:</span> {formData.rows * formData.columns} seats
                </p>
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
