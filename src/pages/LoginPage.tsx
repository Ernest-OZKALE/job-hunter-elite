import { Briefcase } from 'lucide-react';

interface LoginPageProps {
    onLogin: () => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-white font-sans">
            <div className="bg-blue-600 p-4 rounded-2xl mb-6 shadow-lg shadow-blue-900/50">
                <Briefcase size={48} className="text-white" />
            </div>
            <h1 className="text-5xl font-black mb-2 tracking-tight">JOB HUNTER <span className="text-blue-500">ELITE</span></h1>
            <p className="text-slate-400 mb-8 text-center max-w-md text-lg">
                Votre plateforme tactique de recherche d'emploi. Centralisez, analysez, gagnez.
            </p>
            <button onClick={onLogin} className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all transform hover:scale-105 shadow-xl">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Connexion Google
            </button>
        </div>
    );
};
