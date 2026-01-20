"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Rocket } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import api from '@/utils/api';
import { useNotification } from '@/app/components/Notification';

export default function CreateClass() {
    const router = useRouter();
    const notify = useNotification();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        className: '',
        totalStudents: '',
        adminPin: ''
    });

    // IMPROVEMENT: Initialize with one empty subject
    const [subjects, setSubjects] = useState([{ name: '', code: '' }]);

    const addSubject = () => {
        setSubjects([...subjects, { name: '', code: '' }]);
    };

    // NEW: Function to remove a subject
    const removeSubject = (index) => {
        if (subjects.length === 1) {
            notify({ message: "You need at least one subject!", type: 'error' });
            return;
        }
        const newSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(newSubjects);
    };

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...subjects];
        newSubjects[index][field] = value;
        setSubjects(newSubjects);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // IMPROVEMENT: Validate subjects before sending
        const invalidSubjects = subjects.some(sub => !sub.name.trim());
        if (invalidSubjects) {
            notify({ message: "Please fill in all subject names or remove empty ones.", type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                subjects: subjects,
                // Default empty timetable structure
                timetable: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] }
            };

            const res = await api.post('/class/create', payload);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('adminClassId', res.data.classId);

            notify({ message: `Class Created Successfully! You are now logged in as admin for ${formData.className}.`, type: 'success' });
            router.push('/admin/dashboard');

        } catch (err) {
            // IMPROVEMENT: Show specific error message from backend (e.g. Duplicate Name)
            const msg = err.response?.data?.error || 'Error creating class.';
            notify({ message: msg, type: 'error' });
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

                        {/* Class Name */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-dim)] mb-2">Class Name</label>
                            <input
                                required
                                className="input"
                                placeholder="e.g. CSE-3A"
                                value={formData.className}
                                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                            />
                            <p className="text-xs text-[var(--text-dim)] mt-1">You'll use this to login as admin</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-dim)] mb-2">Total Students</label>
                                <input
                                    required type="number"
                                    className="input"
                                    placeholder="70"
                                    value={formData.totalStudents}
                                    onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-dim)] mb-2">Admin PIN</label>
                                <input
                                    required type="password"
                                    className="input"
                                    placeholder="****"
                                    value={formData.adminPin}
                                    onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
                                />
                            </div>
                        </div>

                        <hr className="border-[var(--border)]" />

                        {/* Subjects Section */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-white">Subjects</label>
                                <button
                                    type="button"
                                    onClick={addSubject}
                                    className="text-xs px-3 py-1 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add Subject
                                </button>
                            </div>

                            <div className="space-y-2">
                                {subjects.map((sub, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            placeholder={`Subject ${index + 1}`}
                                            className="input flex-1"
                                            value={sub.name}
                                            onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                                            required
                                        />
                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => removeSubject(index)}
                                            className="px-3 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-full transition flex items-center"
                                            title="Remove Subject"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <Rocket className="w-4 h-4" />
                            {loading ? 'Creating...' : 'Launch Class'}
                        </button>

                    </form>
                </div>

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