import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from '../context/ToastContext';

export interface Contact {
    id: string;
    user_id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    linkedin: string;
    role: string;
    notes: string;
    created_at: string;
}

export const useContacts = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchContacts();
        }
    }, [user]);

    const fetchContacts = async () => {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContacts(data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showToast('Erreur lors du chargement des contacts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addContact = async (contact: Omit<Contact, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('contacts')
                .insert([{ ...contact, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;

            setContacts(prev => [data, ...prev]);
            showToast('Contact ajouté', 'success');
            return data;
        } catch (error: any) {
            console.error('Error adding contact:', error);
            showToast(error.message || "Erreur lors de l'ajout", 'error');
            throw error;
        }
    };

    const updateContact = async (id: string, updates: Partial<Contact>) => {
        try {
            const { error } = await supabase
                .from('contacts')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
            showToast('Contact mis à jour', 'success');
        } catch (error: any) {
            console.error('Error updating contact:', error);
            showToast("Erreur lors de la mise à jour", 'error');
            throw error;
        }
    };

    const deleteContact = async (id: string) => {
        try {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setContacts(prev => prev.filter(c => c.id !== id));
            showToast('Contact supprimé', 'success');
        } catch (error) {
            console.error('Error deleting contact:', error);
            showToast("Erreur lors de la suppression", 'error');
        }
    };

    return {
        contacts,
        loading,
        addContact,
        updateContact,
        deleteContact,
        refreshContacts: fetchContacts
    };
};
