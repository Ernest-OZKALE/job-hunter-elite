self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate');
});

// Listen for messages from the client to schedule notifications
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { title, body, delay } = event.data;
        console.log('[Service Worker] Scheduling notification:', title, 'in', delay, 'ms');

        setTimeout(() => {
            self.registration.showNotification(title, {
                body,
                icon: '/vite.svg', // Use existing icon for now
                vibrate: [200, 100, 200]
            });
        }, delay);
    }
});
