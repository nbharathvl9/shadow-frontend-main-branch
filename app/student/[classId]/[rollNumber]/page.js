"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function StudentDashboard() {
  const { rollNumber } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⚠️ HARDCODED CLASS ID FOR V1 (Replace with your specific Class ID from Postman)
  const CLASS_ID = "696e812eb7aa7171adb5350e"; 

  useEffect(() => {
    api.get(`/student/report/${CLASS_ID}/${rollNumber}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        alert("Student not found or Server Error");
        setLoading(false);
      });
  }, [rollNumber]);

  if (loading) return <div className="flex h-screen items-center justify-center text-blue-600 animate-pulse">Loading...</div>;
  if (!data) return <div className="flex h-screen items-center justify-center">Student Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      
      {/* Top Bar (Mobile App Style) */}
      <div className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roll No. {data.studentRoll}</h1>
            <p className="text-sm text-gray-500">{data.className}</p>
          </div>
          <button onClick={() => router.push('/')} className="text-sm text-gray-400">Exit</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 space-y-4">
        {data.report.map((subject) => {
          const isSafe = subject.message.includes("Safe");
          
          return (
            <div key={subject._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
              
              {/* Status Indicator Bar on the left */}
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

              {/* Bunk Message Box */}
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