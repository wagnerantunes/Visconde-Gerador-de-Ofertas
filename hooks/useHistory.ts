import { useState, useCallback } from 'react';

interface UseHistoryReturn<T> {
    state: T;
    setState: (newState: T) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clear: () => void;
}

export function useHistory<T>(initialState: T, maxHistory = 50): UseHistoryReturn<T> {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const setState = useCallback((newState: T) => {
        setHistory(prev => {
            // Remove future states if we're not at the end
            const newHistory = prev.slice(0, currentIndex + 1);

            // Add new state
            newHistory.push(newState);

            // Limit history size
            if (newHistory.length > maxHistory) {
                newHistory.shift();
                setCurrentIndex(prev => prev - 1);
            } else {
                setCurrentIndex(prev => prev + 1);
            }

            return newHistory;
        });
    }, [currentIndex, maxHistory]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, history.length]);

    const clear = useCallback(() => {
        setHistory([history[currentIndex]]);
        setCurrentIndex(0);
    }, [history, currentIndex]);

    return {
        state: history[currentIndex],
        setState,
        undo,
        redo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1,
        clear,
    };
}
