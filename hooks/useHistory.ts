import { useState, useCallback, useMemo } from 'react';

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

interface InternalState<T> {
    history: T[];
    currentIndex: number;
}

export function useHistory<T>(initialState: T, maxHistory = 50): UseHistoryReturn<T> {
    const [internalState, setInternalState] = useState<InternalState<T>>({
        history: [initialState],
        currentIndex: 0
    });

    const setState = useCallback((update: T | ((prev: T) => T)) => {
        setInternalState(prev => {
            const prevState = prev.history[prev.currentIndex];
            const newState = typeof update === 'function'
                ? (update as (p: T) => T)(prevState)
                : update;

            // Don't add if state hasn't changed (shallow)
            if (newState === prevState) return prev;

            const newHistory = prev.history.slice(0, prev.currentIndex + 1);
            newHistory.push(newState);

            const finalHistory = newHistory.length > maxHistory
                ? newHistory.slice(newHistory.length - maxHistory)
                : newHistory;

            return {
                history: finalHistory,
                currentIndex: finalHistory.length - 1
            };
        });
    }, [maxHistory]);

    const replaceState = useCallback((update: T | ((prev: T) => T)) => {
        setInternalState(prev => {
            const prevState = prev.history[prev.currentIndex];
            const newState = typeof update === 'function'
                ? (update as (p: T) => T)(prevState)
                : update;

            const newHistory = [...prev.history];
            newHistory[prev.currentIndex] = newState;

            return {
                ...prev,
                history: newHistory
            };
        });
    }, []);

    const undo = useCallback(() => {
        setInternalState(prev => ({
            ...prev,
            currentIndex: Math.max(0, prev.currentIndex - 1)
        }));
    }, []);

    const redo = useCallback(() => {
        setInternalState(prev => ({
            ...prev,
            currentIndex: Math.min(prev.history.length - 1, prev.currentIndex + 1)
        }));
    }, []);

    const clear = useCallback(() => {
        setInternalState(prev => ({
            history: [prev.history[prev.currentIndex]],
            currentIndex: 0
        }));
    }, []);

    const currentState = useMemo(() =>
        internalState.history[internalState.currentIndex],
        [internalState]);

    return {
        state: currentState,
        setState,
        replaceState,
        undo,
        redo,
        canUndo: internalState.currentIndex > 0,
        canRedo: internalState.currentIndex < internalState.history.length - 1,
        clear,
    };
}
