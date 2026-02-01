import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
};

export default function LoadingSpinner({
    size = 'md',
    text,
    fullScreen = false
}: LoadingSpinnerProps) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-400`} />
            {text && (
                <p className="text-white/60 text-sm animate-pulse">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="glass-card p-8">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            {content}
        </div>
    );
}

// Skeleton loader for cards
export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`glass-card p-6 animate-pulse ${className}`}>
            <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-white/10 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
    );
}

// Skeleton loader for tables
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="glass-card p-4 animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4"></div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded mb-2"></div>
            ))}
        </div>
    );
}
