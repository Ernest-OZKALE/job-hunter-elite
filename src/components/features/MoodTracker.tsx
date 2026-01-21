import { useState } from 'react';
import { Smile, Frown, Meh, Laugh, Angry, MessageSquare, History } from 'lucide-react';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useAuth } from '../../hooks/useAuth';

const MOODS = [
    { level: 1, icon: <Angry className="text-red-500" />, label: 'En colère/Frustré' },
    { level: 2, icon: <Frown className="text-orange-500" />, label: 'Déçu/Triste' },
    { level: 3, icon: <Meh className="text-amber-500" />, label: 'Moyen' },
    { level: 4, icon: <Smile className="text-blue-500" />, label: 'Bien' },
    { level: 5, icon: <Laugh className="text-emerald-500" />, label: 'Excellent !' },
];

export const MoodTracker = () => {
    const { user } = useAuth();
    const { moods, loading, addMood } = useMoodLogs(user?.id);

    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const handleSave = async () => {
        if (!selectedLevel) return;
        await addMood(selectedLevel, note.trim());
        setSelectedLevel(null);
        setNote('');
    };

    const todayLog = moods.find(m => m.date.startsWith(new Date().toISOString().split('T')[0]));

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Smile className="text-blue-500" size={20} /> Mood Tracker
                </h3>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
                >
                    <History size={18} />
                </button>
            </div>

            {todayLog && !showHistory ? (
                <div className="text-center py-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                    <div className="flex justify-center mb-2 text-3xl">
                        {MOODS.find(m => m.level === todayLog.level)?.icon}
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">Humeur enregistrée !</p>
                    {todayLog.note && <p className="text-xs text-emerald-600/70 mt-1 italic">"{todayLog.note}"</p>}
                </div>
            ) : showHistory ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {moods.length === 0 && <p className="text-center text-slate-400 py-8 text-sm italic">Aucun historique.</p>}
                    {moods.map(log => (
                        <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {MOODS.find(m => m.level === log.level)?.icon}
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">
                                        {new Date(log.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </p>
                                    {log.note && <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{log.note}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    <p className="text-sm text-slate-500 text-center">Comment se passe ta recherche aujourd'hui ?</p>

                    <div className="flex justify-between items-center px-2">
                        {MOODS.map((m) => (
                            <button
                                key={m.level}
                                onClick={() => setSelectedLevel(m.level)}
                                className={`p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 ${selectedLevel === m.level ? 'bg-slate-100 dark:bg-slate-700 ring-2 ring-blue-500/20 scale-125' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                            >
                                <div className="text-2xl">{m.icon}</div>
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 text-slate-400" size={16} />
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Un commentaire ? (Optionnel)"
                            className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                            rows={2}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!selectedLevel}
                        className={`w-full py-3 rounded-2xl font-bold transition-all shadow-lg ${selectedLevel ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                    >
                        Valider l'humeur
                    </button>
                </div>
            )}
        </div>
    );
};
