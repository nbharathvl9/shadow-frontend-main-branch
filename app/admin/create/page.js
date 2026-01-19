"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function CreateClass() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        className: '',
        totalStudents: '',
        adminPin: ''
    });

    const [subjects, setSubjects] = useState([
        { name: '', code: '' }
    ]);

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

            await api.post('/class/create', payload);

            alert(`Class Created Successfully!\n\nClass Name: ${formData.className}\n\nUse this name and your PIN to login as admin.`);
            router.push('/admin/login');

        } catch (err) {
            alert('Error creating class. Check console.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
            <div className="w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Create New Class 🛠️</h1>
                    <button
                        onClick={() => router.push('/')}
                        className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-bold hover:bg-gray-200"
                    >
                        ← Home
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-bold text-gray-700">Class Name</label>
                            <input
                                required
                                className="w-full p-3 border rounded-lg bg-gray-50 mt-1"
                                placeholder="e.g. CSE-3A"
                                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 mt-1">You'll use this to login as admin</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700">Total Students</label>
                                <input
                                    required type="number"
                                    className="w-full p-3 border rounded-lg bg-gray-50 mt-1"
                                    placeholder="70"
                                    onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700">Admin PIN</label>
                                <input
                                    required type="password"
                                    className="w-full p-3 border rounded-lg bg-gray-50 mt-1"
                                    placeholder="****"
                                    onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
                                />
                            </div>
                        </div>

                        <hr className="my-6" />

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-700">Subjects</label>
                                <button
                                    type="button"
                                    onClick={addSubject}
                                    className="text-xs bg-black text-white px-3 py-1 rounded-full"
                                >
                                    + Add Subject
                                </button>
                            </div>

                            <div className="space-y-3">
                                {subjects.map((sub, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            placeholder="Subject Name (e.g. Math)"
                                            className="flex-1 p-3 border rounded-lg bg-gray-50"
                                            value={sub.name}
                                            onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition"
                        >
                            {loading ? 'Creating...' : 'Launch Class 🚀'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}