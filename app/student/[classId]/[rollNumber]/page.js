"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import api from '@/utils/api';

export default function StudentDashboard() {
  const params = useParams();
  const { classId, rollNumber } = params;
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId || !rollNumber) return;

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

  const handleLogout = () => {
    localStorage.removeItem('studentClassId');
    localStorage.removeItem('studentRoll');
    router.push('/');
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-white animate-pulse">Loading Report...</div>;
  if (!data) return <div className="flex h-screen items-center justify-center text-[var(--text-dim)]">Student Not Found</div>;

  return (
    <>
      <Navbar isStudent={true} onLogout={handleLogout} classId={classId} rollNumber={rollNumber} />

      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Roll No. {data.studentRoll}</h1>
          <p className="text-[var(--text-dim)]">{data.className}</p>
        </div>

        {/* Overall Subject Reports */}
        <h2 className="text-sm uppercase text-[var(--text-dim)] mb-4">Overall Attendance</h2>
        <div className="space-y-4">
          {data.subjects?.map((sub, idx) => {
            const percentage = sub.percentage;
            const isSafe = percentage >= 80;

            return (
              <div key={idx} className="card">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">{sub.subjectName}</h2>
                  <span className={`px-3 py-1 rounded-md text-sm font-semibold ${isSafe ? 'bg-[var(--success)] text-[var(--success-text)]' : 'bg-[var(--danger)] text-[var(--danger-text)]'
                    }`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-[var(--text-dim)]">Classes Attended</p>
                    <p className="text-2xl font-bold">{sub.attended}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-dim)]">Total Classes</p>
                    <p className="text-2xl font-bold">{sub.total}</p>
                  </div>
                </div>

                <p className="text-sm text-[var(--text-dim)] italic">
                  {sub.message}
                </p>
              </div>
            );
          }) || <p className="text-[var(--text-dim)] text-center">No subjects found</p>}
        </div>

      </div>
    </>
  );
}