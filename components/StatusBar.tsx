import React from 'react';

interface StatusBarProps {
    productCount: number;
    isSaving: boolean;
    lastSaved?: Date;
}

export const StatusBar: React.FC<StatusBarProps> = ({ productCount, isSaving, lastSaved }) => {
    return (
        <div className="fixed bottom-4 right-4 z-30 flex items-center gap-3">
            {/* Product Count */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md px-3 py-2 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <span className="material-icons-round text-primary text-xl">shopping_bag</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {productCount} produto{productCount !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Save Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md px-3 py-2 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                {isSaving ? (
                    <>
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Salvando...
                        </span>
                    </>
                ) : (
                    <>
                        <span className="material-icons-round text-green-500 text-xl">check_circle</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {lastSaved ? `Salvo ${formatTimeAgo(lastSaved)}` : 'Salvo'}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return 'agora';
    if (seconds < 60) return `há ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `há ${hours}h`;
}
