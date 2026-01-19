"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function AdminLogin() {
    const router = useRouter();
    const [className, setClassName] = useState('');
    const [adminPin, setAdminPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/class/admin-login', { className, adminPin });

            // Save classId to localStorage after successful verification
            localStorage.setItem('adminClassId', res.data.classId);

            alert('Login Successful! ✅');
            router.push('/admin/dashboard');
        } catch (err) {
            if (err.response?.status === 401) {
                alert('Invalid PIN! ❌');
            } else if (err.response?.status === 404) {
                alert('Class not found! ❌');
            } else {
                alert('Login failed! ❌');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50 text-gray-800">

            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">Admin Login 🔐</h1>
                <p className="text-gray-500 mt-2">Enter your Class Name and PIN</p>
            </div>

            <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl">
                <form onSubmit={handleLogin} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-300 uppercase"
                            placeholder="e.g. CSE-3A"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin PIN</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-300"
                            placeholder="****"
                            value={adminPin}
                            onChange={(e) => setAdminPin(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all flex justify-center"
                    >
                        {loading ? "Verifying..." : "Login 🚀"}
                    </button>
                </form>
            </div>

            <div className="mt-10 flex gap-6 text-sm text-gray-400">
                <button onClick={() => router.push('/')} className="hover:text-gray-600 hover:underline">
                    ← Back to Home
                </button>
                <span>|</span>
                <button onClick={() => router.push('/admin/create')} className="hover:text-gray-600 hover:underline">
                    Create New Class
                </button>
            </div>

        </div>
    );
}
