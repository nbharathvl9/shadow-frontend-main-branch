"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function Home() {
    const [formData, setFormData] = useState({ className: '', rollNumber: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // 1. "Remember Me" Check on Load
    useEffect(() => {
        const savedClassId = localStorage.getItem('studentClassId');
        const savedRoll = localStorage.getItem('studentRoll');

        if (savedClassId && savedRoll) {
            // Auto-Login if data exists
            router.push(`/student/${savedClassId}/${savedRoll}`);
        }
    }, [router]);

    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 2. Lookup the Class ID using the Name
            const res = await api.get(`/class/lookup/${formData.className.trim()}`);

            const classId = res.data.classId;
            const roll = formData.rollNumber;

            // 3. Save to LocalStorage (Remember Me)
            localStorage.setItem('studentClassId', classId);
            localStorage.setItem('studentRoll', roll);

            // 4. Redirect
            router.push(`/student/${classId}/${roll}`);

        } catch (err) {
            alert("Class not found! Please check the name (e.g., CSE-3A).");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50 text-gray-800">

            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">Shadow Attendance</h1>
                <p className="text-gray-500 mt-2">Track your bunks safely.</p>
            </div>

            <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl">
                <form onSubmit={handleStudentLogin} className="space-y-4">

                    {/* Changed Input: Class Name instead of ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase placeholder-gray-300"
                            placeholder="e.g. CSE-3A"
                            value={formData.className}
                            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-300"
                            placeholder="e.g. 5"
                            value={formData.rollNumber}
                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all flex justify-center"
                    >
                        {loading ? "Searching..." : "Check Attendance 🚀"}
                    </button>
                </form>
            </div>

            <div className="mt-10 flex gap-6 text-sm text-gray-400">
                <button onClick={() => router.push('/admin/create')} className="hover:text-gray-600 hover:underline">
                    Create Class
                </button>
                <span>|</span>
                <button onClick={() => router.push('/admin/login')} className="hover:text-gray-600 hover:underline">
                    Admin Login
                </button>
            </div>

        </div>
    );
}