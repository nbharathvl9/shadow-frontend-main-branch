import './globals.css';
import NotificationProvider from './components/Notification';

export const metadata = {
    title: 'Shadow Attendance',
    description: 'Minimal attendance tracker',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </body>
        </html>
    );
}
