import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { JobApplication } from '../types';
import { migrateOldStatus } from '../lib/statusMigration';

export const useApplications = (userId: string | undefined) => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0, sent: 0, interview: 0, offer: 0, cvImpact: 0, conversion: 0
    });

    const fetchApplications = async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });

            if (error) throw error;

            const apps = (data || []).map(d => ({
                ...d,
                status: migrateOldStatus(d.status),
                attachments: d.attachments || []
            })) as JobApplication[];

            setApplications(apps);
            calculateStats(apps);
        } catch (error) {
            console.error('Supabase Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) {
            setApplications([]);
            setLoading(false);
            return;
        }

        fetchApplications();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('applications_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'applications', filter: `user_id=eq.${userId}` },
                () => {
                    fetchApplications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const calculateStats = (apps: JobApplication[]) => {
        const total = apps.length;
        const sent = apps.filter(a =>
            a.status === 'Candidature Envoyée' ||
            a.status === 'CV Vu' ||
            a.status === 'En Cours d\'Examen'
        ).length;
        const interview = apps.filter(a => a.status.includes('Entretien') || a.status.includes('Test Technique')).length;
        const offer = apps.filter(a => a.status.includes('Offre')).length;
        const activeApps = total - apps.filter(a => a.status === 'À Postuler' || a.status === 'Brouillon').length;
        const positiveResponses = interview + offer;
        const cvImpact = activeApps > 0 ? Math.round((positiveResponses / activeApps) * 100) : 0;
        const conversion = (interview + offer) > 0 ? Math.round((offer / (interview + offer)) * 100) : 0;
        setStats({ total, sent, interview, offer, cvImpact, conversion });
    };

    const addApplication = async (data: Omit<JobApplication, 'id'>) => {
        if (!userId) return;
        const { error } = await supabase
            .from('applications')
            .insert([{ ...data, user_id: userId }]);

        if (error) throw error;
    };

    const updateApplication = async (id: string, data: Partial<JobApplication>) => {
        if (!userId) return;
        const { error } = await supabase
            .from('applications')
            .update(data)
            .eq('id', id);

        if (error) throw error;
    };

    const deleteApplication = async (id: string) => {
        if (!userId) return;
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', id);

        if (error) throw error;
    };

    return {
        applications,
        stats,
        loading,
        addApplication,
        updateApplication,
        deleteApplication
    };
};
