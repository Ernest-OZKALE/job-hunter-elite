import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useStorage = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = async (file: File, path: string) => {
        setIsUploading(true);
        try {
            // Upload to Supabase Storage
            // Using a 'documents' bucket. User must create it in Supabase.
            const { data, error } = await supabase.storage
                .from('documents')
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(data.path);

            return publicUrl;
        } catch (error: any) {
            console.error("Upload failed", error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const deleteFile = async (path: string) => {
        try {
            const { error } = await supabase.storage
                .from('documents')
                .remove([path]);
            if (error) throw error;
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const getFileBlob = async (_url: string) => {
        return null; // Keep for compatibility
    };

    return { uploadFile, deleteFile, getFileBlob, isUploading };
};
