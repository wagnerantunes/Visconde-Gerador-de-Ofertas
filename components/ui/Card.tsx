import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    subtitle,
    action,
    footer
}) => {
    return (
        <div className={`glass-strong rounded-2xl overflow-hidden flex flex-col ${className}`}>
            {(title || action) && (
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-white/50 dark:bg-black/20">
                    <div>
                        {title && <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</h3>}
                        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-5 flex-1">
                {children}
            </div>
            {footer && (
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                    {footer}
                </div>
            )}
        </div>
    );
};
