import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for fade out animation
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getToastConfig = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-800',
                    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
                    title: 'Success'
                };
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-800',
                    icon: <XCircle className="h-5 w-5 text-red-600" />,
                    title: 'Error'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'text-yellow-800',
                    icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
                    title: 'Warning'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-800',
                    icon: <Info className="h-5 w-5 text-blue-600" />,
                    title: 'Info'
                };
        }
    };

    const config = getToastConfig();

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className={`${config.bg} ${config.border} border rounded-lg shadow-lg overflow-hidden`}>
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {config.icon}
                        </div>
                        <div className="ml-3 w-0 flex-1">
                            <p className={`text-sm font-medium ${config.text}`}>
                                {config.title}
                            </p>
                            <p className={`mt-1 text-sm ${config.text} opacity-90`}>
                                {message}
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                onClick={handleClose}
                                className={`inline-flex ${config.text} opacity-70 hover:opacity-100 transition-opacity duration-200`}
                            >
                                <span className="sr-only">Close</span>
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;