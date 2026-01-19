"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState([]);
  const [classId, setClassId] = useState(null);
  
  // State to store who is absent for each period
  // Structure: { period_index: [roll_no_1, roll_no_2] }
  const [absentees, setAbsentees] = useState({});

  useEffect(() => {
    // 1. Check if Admin is logged in (has created a class)
    const storedClassId = localStorage.getItem('adminClassId');
    
    if (!storedClassId) {
      alert("No active class found. Please create one first.");
      router.push('/admin/create');
      return;
    }

    setClassId(storedClassId);

    // 2. Fetch Class Details from Backend
    api.get(`/class/${storedClassId}`)
      .then(res => {
        const subjects = res.data.subjects;
        
        if (!subjects || subjects.length === 0) {
          alert("This class has no subjects!");
          setLoading(false);
          return;
        }

        // 3. Auto-Generate Timetable for V1
        // Since we haven't built a "Timetable Creator" yet, we simply 
        // create 1 period for every subject you added.
        const generatedTimetable = subjects.map((sub, index) => ({
          period: index + 1,
          subjectName: sub.name,
          subjectId: sub._id
        }));

        setTimetable(generatedTimetable);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert("Error loading class data");
        setLoading(false);
      });
  }, [router]);

  const toggleAbsent = (periodIdx, rollNo) => {
    setAbsentees(prev => {
      const currentList = prev[periodIdx] || [];
      if (currentList.includes(rollNo)) {
        return { ...prev, [periodIdx]: currentList.filter(r => r !== rollNo) }; // Remove
      } else {
        return { ...prev, [periodIdx]: [...currentList, rollNo] }; // Add
      }
    });
  };

  const submitAttendance = async () => {
    if (!classId) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Format data for Backend
    const formattedPeriods = timetable.map((slot, index) => ({
      periodNum: slot.period,
      subjectId: slot.subjectId,
      subjectName: slot.subjectName,
      absentRollNumbers: absentees[index] || []
    }));

    try {
      await api.post('/attendance/mark', {
        classId: classId, // Use the dynamic ID from state
        date: today,
        periods: formattedPeriods
      });
      alert("Attendance Saved Successfully! ✅");
      
      // Optional: Clear selection after save
      setAbsentees({});
      
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance ❌");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Header */}
      <div className="bg-white p-4 shadow-sm mb-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Mark Attendance 📝</h1>
          <p className="text-sm text-gray-500">Tap to mark absent</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="text-sm text-gray-400 hover:text-red-500"
        >
          Logout
        </button>
      </div>

      <div className="p-4 space-y-6">
        {timetable.map((slot, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="font-bold text-lg text-blue-600">
                Period {slot.period}: <span className="text-gray-800">{slot.subjectName}</span>
              </h2>
              <span className={`text-xs px-2 py-1 rounded font-bold ${
                (absentees[index] || []).length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {(absentees[index] || []).length} Absent
              </span>
            </div>

            {/* Roll Number Grid (1-60) */}
            <div className="grid grid-cols-6 gap-2">
              {[...Array(60)].map((_, i) => { 
                const roll = i + 1;
                const isAbsent = (absentees[index] || []).includes(roll);
                
                return (
                  <button
                    key={roll}
                    onClick={() => toggleAbsent(index, roll)}
                    className={`h-10 w-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
                      isAbsent 
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
        ))}
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={submitAttendance}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
        >
          <span>Save Attendance</span>
          <span>💾</span>
        </button>
      </div>

    </div>
  );
}