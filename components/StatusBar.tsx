import React from 'react';

interface StatusBarProps {
    productCount: number;
    isSaving: boolean;
    lastSaved?: Date;
}

export const StatusBar: React.FC<StatusBarProps> = ({ productCount, isSaving, lastSaved }) => {
    return (
        <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2">
            {/* Product Count - Glass Style */}
            <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-2 hover-lift">
                <span className="material-icons-round text-primary text-lg">shopping_bag</span>
                <span className="text-[11px] font-black uppercase tracking-tight text-gray-700 dark:text-gray-200">
                    {productCount} {productCount !== 1 ? 'Produtos' : 'Produto'}
                </span>
            </div>

            {/* Save Status - Glass Style with Animation */}
            <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-2.5 hover-lift">
                {isSaving ? (
                    <>
                        <div className="relative">
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <div className="absolute inset-0 w-3 h-3 border-2 border-primary/20 rounded-full" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tight text-gray-600 dark:text-gray-300">
                            Salvando...
                        </span>
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <span className="material-icons-round text-green-500 text-lg animate-pulse">check_circle</span>
                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-sm" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tight text-gray-600 dark:text-gray-300">
                            {lastSaved ? formatTimeAgo(lastSaved) : 'Salvo'}
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
