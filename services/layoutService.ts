
import { AppState } from '../types';
import { supabase } from '../lib/supabase';
import { saveToLocalStorage } from '../utils';

export const saveLayout = async (state: AppState, userId?: string, layoutName: string = 'Layout Atual', previewUrl?: string) => {
    // 1. Always save to LocalStorage for offline backup/speed
    saveToLocalStorage(state);

    // 2. If user is logged in, save to Cloud
    if (userId) {
        try {
            // Using upsert with onConflict for better reliability
            // We'll target the specific layout name for this user
            const { data: savedData, error: upsertError } = await supabase
                .from('layouts')
                .upsert({
                    user_id: userId,
                    name: layoutName,
                    state: state,
                    preview_url: previewUrl,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,name',
                    ignoreDuplicates: false
                })
                .select('id')
                .single();

            if (upsertError) {
                console.error('Upsert failed, trying manual update:', upsertError);
                // Fallback for cases where unique constraint is missing
                const { data: existing } = await supabase
                    .from('layouts')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('name', layoutName)
                    .limit(1)
                    .maybeSingle();

                if (existing) {
                    const { error: updateError } = await supabase
                        .from('layouts')
                        .update({
                            state,
                            preview_url: previewUrl,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existing.id);
                    if (updateError) throw updateError;
                    return { success: true, id: existing.id };
                } else {
                    const { data: inserted, error: insertError } = await supabase
                        .from('layouts')
                        .insert({
                            user_id: userId,
                            name: layoutName,
                            state,
                            preview_url: previewUrl,
                            updated_at: new Date().toISOString()
                        })
                        .select('id')
                        .single();
                    if (insertError) throw insertError;
                    return { success: true, id: inserted?.id };
                }
            }

            return { success: true, id: savedData?.id };
        } catch (error) {
            console.error('Failed to save to cloud:', error);
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

export const getLayoutById = async (layoutId: string) => {
    const { data, error } = await supabase
        .from('layouts')
        .select('*')
        .eq('id', layoutId)
        .maybeSingle();

    if (error) throw error;
    return data;
};
