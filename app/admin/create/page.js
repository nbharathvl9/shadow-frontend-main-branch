"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import api from '@/utils/api';

export default function CreateClass() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        className: '',
        totalStudents: '',
        adminPin: ''
    });

    const [subjects, setSubjects] = useState([{ name: '', code: '' }]);

    const addSubject = () => {
        setSubjects([...subjects, { name: '', code: '' }]);
    };

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...subjects];
        newSubjects[index][field] = value;
        setSubjects(newSubjects);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                subjects: subjects,
                timetable: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] }
            };

            const res = await api.post('/class/create', payload);

            // 1. Save Token & ID (Auto-Login)
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('adminClassId', res.data.classId);

            alert(`Class Created Successfully! 🚀\n\nYou are now logged in as admin for ${formData.className}.`);
            
            // 2. Redirect to Dashboard
            router.push('/admin/dashboard');

        } catch (err) {
            alert('Error creating class. Check console.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="max-w-md mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Create New Class</h1>
                    <p>Set up your class for attendance tracking</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-dim)] mb-2">Class Name</label>
                            <input
                                required
                                className="input"
                                placeholder="e.g. CSE-3A"
                                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                            />
                            <p className="text-xs text-[var(--text-dim)] mt-1">You'll use this to login as admin</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-dim)] mb-2">Total Students</label>
                                <input
                                    required type="number"
                                    className="input"
                                    placeholder="70"
                                    onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-dim)] mb-2">Admin PIN</label>
                                <input
                                    required type="password"
                                    className="input"
                                    placeholder="****"
                                    onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
                                />
                            </div>
                        </div>

                        <hr className="border-[var(--border)]" />

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-white">Subjects</label>
                                <button
                                    type="button"
                                    onClick={addSubject}
                                    className="text-xs px-3 py-1 bg-white text-black rounded-full font-medium"
                                >
                                    + Add Subject
                                </button>
                            </div>

                            <div className="space-y-2">
                                {subjects.map((sub, index) => (
                                    <input
                                        key={index}
                                        placeholder="Subject Name (e.g. Math)"
                                        className="input"
                                        value={sub.name}
                                        onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                                        required
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Creating...' : 'Launch Class'}
                        </button>

                    </form>
                </div>

                {/* --- Return to Home Button --- */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-[var(--text-dim)] hover:text-white"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </>
    );
}