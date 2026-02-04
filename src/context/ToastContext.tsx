import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/ui/Toast';
import type { ToastMessage, ToastType } from '../components/ui/Toast';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString() + Math.random().toString();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-20 right-4 md:right-6 z-[9999] flex flex-col items-end pointer-events-none">
                {/* Pointer events auto so clicks work on toasts, but pass through container */}
                <div className="pointer-events-auto">
                    {toasts.map(toast => (
                        <Toast key={toast.id} toast={toast} onClose={removeToast} />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
