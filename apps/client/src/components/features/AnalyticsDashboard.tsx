import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import type { JobApplication } from '../../types';
import { TrendingUp, PieChart, BarChart3, Filter, Zap } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AnalyticsDashboardProps {
    applications: JobApplication[];
}

export const AnalyticsDashboard = ({ applications }: AnalyticsDashboardProps) => {

    // 1. Status Distribution (Doughnut)
    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const doughnutData = {
        labels: Object.keys(statusCounts),
        datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(139, 92, 246, 0.7)',
                'rgba(239, 68, 68, 0.7)',
            ],
            borderColor: 'white',
            borderWidth: 2,
            hoverOffset: 10
        }]
    };

    // 2. Conversion Funnel (Bar - Phase 3)
    const funnelStages = [
        { label: 'Candidatures', count: applications.length, color: 'rgba(59, 130, 246, 0.8)' },
        { label: 'CV Lus', count: applications.filter(a => ['CV Vu', 'En Cours d\'Examen', 'Test Technique Reçu', 'Entretien RH Programmé', 'Entretien RH Passé', 'Entretien Technique Programmé', 'Entretien Technique Passé', 'Entretien Final Programmé', 'Entretien Final Passé', 'Négociation Salaire', 'Offre Reçue', 'Offre Acceptée'].includes(a.status)).length, color: 'rgba(99, 102, 241, 0.8)' },
        { label: 'Entretiens', count: applications.filter(a => a.status.includes('Entretien') || a.status.includes('Offre')).length, color: 'rgba(139, 92, 246, 0.8)' },
        { label: 'Offres', count: applications.filter(a => a.status.includes('Offre')).length, color: 'rgba(16, 185, 129, 0.8)' }
    ];

    const funnelData = {
        labels: funnelStages.map(s => s.label),
        datasets: [{
            label: 'Candidatures',
            data: funnelStages.map(s => s.count),
            backgroundColor: funnelStages.map(s => s.color),
            borderRadius: 12,
            barThickness: 40
        }]
    };

    // 3. Source Performance (Bar - Phase 3)
    const sources = applications.reduce((acc, app) => {
        const source = app.source || 'Inconnu';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sourceData = {
        labels: Object.keys(sources),
        datasets: [{
            label: 'Candidatures par Source',
            data: Object.values(sources),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
            borderRadius: 8
        }]
    };

    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1e293b',
                bodyColor: '#475569',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
                displayColors: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    const doughnutOptions: any = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 11, weight: '600' }
                }
            }
        }
    };

    return (
        <div className="space-y-8 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Status Distribution */}
                <div className="glass-panel p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                            <PieChart className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">Répartition</h3>
                            <p className="text-sm text-slate-500">Aperçu global de tes candidatures</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>

                {/* 2. Funnel de Conversion */}
                <div className="glass-panel p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                            <Zap className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">Funnel de Succès</h3>
                            <p className="text-sm text-slate-500">Ton taux de conversion par étape</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <Bar data={funnelData} options={chartOptions} />
                    </div>
                </div>

                {/* 3. Source Performance */}
                <div className="glass-panel p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm lg:col-span-2">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                            <BarChart3 className="text-emerald-600 dark:text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">Performance des Sources</h3>
                            <p className="text-sm text-slate-500">Quelles plateformes t'apportent le plus d'opportunités</p>
                        </div>
                    </div>
                    <div className="h-80">
                        <Bar data={sourceData} options={{ ...chartOptions, indexAxis: 'y' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
