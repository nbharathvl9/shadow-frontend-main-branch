'use client';
import { useState, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const NotificationContext = createContext(null);

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        // Fallback for when used outside provider or during SSR
        return ({ message }) => console.log('Notification:', message);
    }
    return context;
}

export default function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback(({ message, type = 'success', duration = 3000 }) => {
        setNotification({ message, type });
        if (duration > 0) {
            setTimeout(() => setNotification(null), duration);
        }
    }, []);

    const closeNotification = () => setNotification(null);

    return (
        <NotificationContext.Provider value={showNotification}>
            {children}
            {notification && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                    <div className={`
                        flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border text-sm
                        ${notification.type === 'success'
                            ? 'bg-green-600 border-green-500 text-white'
                            : 'bg-red-600 border-red-500 text-white'
                        }
                        min-w-[280px] max-w-sm
                    `}>
                        {notification.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="flex-1 font-medium">{notification.message}</span>
                        <button
                            onClick={closeNotification}
                            className="hover:bg-white/20 rounded-full p-1 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
}
