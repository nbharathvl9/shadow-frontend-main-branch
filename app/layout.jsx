import './globals.css';

export const metadata = {
    title: 'Shadow Attendance',
    description: 'Minimal attendance tracker',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}