import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    className = '',
    id,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={id}
                    className={`
                        w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                        rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 
                        shadow-sm transition-all duration-200
                        focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none 
                        ${leftIcon ? 'pl-10' : 'px-3'} 
                        ${props.size === 40 ? 'py-2.5' : 'py-2'}
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
};
