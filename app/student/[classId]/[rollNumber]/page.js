"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function StudentDashboard() {
  const params = useParams();
  // 1. FIXED: Extract both IDs from the URL
  const { classId, rollNumber } = params;

  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. FIXED: Wait for both IDs to be available
    if (!classId || !rollNumber) return;

    // 3. FIXED: Use the 'classId' variable, NOT the hardcoded string
    api.get(`/student/report/${classId}/${rollNumber}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        alert("Student not found or Server Error");
        setLoading(false);
      });
  }, [classId, rollNumber]);

  if (loading) return <div className="flex h-screen items-center justify-center text-blue-600 animate-pulse">Loading Report...</div>;
  if (!data) return <div className="flex h-screen items-center justify-center text-gray-500">Student Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-10 text-gray-800">

      {/* Top Bar */}
      <div className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roll No. {data.studentRoll}</h1>
          <p className="text-sm text-gray-500">{data.className}</p>
        </div>
        <button
          onClick={() => {
            // Clear saved login data
            localStorage.removeItem('studentClassId');
            localStorage.removeItem('studentRoll');
            router.push('/');
          }}
          className="text-sm text-gray-400 hover:text-red-500 font-medium"
        >
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="p-4 space-y-4">
        {data.report.map((subject, index) => {
          const isSafe = subject.message.includes("Safe");

          return (
            // Added 'key' to fix console warning
            <div key={subject._id || index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isSafe ? 'bg-green-500' : 'bg-red-500'}`}></div>

              <div className="flex justify-between items-start mb-2 pl-2">
                <h2 className="text-lg font-bold text-gray-800">{subject.subjectName}</h2>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${isSafe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {subject.percentage}
                </span>
              </div>

              <div className="pl-2 mb-4 text-sm text-gray-500 flex gap-4">
                <span>✅ {subject.attendedClasses} Attended</span>
                <span>📚 {subject.totalClasses} Total</span>
              </div>

              <div className={`ml-2 p-3 rounded-xl text-sm font-medium ${isSafe ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {subject.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}