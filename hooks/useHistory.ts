import { useState, useCallback } from 'react';

interface UseHistoryReturn<T> {
    state: T;
    setState: (update: T | ((prev: T) => T)) => void;
    replaceState: (update: T | ((prev: T) => T)) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clear: () => void;
}

export function useHistory<T>(initialState: T, maxHistory = 50): UseHistoryReturn<T> {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const setState = useCallback((update: T | ((prev: T) => T)) => {
        setCurrentIndex(prevIndex => {
            setHistory(prevHistory => {
                const prevState = prevHistory[prevIndex];
                const newState = typeof update === 'function' ? (update as any)(prevState) : update;

                // Remove future states if we're not at the end
                const newHistory = prevHistory.slice(0, prevIndex + 1);

                // Add new state
                newHistory.push(newState);

                // Limit history size
                if (newHistory.length > maxHistory) {
                    newHistory.shift();
                    return newHistory;
                }

                return newHistory;
            });

            // Update index
            return Math.min(prevIndex + 1, maxHistory - 1);
        });
    }, [maxHistory]);

    const replaceState = useCallback((update: T | ((prev: T) => T)) => {
        setHistory(prevHistory => {
            const prevState = prevHistory[currentIndex];
            const newState = typeof update === 'function' ? (update as any)(prevState) : update;
            const newHistory = [...prevHistory];
            newHistory[currentIndex] = newState;
            return newHistory;
        });
    }, [currentIndex]);

    const undo = useCallback(() => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    }, []);

    const redo = useCallback(() => {
        setHistory(prevHistory => {
            setCurrentIndex(prev => Math.min(prevHistory.length - 1, prev + 1));
            return prevHistory;
        });
    }, []);

    const clear = useCallback(() => {
        setHistory(prevHistory => {
            setCurrentIndex(prevIndex => {
                setHistory([prevHistory[prevIndex]]);
                return 0;
            });
            return prevHistory;
        });
    }, []);

    return {
        state: history[currentIndex],
        setState,
        replaceState,
        undo,
        redo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1,
        clear,
    };
}
