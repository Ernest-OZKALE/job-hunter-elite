import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo } from 'lucide-react';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
}

interface TaskManagerProps {
    tasks: Task[];
    onAddTask: (text: string) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
}

export const TaskManager = ({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskManagerProps) => {
    const [newTask, setNewTask] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (newTask.trim()) {
            onAddTask(newTask.trim());
            setNewTask('');
            setIsAdding(false);
        }
    };

    const completedCount = tasks.filter(t => t.completed).length;

    // Preset quick tasks
    const quickTasks = [
        'Préparer test technique',
        'Relire offre',
        'Préparer entretien',
        'Envoyer lettre motivation',
        'Rechercher l\'entreprise'
    ];

    return (
        <div className="space-y-3">
            {/* Header with progress */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListTodo size={16} className="text-slate-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Tâches ({completedCount}/{tasks.length})
                    </span>
                </div>
                {tasks.length > 0 && (
                    <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${task.completed
                                ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                : 'bg-slate-50 dark:bg-slate-700/50'
                            }`}
                    >
                        <button
                            onClick={() => onToggleTask(task.id)}
                            className="flex-shrink-0"
                        >
                            {task.completed ? (
                                <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                                <Circle size={18} className="text-slate-400 hover:text-slate-600" />
                            )}
                        </button>
                        <span className={`flex-1 text-sm ${task.completed
                                ? 'text-slate-400 line-through'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                            {task.text}
                        </span>
                        <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Task */}
            {isAdding ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        placeholder="Nouvelle tâche..."
                        className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                    <button
                        onClick={handleAdd}
                        className="px-3 py-2 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                        Ajouter
                    </button>
                    <button
                        onClick={() => { setIsAdding(false); setNewTask(''); }}
                        className="px-3 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full px-3 py-2 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        Ajouter une tâche
                    </button>

                    {/* Quick add buttons */}
                    {tasks.length === 0 && (
                        <div className="flex flex-wrap gap-1">
                            {quickTasks.slice(0, 3).map(qt => (
                                <button
                                    key={qt}
                                    onClick={() => onAddTask(qt)}
                                    className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    + {qt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
