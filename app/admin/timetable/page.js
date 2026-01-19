"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
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
            router.push('/admin/login');
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

    const handleLogout = () => {
        localStorage.removeItem('adminClassId');
        router.push('/');
    };

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

    if (loading) return <div className="flex h-screen items-center justify-center text-white animate-pulse">Loading...</div>;

    return (
        <>
            <Navbar isAdmin={true} onLogout={handleLogout} />

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">Edit Weekly Timetable</h1>
                    <p className="text-[var(--text-dim)]">Set your default weekly schedule</p>
                </div>

                {/* Add Subject Section */}
                {showAddSubject ? (
                    <div className="card mb-6 border-green-500/30">
                        <h2 className="text-sm uppercase text-green-400 mb-3">Add New Subject</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Subject name (e.g. Chemistry)"
                                className="input flex-1"
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addNewSubject()}
                            />
                            <button
                                onClick={addNewSubject}
                                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setShowAddSubject(false)}
                                className="px-4 py-2 bg-[var(--border)] rounded-md hover:bg-white/10"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6">
                        <button
                            onClick={() => setShowAddSubject(true)}
                            className="btn btn-outline inline-flex w-auto px-6"
                        >
                            + Add Subject
                        </button>
                    </div>
                )}

                {/* Current Subjects */}
                <div className="card mb-6">
                    <h2 className="text-sm uppercase text-[var(--text-dim)] mb-3">Your Subjects</h2>
                    <div className="flex flex-wrap gap-2">
                        {subjects.length === 0 ? (
                            <p className="text-[var(--text-dim)] text-sm">No subjects yet. Add one above.</p>
                        ) : (
                            subjects.map(sub => (
                                <span key={sub._id} className="px-3 py-1 bg-blue-900/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                                    {sub.name}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                {/* Weekly Timetable */}
                <div className="space-y-4 mb-6">
                    {DAYS.map(day => {
                        const daySchedule = timetable[day] || [];

                        return (
                            <div key={day} className="card">
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border)]">
                                    <h2 className="text-lg font-semibold">{day}</h2>
                                    <span className="text-xs px-2 py-1 bg-[var(--card-bg)] border border-[var(--border)] rounded">
                                        {daySchedule.length} {daySchedule.length === 1 ? 'period' : 'periods'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-3">
                                    {daySchedule.length === 0 ? (
                                        <div className="text-center py-6 text-[var(--text-dim)] text-sm">
                                            No classes scheduled. Click "Add Period" below.
                                        </div>
                                    ) : (
                                        daySchedule
                                            .sort((a, b) => a.period - b.period)
                                            .map((slot) => (
                                                <div key={slot.period} className="flex items-center gap-2">
                                                    <span className="w-12 font-bold text-[var(--text-dim)] text-sm">P{slot.period}</span>
                                                    <select
                                                        className="input flex-1"
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
                                                        className="px-3 py-2 bg-red-900/20 text-red-400 rounded-md text-xs hover:bg-red-900/30"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))
                                    )}
                                </div>

                                <button
                                    onClick={() => addPeriod(day)}
                                    className="w-full py-2 bg-[var(--card-bg)] border border-dashed border-[var(--border)] rounded-md text-sm hover:border-white/50 transition"
                                >
                                    + Add Period
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Save Button */}
                <button
                    onClick={saveTimetable}
                    className="btn btn-primary sticky bottom-4"
                >
                    Save Timetable 💾
                </button>

            </div>
        </>
    );
}