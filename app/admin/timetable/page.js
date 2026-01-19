"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function TimetableEditor() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [classId, setClassId] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');

    const [timetable, setTimetable] = useState({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
    });

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    useEffect(() => {
        const storedId = localStorage.getItem('adminClassId');
        if (!storedId) {
            router.push('/admin/create');
            return;
        }
        setClassId(storedId);

        api.get(`/class/${storedId}`)
            .then(res => {
                setSubjects(res.data.subjects);
                if (res.data.timetable && Object.keys(res.data.timetable).length > 0) {
                    setTimetable(res.data.timetable);
                }
                setLoading(false);
            })
            .catch(err => alert("Failed to load class data"));
    }, [router]);

    const addNewSubject = async () => {
        if (!newSubjectName.trim()) return;

        try {
            const res = await api.post(`/class/${classId}/add-subject`, { name: newSubjectName });
            setSubjects([...subjects, res.data.subject]);
            setNewSubjectName('');
            setShowAddSubject(false);
            alert('Subject added! ✅');
        } catch (err) {
            alert('Failed to add subject');
        }
    };

    const addPeriod = (day) => {
        const nextPeriodNum = (timetable[day] || []).length > 0
            ? Math.max(...timetable[day].map(p => p.period)) + 1
            : 1;
        setTimetable(prev => ({
            ...prev,
            [day]: [...(prev[day] || []), { period: nextPeriodNum, subjectId: "" }]
        }));
    };

    const removePeriod = (day, periodNum) => {
        setTimetable(prev => ({
            ...prev,
            [day]: (prev[day] || []).filter(p => p.period !== periodNum)
        }));
    };

    const updatePeriod = (day, periodNum, subjectId) => {
        setTimetable(prev => {
            const daySchedule = prev[day] || [];
            const filtered = daySchedule.filter(p => p.period !== periodNum);
            if (!subjectId) {
                return { ...prev, [day]: filtered };
            }
            return {
                ...prev,
                [day]: [...filtered, { period: periodNum, subjectId }].sort((a, b) => a.period - b.period)
            };
        });
    };

    const saveTimetable = async () => {
        try {
            await api.put('/class/update-timetable', { classId, timetable });
            alert("Timetable Saved! 🗓️");
            router.push('/admin/dashboard');
        } catch (err) {
            alert("Failed to save.");
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-blue-600">Loading Timetable...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24 text-gray-800">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Weekly Timetable 🗓️</h1>
                        <p className="text-sm text-gray-500 mt-1">Set your default weekly schedule</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddSubject(!showAddSubject)}
                            className="text-xs bg-green-50 text-green-600 px-3 py-2 rounded-lg font-bold hover:bg-green-100"
                        >
                            + Add Subject
                        </button>
                        <button
                            onClick={() => router.push('/admin/dashboard')}
                            className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-bold hover:bg-gray-200"
                        >
                            ← Dashboard
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem('adminClassId');
                                router.push('/');
                            }}
                            className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded-lg font-bold"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Add Subject Modal */}
                {showAddSubject && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                        <h3 className="font-bold text-green-800 mb-3">Add New Subject</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Subject name (e.g. Chemistry)"
                                className="flex-1 px-3 py-2 border rounded-lg"
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addNewSubject()}
                            />
                            <button
                                onClick={addNewSubject}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setShowAddSubject(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Current Subjects List */}
                <div className="mb-6 bg-white rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-2 text-sm">Your Subjects</h3>
                    <div className="flex flex-wrap gap-2">
                        {subjects.map(sub => (
                            <span key={sub._id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {sub.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {DAYS.map(day => {
                        const daySchedule = timetable[day] || [];

                        return (
                            <div key={day} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h2 className="font-bold text-lg text-blue-600">{day}</h2>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                        {daySchedule.length} {daySchedule.length === 1 ? 'period' : 'periods'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-3">
                                    {daySchedule.length === 0 ? (
                                        <div className="text-center py-4 text-gray-400 text-sm">
                                            No classes scheduled. Click "Add Period" below.
                                        </div>
                                    ) : (
                                        daySchedule
                                            .sort((a, b) => a.period - b.period)
                                            .map((slot) => (
                                                <div key={slot.period} className="flex items-center gap-2">
                                                    <span className="w-12 font-bold text-gray-500 text-sm">P{slot.period}</span>
                                                    <select
                                                        className="flex-1 p-2 bg-gray-50 border rounded-lg text-sm"
                                                        value={slot.subjectId || ""}
                                                        onChange={(e) => updatePeriod(day, slot.period, e.target.value)}
                                                    >
                                                        <option value="">-- Select Subject --</option>
                                                        {subjects.map(sub => (
                                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => removePeriod(day, slot.period)}
                                                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))
                                    )}
                                </div>

                                <button
                                    onClick={() => addPeriod(day)}
                                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium border border-dashed border-gray-300"
                                >
                                    + Add Period
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
                    <div className="max-w-4xl mx-auto">
                        <button
                            onClick={saveTimetable}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition active:scale-95"
                        >
                            Save Timetable
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}