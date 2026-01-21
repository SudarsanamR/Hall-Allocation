import { useState, useRef } from 'react';
import { FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadFile } from '../utils/api';
import type { UploadFileResponse } from '../types';

const Upload = () => {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<UploadFileResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;

        // Validate file type
        const validTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
            'application/pdf',
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx?|csv|pdf)$/i)) {
            setError('Please upload a valid PDF (.pdf), Excel (.xlsx, .xls) or CSV (.csv) file');
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setResult(null);

            const response = await uploadFile(file);
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Upload Student Data
                </h1>
                <p className="text-gray-600">
                    Upload a PDF, Excel or CSV file containing student exam information
                </p>
            </div>

            {/* File Requirements */}
            <div className="card bg-blue-50 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    Required Columns
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        <span><strong>Register Number</strong> - Student registration number</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        <span><strong>Subject Code</strong> - Exam subject code</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        <span><strong>Department</strong> - Student department</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        <span><strong>Exam Date</strong> - Date of examination</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        <span><strong>Session</strong> - FN (Forenoon) or AN (Afternoon)</span>
                    </li>
                </ul>
            </div>

            {/* Upload Area */}
            <div className="card">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf"
                    onChange={handleChange}
                    className="hidden"
                />

                <div
                    className={`
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300
            ${dragActive
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        }
          `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {uploading ? (
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
                        ) : (
                            <FileSpreadsheet className="text-primary-600" size={40} />
                        )}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {uploading ? 'Uploading...' : 'Drop your file here'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                        Supported formats: PDF (.pdf), Excel (.xlsx, .xls), CSV (.csv)
                    </p>
                </div>
            </div>

            {/* Error */}
            {
                error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                        <div>
                            <p className="font-semibold text-red-900">Error</p>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )
            }

            {/* Success */}
            {
                result && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
                            <div>
                                <p className="font-semibold text-green-900 text-lg">Upload Successful!</p>
                                <p className="text-green-700">{result.message}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4">
                            <p className="text-gray-900 font-semibold mb-2">Uploaded Data Summary:</p>
                            <p className="text-gray-700">
                                <span className="font-medium">Total Students:</span> {result.studentsCount}
                            </p>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Upload;
