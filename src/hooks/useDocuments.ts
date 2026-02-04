import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from '../context/ToastContext';

export interface Document {
    id: string;
    user_id: string;
    name: string;
    type: string; // 'CV', 'LM', 'Certificat', 'Autre'
    path: string;
    size: string;
    status: string;
    created_at: string;
    url?: string;
}

export const useDocuments = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchDocuments();
        }
    }, [user]);

    const fetchDocuments = async () => {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get public URLs for each document
            const docsWithUrls = data.map(doc => {
                const { data: { publicUrl } } = supabase.storage
                    .from('documents')
                    .getPublicUrl(doc.path);
                return { ...doc, url: publicUrl };
            });

            setDocuments(docsWithUrls);
        } catch (error) {
            console.error('Error fetching documents:', error);
            showToast('Erreur lors du chargement des documents', 'error');
        } finally {
            setLoading(false);
        }
    };

    const uploadDocument = async (file: File, type: string) => {
        if (!user) return;
        setUploading(true);

        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Insert into Database
            const { data, error: dbError } = await supabase
                .from('documents')
                .insert([
                    {
                        user_id: user.id,
                        name: file.name,
                        type: type,
                        path: filePath,
                        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                        status: 'Actif'
                    }
                ])
                .select()
                .single();

            if (dbError) throw dbError;

            showToast('Document importÃ© avec succÃ¨s', 'success');
            fetchDocuments(); // Refresh list
            return data;
        } catch (error: any) {
            console.error('Upload Error:', error);
            showToast(error.message || "Erreur lors de l'import", 'error');
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const deleteDocument = async (id: string, path: string) => {
        try {
            // 1. Delete from Storage
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([path]);

            if (storageError) throw storageError;

            // 2. Delete from Database
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            showToast('Document supprimÃ©', 'success');
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error('Delete Error:', error);
            showToast("Erreur lors de la suppression", 'error');
        }
    };

    return {
        documents,
        loading,
        uploading,
        uploadDocument,
        deleteDocument,
        refreshDocuments: fetchDocuments
    };
};
