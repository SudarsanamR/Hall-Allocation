import { useState, useEffect } from 'react';
import { ServerCrash, X } from 'lucide-react';

const NetworkStatus = () => {
    const [networkError, setNetworkError] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handleNetworkError = (e: CustomEvent<{ message: string }>) => {
            setNetworkError(e.detail.message);
            setDismissed(false);
        };

        // Clear network error when we get a successful response
        const handleNetworkSuccess = () => {
            setNetworkError(null);
        };

        window.addEventListener('network:error', handleNetworkError as EventListener);
        window.addEventListener('network:success', handleNetworkSuccess);

        return () => {
            window.removeEventListener('network:error', handleNetworkError as EventListener);
            window.removeEventListener('network:success', handleNetworkSuccess);
        };
    }, []);

    // Auto-dismiss after 30 seconds
    useEffect(() => {
        if (networkError && !dismissed) {
            const timer = setTimeout(() => setDismissed(true), 30000);
            return () => clearTimeout(timer);
        }
    }, [networkError, dismissed]);

    // Don't show if no error or if dismissed
    if (!networkError || dismissed) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="flex items-center gap-3 bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg">
                <ServerCrash size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">Unable to connect to the local server. Please restart the application.</span>
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

