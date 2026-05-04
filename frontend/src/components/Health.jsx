import { useState, useEffect } from 'react';
import { checkHealth } from '../client/health';

const Health = () => {
    const [health, setHealth] = useState({
        frontend: 'checking...',
        backend: 'checking...',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            setLoading(true);
            try {
                const response = await checkHealth();
                setHealth({
                    frontend: 'OK',
                    backend: response?.status === 'ok' ? 'OK' : 'Error',
                    backendTestVar: response?.testVar || 'Not available',
                });
            } catch (error) {
                console.error('Health check failed:', error);
                setHealth({
                    frontend: 'OK',
                    backend: 'Error',
                });
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, []);

    // Helper function for status indicator
    const StatusIndicator = ({ status }) => {
        const isOk = status === 'OK';
        const baseClasses =
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
        const colorClasses = isOk
            ? 'bg-success/10 text-success'
            : 'bg-error/10 text-error';

        return (
            <span className={`${baseClasses} ${colorClasses}`}>
                <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                        isOk ? 'bg-success' : 'bg-error'
                    }`}
                ></span>
                {status}
            </span>
        );
    };

    // Get environment variables
    const frontendTestVar = import.meta.env.VITE_TEST || 'Not found';

    return (
        <>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-2">
                    Environment Variables:
                </h3>
                <p className="text-sm text-gray-600">
                    Frontend Test Variable:{' '}
                    <span className="font-mono">{frontendTestVar}</span>
                </p>
                {health.backendTestVar && (
                    <p className="text-sm mt-1 text-gray-600">
                        Backend Test Variable:{' '}
                        <span className="font-mono">
                            {health.backendTestVar}
                        </span>
                    </p>
                )}
            </div>

            {loading ? (
                <div className="py-8 flex justify-center items-center">
                    <div className="animate-pulse flex space-x-2">
                        <div className="w-3 h-3 bg-primary/30 rounded-full"></div>
                        <div className="w-3 h-3 bg-primary/50 rounded-full"></div>
                        <div className="w-3 h-3 bg-primary/70 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-500">
                        Checking systems...
                    </span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                    <span className="text-primary text-sm">
                                        FE
                                    </span>
                                </div>
                                <span className="font-medium text-gray-700">
                                    Frontend
                                </span>
                            </div>
                            <StatusIndicator status={health.frontend} />
                        </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                    <span className="text-primary text-sm">
                                        BE
                                    </span>
                                </div>
                                <span className="font-medium text-gray-700">
                                    Backend API
                                </span>
                            </div>
                            <StatusIndicator status={health.backend} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Health;
