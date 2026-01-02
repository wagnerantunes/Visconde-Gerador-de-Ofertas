import React from 'react';

interface ShortcutBadgeProps {
    keys: string[];
    className?: string;
}

export const ShortcutBadge: React.FC<ShortcutBadgeProps> = ({ keys, className = '' }) => {
    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {keys.map((key, index) => (
                <React.Fragment key={index}>
                    <kbd className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded text-[9px] font-black uppercase tracking-wider">
                        {key}
                    </kbd>
                    {index < keys.length - 1 && (
                        <span className="text-[8px] text-gray-400">+</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
