import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

export const Toast = ({ toast, onClose }: ToastProps) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onClose(toast.id), 300); // Wait for exit animation
        }, 4000);

        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(toast.id), 300);
    };

    const icons = {
        success: <CheckCircle className="text-emerald-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />
    };

    const borders = {
        success: 'border-l-emerald-500',
        error: 'border-l-red-500',
        info: 'border-l-blue-500'
    };

    return (
        <div
            className={`
                bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-lg shadow-slate-200/20 
                rounded-xl p-4 pr-10 mb-3 flex items-start gap-3 w-80 md:w-96 relative overflow-hidden
                transform transition-all duration-300 ease-in-out border-l-4
                ${borders[toast.type]}
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0 animate-in slide-in-from-right-full'}
            `}
        >
            <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
            <div>
                <p className="text-sm font-semibold text-slate-800 leading-snug">{toast.message}</p>
            </div>
            <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};
