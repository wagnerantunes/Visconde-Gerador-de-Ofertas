import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    leftIcon,
    className = '',
    id,
    options,
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
                <select
                    id={id}
                    className={`
                        w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                        rounded-xl text-sm text-gray-900 dark:text-white 
                        focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none 
                        transition-all duration-200 appearance-none
                        ${leftIcon ? 'pl-10' : 'px-4'} py-2
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <span className="material-icons-round text-sm">expand_more</span>
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
};
