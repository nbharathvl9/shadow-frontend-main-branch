"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState([]);
    const [classId, setClassId] = useState(null);
    const [todayName, setTodayName] = useState("");
    const [overrideDay, setOverrideDay] = useState(null);
    const [customMode, setCustomMode] = useState(false);
    const [subjects, setSubjects] = useState([]);

    const [absentees, setAbsentees] = useState({});

    useEffect(() => {
        const storedClassId = localStorage.getItem('adminClassId');
        if (!storedClassId) {
            router.push('/admin/create');
            return;
        }
        setClassId(storedClassId);

        api.get(`/class/${storedClassId}`)
            .then(res => {
                const subjects = res.data.subjects;
                setSubjects(subjects);

                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const currentDay = days[new Date().getDay()];
                setTodayName(currentDay);

                const dayToLoad = overrideDay || currentDay;
                const todaySchedule = res.data.timetable?.[dayToLoad] || [];

                const formattedTimetable = todaySchedule.map(slot => {
                    const sub = subjects.find(s => s._id === slot.subjectId);
                    return {
                        period: slot.period,
                        subjectName: sub ? sub.name : "Unknown",
                        subjectId: slot.subjectId
                    };
                });

                setTimetable(formattedTimetable);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [router, overrideDay]);

    const addCustomPeriod = () => {
        const nextPeriodNum = timetable.length > 0
            ? Math.max(...timetable.map(p => p.period)) + 1
            : 1;
        setTimetable([...timetable, { period: nextPeriodNum, subjectId: "", subjectName: "" }]);
    };

    const removeCustomPeriod = (periodNum) => {
        setTimetable(timetable.filter(p => p.period !== periodNum));
        setAbsentees(prev => {
            const updated = { ...prev };
            delete updated[timetable.findIndex(p => p.period === periodNum)];
            return updated;
        });
    };

    const updateCustomPeriod = (periodNum, subjectId) => {
        const subject = subjects.find(s => s._id === subjectId);
        setTimetable(prev => prev.map(slot =>
            slot.period === periodNum
                ? { ...slot, subjectId, subjectName: subject ? subject.name : "" }
                : slot
        ));
    };

    const toggleAbsent = (periodIdx, rollNo) => {
        setAbsentees(prev => {
            const currentList = prev[periodIdx] || [];
            if (currentList.includes(rollNo)) {
                return { ...prev, [periodIdx]: currentList.filter(r => r !== rollNo) };
            } else {
                return { ...prev, [periodIdx]: [...currentList, rollNo] };
            }
        });
    };

    const submitAttendance = async () => {
        if (!classId) return;

        const today = new Date().toISOString().split('T')[0];

        const formattedPeriods = timetable.map((slot, index) => ({
            periodNum: slot.period,
            subjectId: slot.subjectId,
            subjectName: slot.subjectName,
            absentRollNumbers: absentees[index] || []
        }));

        try {
            await api.post('/attendance/mark', {
                classId: classId,
                date: today,
                periods: formattedPeriods
            });
            alert("Attendance Saved Successfully! ✅");
            setAbsentees({});
        } catch (err) {
            alert("Failed to save attendance ❌");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 animate-pulse">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 text-gray-800">

            <div className="bg-white p-4 shadow-sm mb-4 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Mark Attendance 📝</h1>
                        <p className="text-sm text-gray-500">
                            {customMode ? (
                                <span className="text-orange-600 font-medium">📝 Custom Schedule (Today Only)</span>
                            ) : overrideDay ? (
                                <span className="text-blue-600 font-medium">
                                    Today ({todayName}) follows <span className="underline">{overrideDay}'s</span> timetable
                                </span>
                            ) : (
                                <span>{todayName}'s Classes</span>
                            )}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push('/admin/timetable')}
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-bold"
                        >
                            Edit Timetable
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

                {!customMode && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <label className="text-xs font-medium text-gray-600">Today's schedule:</label>
                        <select
                            value={overrideDay || todayName}
                            onChange={(e) => setOverrideDay(e.target.value === todayName ? null : e.target.value)}
                            className="text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700"
                        >
                            <option value={todayName}>{todayName} (Default)</option>
                            <option value="Monday">Monday's Timetable</option>
                            <option value="Tuesday">Tuesday's Timetable</option>
                            <option value="Wednesday">Wednesday's Timetable</option>
                            <option value="Thursday">Thursday's Timetable</option>
                            <option value="Friday">Friday's Timetable</option>
                            <option value="Saturday">Saturday's Timetable</option>
                        </select>
                        {overrideDay && (
                            <button
                                onClick={() => setOverrideDay(null)}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                                Reset
                            </button>
                        )}
                        <span className="text-gray-300">|</span>
                        <button
                            onClick={() => setCustomMode(true)}
                            className="text-xs px-3 py-2 bg-orange-50 text-orange-600 rounded-lg font-bold hover:bg-orange-100"
                        >
                            Custom Schedule
                        </button>
                    </div>
                )}

                {customMode && (
                    <div className="mt-3 pt-3 border-t border-orange-100 bg-orange-50 -m-4 p-4 rounded-b-lg">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-orange-700">
                                ⚠️ Customize today's schedule. Changes apply to this attendance session only.
                            </p>
                            <button
                                onClick={() => {
                                    setCustomMode(false);
                                    window.location.reload();
                                }}
                                className="text-xs px-3 py-1 bg-white text-orange-600 rounded hover:bg-gray-50 font-medium border border-orange-200"
                            >
                                Exit Custom Mode
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-6">
                {timetable.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500 mb-4">No classes scheduled for {overrideDay || todayName}.</p>
                        <button
                            onClick={() => router.push('/admin/timetable')}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold"
                        >
                            Set Up Timetable Now
                        </button>
                    </div>
                ) : (
                    timetable.map((slot, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">

                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h2 className="font-bold text-lg text-blue-600">
                                    Period {slot.period}:
                                    {customMode ? (
                                        <select
                                            className="ml-2 text-gray-800 bg-gray-50 border rounded px-2 py-1 text-base"
                                            value={slot.subjectId}
                                            onChange={(e) => updateCustomPeriod(slot.period, e.target.value)}
                                        >
                                            <option value="">-- Select Subject --</option>
                                            {subjects.map(sub => (
                                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-gray-800"> {slot.subjectName}</span>
                                    )}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${(absentees[index] || []).length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                        {(absentees[index] || []).length} Absent
                                    </span>
                                    {customMode && (
                                        <button
                                            onClick={() => removeCustomPeriod(slot.period)}
                                            className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-6 gap-2">
                                {[...Array(60)].map((_, i) => {
                                    const roll = i + 1;
                                    const isAbsent = (absentees[index] || []).includes(roll);

                                    return (
                                        <button
                                            key={roll}
                                            onClick={() => toggleAbsent(index, roll)}
                                            className={`h-10 w-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${isAbsent
                                                    ? 'bg-red-500 text-white shadow-md scale-110 ring-2 ring-red-300'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {roll}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}

                {customMode && (
                    <div className="text-center">
                        <button
                            onClick={addCustomPeriod}
                            className="px-6 py-3 bg-orange-50 text-orange-600 rounded-xl font-bold hover:bg-orange-100 border-2 border-dashed border-orange-200"
                        >
                            + Add Extra Period
                        </button>
                    </div>
                )}
            </div>

            {timetable.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={submitAttendance}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
                    >
                        <span>Save Attendance</span>
                        <span>💾</span>
                    </button>
                </div>
            )}

        </div>
    );
}