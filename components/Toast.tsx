import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: 'check_circle',
        bgClass: 'bg-green-500',
        textClass: 'text-green-50',
        borderClass: 'border-green-400',
    },
    error: {
        icon: 'error',
        bgClass: 'bg-red-500',
        textClass: 'text-red-50',
        borderClass: 'border-red-400',
    },
    warning: {
        icon: 'warning',
        bgClass: 'bg-yellow-500',
        textClass: 'text-yellow-50',
        borderClass: 'border-yellow-400',
    },
    info: {
        icon: 'info',
        bgClass: 'bg-blue-500',
        textClass: 'text-blue-50',
        borderClass: 'border-blue-400',
    },
};

export const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 4000, onClose }) => {
    const [progress, setProgress] = useState(100);
    const [isExiting, setIsExiting] = useState(false);
    const config = toastConfig[type];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / (duration / 50));
                if (newProgress <= 0) {
                    clearInterval(interval);
                    handleClose();
                    return 0;
                }
                return newProgress;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
    };

    return (
        <div
            className={`relative flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md overflow-hidden transition-all duration-300 ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
                } ${config.bgClass} ${config.borderClass}`}
            style={{ minWidth: '320px', maxWidth: '400px' }}
        >
            {/* Icon */}
            <span className={`material-icons-round text-2xl ${config.textClass}`}>
                {config.icon}
            </span>

            {/* Message */}
            <div className="flex-1">
                <p className={`text-sm font-bold ${config.textClass}`}>{message}</p>
            </div>

            {/* Close Button */}
            <button
                onClick={handleClose}
                className={`${config.textClass} hover:opacity-70 transition-opacity`}
            >
                <span className="material-icons-round text-lg">close</span>
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <div
                    className="h-full bg-white/40 transition-all duration-50 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
