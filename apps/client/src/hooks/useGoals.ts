import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from '../context/ToastContext';

export interface Goal {
    id: string;
    user_id: string;
    type: 'weekly' | 'monthly';
    target: number;
    created_at: string;
}

export const useGoals = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchGoals();
        }
    }, [user]);

    const fetchGoals = async () => {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error('Error fetching goals:', error);
            // Silent error or toast? Silent might be better for an init fetch
        } finally {
            setLoading(false);
        }
    };

    const addGoal = async (type: 'weekly' | 'monthly', target: number) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('goals')
                .insert([{
                    user_id: user.id,
                    type,
                    target
                }])
                .select()
                .single();

            if (error) throw error;

            setGoals(prev => [...prev, data]);
            showToast('Objectif ajouté', 'success');
            return data;
        } catch (error: any) {
            console.error('Error adding goal:', error);
            showToast("Erreur lors de l'ajout", 'error');
            throw error;
        }
    };

    const deleteGoal = async (id: string) => {
        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setGoals(prev => prev.filter(g => g.id !== id));
            showToast('Objectif supprimé', 'success');
        } catch (error) {
            console.error('Error deleting goal:', error);
            showToast("Erreur lors de la suppression", 'error');
        }
    };

    return {
        goals,
        loading,
        addGoal,
        deleteGoal
    };
};
