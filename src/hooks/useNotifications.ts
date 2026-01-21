import { useState, useEffect } from 'react';

export const useNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            return;
        }
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    };

    const sendNotification = (title: string, body: string) => {
        if (permission === 'granted') {
            // Direct notification if supported and ready (for immediate feedback)
            // For scheduled ones, we would rely on the SW or simple timeouts if app is open
            // Since this is a simple implementation, we'll try basic Notification API first
            new Notification(title, { body, icon: '/vite.svg' });

            // If we want it to work in background via SW (requires SW to be active and handling push/sync which is complex for local without simple timeouts)
            // simpler approach for MVP: usage of standard Notification API which works when tab is open/minimized.
        }
    };

    const scheduleNotification = (title: string, body: string, delayMs: number) => {
        if (permission === 'granted' && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SCHEDULE_NOTIFICATION',
                title,
                body,
                delay: delayMs
            });
        } else if (permission === 'granted') {
            // Fallback if SW not ready
            setTimeout(() => sendNotification(title, body), delayMs);
        }
    };

    return { permission, requestPermission, sendNotification, scheduleNotification };
};
