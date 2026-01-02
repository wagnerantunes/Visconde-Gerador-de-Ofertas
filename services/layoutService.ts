
import { AppState } from '../types';
import { supabase } from '../lib/supabase';
import { saveToLocalStorage } from '../utils';

export const saveLayout = async (state: AppState, userId?: string, layoutName: string = 'Layout Atual') => {
    // 1. Always save to LocalStorage for offline backup/speed
    saveToLocalStorage(state);

    // 2. If user is logged in, save to Cloud
    if (userId) {
        try {
            // Check if there is already a 'current' layout or handle multiple layouts
            // For MVP: We upsert a single row for the "current state" or create new entries?
            // Let's create a new entry for "Auto Save" to avoid overwriting history if we want versioning,
            // OR upsert a specific row. 

            // Strategy: Upsert a layout named "Auto Save"
            const { error } = await supabase
                .from('layouts')
                .upsert({
                    user_id: userId,
                    name: layoutName,
                    state: state,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, name' }); // Requires a unique constraint on (user_id, name) or handling ID

            // Note: Simplest MVP is just Insert for now, or Upsert by ID if we tracked it.
            // Since we don't have a Layout ID in AppState yet, let's just Insert a log or Update a fixed "Current" slot.
            // BETTER MVP: Just insert. (User can clean up later, or we limit to 10 latest)

            if (error) {
                console.error('Error saving to Cloud:', error);
                throw error;
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to sync with cloud:', error);
            return { success: false, error };
        }
    }

    return { success: true, localOnly: true };
};

export const loadLayouts = async (userId: string) => {
    const { data, error } = await supabase
        .from('layouts')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const deleteLayout = async (layoutId: string) => {
    const { error } = await supabase
        .from('layouts')
        .delete()
        .eq('id', layoutId);

    if (error) throw error;
    return true;
};

export const renameLayout = async (layoutId: string, newName: string) => {
    const { error } = await supabase
        .from('layouts')
        .update({ name: newName })
        .eq('id', layoutId);

    if (error) throw error;
    return true;
};
