import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { MoodLog } from '../types';

export const useMoodLogs = (userId: string | undefined) => {
    const [moods, setMoods] = useState<MoodLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMoods = async () => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });

            if (error) throw error;
            setMoods(data || []);
        } catch (error) {
            console.error('Mood fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMoods();
    }, [userId]);

    const addMood = async (level: number, note: string) => {
        if (!userId) return;
        const { error } = await supabase
            .from('mood_logs')
            .insert([{ user_id: userId, level, note, date: new Date().toISOString().split('T')[0] }]);

        if (error) throw error;
        fetchMoods();
    };

    return { moods, loading, addMood };
};
