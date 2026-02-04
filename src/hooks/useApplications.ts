import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { JobApplication } from '../types';
import { migrateOldStatus } from '../lib/statusMigration';
import { toDbFormat, fromDbFormat } from '../lib/dbMapping';

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

            const apps = (data || []).map(d => {
                const app = fromDbFormat(d);
                return {
                    ...app,
                    status: migrateOldStatus(d.status),
                };
            }) as JobApplication[];

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
            a.status === 'Candidature EnvoyÃ©e' ||
            a.status === 'CV Vu' ||
            a.status === 'En Cours d\'Examen'
        ).length;
        const interview = apps.filter(a => a.status.includes('Entretien') || a.status.includes('Test Technique')).length;
        const offer = apps.filter(a => a.status.includes('Offre')).length;
        const activeApps = total - apps.filter(a => a.status === 'Ã€ Postuler' || a.status === 'Brouillon').length;
        const positiveResponses = interview + offer;
        const cvImpact = activeApps > 0 ? Math.round((positiveResponses / activeApps) * 100) : 0;
        const conversion = (interview + offer) > 0 ? Math.round((offer / (interview + offer)) * 100) : 0;
        setStats({ total, sent, interview, offer, cvImpact, conversion });
    };

    const addApplication = async (data: Omit<JobApplication, 'id'>) => {
        if (!userId) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbData = toDbFormat({ ...data, userId } as any);

        // Optimistic update (requires a temp ID or full reload, here we prefer reload for Add to get ID)
        const { data: returnedData, error } = await supabase
            .from('applications')
            .insert([dbData])
            .select() // Return data to get the new ID
            .single();

        if (error) throw error;

        // Manually update local state with returned data
        if (returnedData) {
            const newApp = { ...fromDbFormat(returnedData), status: migrateOldStatus(returnedData.status) } as JobApplication;
            setApplications(prev => [newApp, ...prev]);
            calculateStats([newApp, ...applications]);
        }
    };

    const updateApplication = async (id: string, data: Partial<JobApplication>) => {
        if (!userId) return;

        // Optimistic Update
        setApplications(prev => {
            const updated = prev.map(app => app.id === id ? { ...app, ...data } : app);
            calculateStats(updated);
            return updated;
        });

        const dbData = toDbFormat(data);
        const { error } = await supabase
            .from('applications')
            .update(dbData)
            .eq('id', id);

        if (error) {
            // Revert on error (fetching original data would be safer but complex, keeping simple for now)
            fetchApplications();
            throw error;
        }
    };

    const deleteApplication = async (id: string) => {
        if (!userId) return;

        // Optimistic Update
        setApplications(prev => {
            const updated = prev.filter(app => app.id !== id);
            calculateStats(updated);
            return updated;
        });

        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', id);

        if (error) {
            fetchApplications();
            throw error;
        }
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
