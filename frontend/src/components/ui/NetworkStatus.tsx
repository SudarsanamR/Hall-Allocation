import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [networkError, setNetworkError] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setNetworkError(null);
            setDismissed(false);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setDismissed(false);
        };

        const handleNetworkError = (e: CustomEvent<{ message: string }>) => {
            setNetworkError(e.detail.message);
            setDismissed(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('network:error', handleNetworkError as EventListener);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('network:error', handleNetworkError as EventListener);
        };
    }, []);

    // Don't show if online and no error, or if dismissed
    if ((isOnline && !networkError) || dismissed) {
        return null;
    }

    const message = !isOnline
        ? 'Local server connection issue. Please restart the application.'
        : networkError;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="flex items-center gap-3 bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg">
                <WifiOff size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">{message}</span>
                <button
                    onClick={() => setDismissed(true)}
                    className="ml-2 p-1 hover:bg-red-600 rounded transition-colors"
                    aria-label="Dismiss"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default NetworkStatus;
