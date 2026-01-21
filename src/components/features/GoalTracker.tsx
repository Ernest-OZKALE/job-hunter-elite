import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Trophy, Flame } from 'lucide-react';
import type { JobApplication } from '../../types';
import { useGoals, type Goal } from '../../hooks/useGoals';

interface GoalTrackerProps {
    applications: JobApplication[];
}

export const GoalTracker = ({ applications }: GoalTrackerProps) => {
    const { goals, loading, addGoal, deleteGoal } = useGoals();
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [newGoalType, setNewGoalType] = useState<'weekly' | 'monthly'>('weekly');
    const [newGoalTarget, setNewGoalTarget] = useState(5);

    const getProgress = (goal: Goal) => {
        const now = new Date();
        let startDate: Date;

        if (goal.type === 'weekly') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        startDate.setHours(0, 0, 0, 0);

        const count = applications.filter(app => new Date(app.date) >= startDate).length;
        return { count, percentage: Math.min(100, Math.round((count / goal.target) * 100)) };
    };

    const handleAddGoal = async () => {
        await addGoal(newGoalType, newGoalTarget);
        setShowAddGoal(false);
    };

    // Calculate streak
    const calculateStreak = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        let currentDate = new Date(today);

        // Simple loop to check last 365 days mostly
        for (let i = 0; i < 365; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const hasApp = applications.some(app => app.date.startsWith(dateStr));

            if (hasApp) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                // Check if today has no application yet, maybe streak is from yesterday
                // But for simplicity, we count consecutive days with applications
                if (i === 0) {
                    currentDate.setDate(currentDate.getDate() - 1);
                    continue; // check yesterday
                }
                break;
            }
        }
        return streak;
    };

    const streak = calculateStreak();

    if (loading) return null; // Or a skeleton

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target className="text-indigo-500" size={20} />
                    <h3 className="font-bold text-slate-900 dark:text-white">Objectifs</h3>
                </div>
                <button
                    onClick={() => setShowAddGoal(!showAddGoal)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <Plus size={18} className="text-slate-500" />
                </button>
            </div>

            {/* Streak Display */}
            {streak > 0 && (
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center gap-3 text-white">
                    <Flame size={24} />
                    <div>
                        <p className="font-black text-lg">{streak} jour{streak > 1 ? 's' : ''} 🔥</p>
                        <p className="text-xs text-orange-100">Série de candidatures consécutives</p>
                    </div>
                </div>
            )}

            {/* Add Goal Form */}
            {showAddGoal && (
                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl space-y-3">
                    <div className="flex gap-2">
                        <select
                            value={newGoalType}
                            onChange={e => setNewGoalType(e.target.value as 'weekly' | 'monthly')}
                            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-sm"
                        >
                            <option value="weekly">Hebdomadaire</option>
                            <option value="monthly">Mensuel</option>
                        </select>
                        <input
                            type="number"
                            value={newGoalTarget}
                            onChange={e => setNewGoalTarget(Number(e.target.value))}
                            min={1}
                            max={100}
                            className="w-20 px-3 py-2 rounded-lg bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-sm"
                        />
                    </div>
                    <button
                        onClick={handleAddGoal}
                        className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600 transition-colors"
                    >
                        Ajouter
                    </button>
                </div>
            )}

            {/* Goals List */}
            <div className="space-y-3">
                {goals.map(goal => {
                    const { count, percentage } = getProgress(goal);
                    const isComplete = percentage >= 100;

                    return (
                        <div key={goal.id} className="relative">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {goal.type === 'weekly' ? '📅 Cette semaine' : '📆 Ce mois'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {count}/{goal.target}
                                    </span>
                                    {isComplete && <Trophy size={16} className="text-amber-500" />}
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                    >
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${isComplete
                                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
