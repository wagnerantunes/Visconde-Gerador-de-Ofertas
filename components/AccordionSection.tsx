import React, { useState } from 'react';

interface AccordionSectionProps {
    id: string;
    title: string;
    icon: string;
    badge?: string | number;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
    id,
    title,
    icon,
    badge,
    defaultOpen = false,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(() => {
        const saved = localStorage.getItem(`accordion-${id}`);
        return saved !== null ? saved === 'true' : defaultOpen;
    });

    const toggleOpen = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        localStorage.setItem(`accordion-${id}`, newState.toString());
    };

    return (
        <div className="premium-border rounded-2xl overflow-hidden bg-white dark:bg-paper-dark mb-3">
            {/* Header */}
            <button
                onClick={toggleOpen}
                className="w-full flex items-center justify-between p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <span className={`material-icons-round text-xl transition-colors ${isOpen ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }`}>
                        {icon}
                    </span>
                    <h3 className={`text-xs font-black uppercase tracking-wider transition-colors ${isOpen ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {title}
                    </h3>
                    {badge && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                <span className={`material-icons-round text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'
                    }`}>
                    expand_more
                </span>
            </button>

            {/* Content */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-4 pt-0 space-y-4 border-t border-black/[0.03] dark:border-white/[0.03]">
                    {children}
                </div>
            </div>
        </div>
    );
};
