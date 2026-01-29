import { useState } from 'react';
import { X, Clock, Calendar, Plus, Check, Trash2, Bell, BellOff, Sparkles, FileText, Briefcase } from 'lucide-react';
import type { JobApplication, TimelineEvent, Reminder } from '../types';
import { getStatusOption } from '../lib/statusConfig';
import { useNotifications } from '../hooks/useNotifications';
import { AiMessageGenerator } from './features/AiMessageGenerator';

interface ApplicationDetailModalProps {
    application: JobApplication;
    onClose: () => void;
    onUpdate: (id: string, data: Partial<JobApplication>) => Promise<void>;
}

export const ApplicationDetailModal = ({ application, onClose, onUpdate }: ApplicationDetailModalProps) => {
    const [activeTab, setActiveTab] = useState<'timeline' | 'reminders' | 'analysis' | 'preparation'>('timeline');
    const [newReminderDate, setNewReminderDate] = useState('');
    const [newReminderTime, setNewReminderTime] = useState('');
    const [newReminderMessage, setNewReminderMessage] = useState('');
    const { scheduleNotification } = useNotifications();

    const timeline = application.timeline || [];
    const reminders = application.reminders || [];

    const addReminder = async () => {
        if (!newReminderDate || !newReminderMessage) return;

        const reminderTime = newReminderTime || '09:00';
        const newReminder: Reminder = {
            id: Date.now().toString(),
            date: newReminderDate,
            time: reminderTime,
            message: newReminderMessage,
            completed: false
        };

        // Schedule Notification if in future
        const targetDate = new Date(`${newReminderDate}T${reminderTime}`);
        const delay = targetDate.getTime() - Date.now();
        if (delay > 0) {
            scheduleNotification(application.company, newReminderMessage, delay);
        }

        await onUpdate(application.id, {
            reminders: [...reminders, newReminder]
        });

        setNewReminderDate('');
        setNewReminderTime('');
        setNewReminderMessage('');
    };

    const toggleReminder = async (id: string) => {
        const updated = reminders.map(r =>
            r.id === id ? { ...r, completed: !r.completed } : r
        );
        await onUpdate(application.id, { reminders: updated });
    };

    const deleteReminder = async (id: string) => {
        const updated = reminders.filter(r => r.id !== id);
        await onUpdate(application.id, { reminders: updated });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-[2.5rem] shadow-2xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] overflow-hidden flex flex-col border border-white/20">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{application.company}</h2>
                            <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                                {application.status}
                            </div>
                        </div>
                        <p className="text-xl text-blue-600 dark:text-blue-400 font-bold">{application.position}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-8 pt-6 flex gap-1 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`px-6 py-3 text-sm font-bold rounded-t-2xl transition-all ${activeTab === 'timeline' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Timeline & Notes
                    </button>
                    <button
                        onClick={() => setActiveTab('reminders')}
                        className={`px-6 py-3 text-sm font-bold rounded-t-2xl transition-all ${activeTab === 'reminders' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Rappels
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`px-6 py-3 text-sm font-bold rounded-t-2xl transition-all ${activeTab === 'analysis' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'} flex items-center gap-2`}
                    >
                        <Sparkles size={16} /> Contact IA
                    </button>
                    <button
                        onClick={() => setActiveTab('preparation')}
                        className={`px-6 py-3 text-sm font-bold rounded-t-2xl transition-all ${activeTab === 'preparation' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'} flex items-center gap-2`}
                    >
                        <Briefcase size={16} /> Préparation
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/50">
                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            {application.notes && (
                                <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                        <X size={18} className="text-blue-500 rotate-45" /> Notes de suivi
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{application.notes}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 dark:text-white pl-2">Historique des changements</h4>
                                {timeline.length === 0 ? (
                                    <p className="text-slate-400 italic text-sm pl-2">Aucun événement enregistré.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {timeline.map((event, i) => (
                                            <div key={i} className="flex gap-4 group">
                                                <div className="w-10 flex flex-col items-center">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                                    {i !== timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 my-2"></div>}
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Date(event.date).toLocaleDateString('fr-FR')}</div>
                                                    <div className="font-bold text-slate-800 dark:text-slate-200">{event.title}</div>
                                                    {event.description && <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{event.description}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reminders' && (
                        <div className="space-y-6">
                            {/* Add Reminder Form */}
                            <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-4">Ajouter un rappel</h4>
                                <div className="flex flex-wrap gap-3">
                                    <input
                                        type="date"
                                        value={newReminderDate}
                                        onChange={(e) => setNewReminderDate(e.target.value)}
                                        className="flex-1 min-w-[150px] p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm"
                                    />
                                    <input
                                        type="time"
                                        value={newReminderTime}
                                        onChange={(e) => setNewReminderTime(e.target.value)}
                                        className="w-32 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Message de notification..."
                                        value={newReminderMessage}
                                        onChange={(e) => setNewReminderMessage(e.target.value)}
                                        className="flex-[2] min-w-[200px] p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm"
                                    />
                                    <button
                                        onClick={addReminder}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Reminder List */}
                            <div className="space-y-3">
                                {reminders.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 italic">Aucun rappel pour le moment.</div>
                                ) : (
                                    reminders.map((reminder) => (
                                        <div
                                            key={reminder.id}
                                            className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${reminder.completed ? 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => toggleReminder(reminder.id)}
                                                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${reminder.completed ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'}`}
                                                >
                                                    {reminder.completed && <Check size={14} strokeWidth={3} />}
                                                </button>
                                                <div>
                                                    <div className={`font-bold ${reminder.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {reminder.message}
                                                    </div>
                                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mt-0.5">
                                                        <Calendar size={10} /> {new Date(reminder.date).toLocaleDateString('fr-FR')} à {reminder.time}
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => deleteReminder(reminder.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            <AiMessageGenerator application={application} />

                            <div className="mt-8 space-y-6">
                                <h4 className="font-bold text-slate-800 dark:text-white pl-2 flex items-center gap-2">
                                    <Sparkles className="text-purple-500" size={18} /> Conseils de candidature
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                                        <div className="font-bold text-emerald-700 dark:text-emerald-400 mb-2">Points Forts</div>
                                        <ul className="text-sm text-emerald-600 dark:text-emerald-500 space-y-1 list-disc pl-4">
                                            <li>Salaire dans ta fourchette cible</li>
                                            <li>Stack technique maîtrisée (React, Node)</li>
                                            <li>Politique Remote avantageuse</li>
                                        </ul>
                                    </div>
                                    <div className="p-5 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                                        <div className="font-bold text-orange-700 dark:text-orange-400 mb-2">Points Vigilance</div>
                                        <ul className="text-sm text-orange-600 dark:text-orange-500 space-y-1 list-disc pl-4">
                                            <li>Secteur d'activité très concurrentiel</li>
                                            <li>Processus de recrutement long (4 étapes)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preparation' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                                            <FileText size={16} />
                                        </div>
                                        Pitch Gagnant
                                    </h4>
                                    <textarea
                                        placeholder="Ton introduction personnalisée pour ce poste..."
                                        className="w-full h-32 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600">
                                            <Plus size={16} />
                                        </div>
                                        Questions à Poser
                                    </h4>
                                    <textarea
                                        placeholder="Liste les questions clés pour le recruteur..."
                                        className="w-full h-32 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-400 mb-4 flex items-center gap-2">
                                    <Sparkles size={18} /> Points Techniques Clés
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {['React 19', 'Zustand', 'Web Workers', 'PWA'].map(tech => (
                                        <span key={tech} className="px-3 py-1 bg-white dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                                            {tech}
                                        </span>
                                    ))}
                                    <button className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 transition-colors">+ Ajouter</button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
