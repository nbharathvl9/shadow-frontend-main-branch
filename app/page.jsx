"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [formData, setFormData] = useState({
    classId: '',
    rollNumber: ''
  });
  const router = useRouter();

  const handleStudentLogin = (e) => {
    e.preventDefault();
    if (formData.classId && formData.rollNumber) {
      // Redirect to the new dynamic route
      router.push(`/student/${formData.classId}/${formData.rollNumber}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">Shadow Attendance</h1>
        <p className="text-gray-500 mt-2">Track your bunks safely.</p>
      </div>

      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl">
        <form onSubmit={handleStudentLogin} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class ID</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Paste Class ID here..."
              value={formData.classId}
              onChange={(e) => setFormData({...formData, classId: e.target.value})}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Ask your admin for this ID.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 5"
              value={formData.rollNumber}
              onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all"
          >
            Check Attendance 🚀
          </button>
        </form>
      </div>

      <div className="mt-10 flex gap-6 text-sm text-gray-400">
        <button onClick={() => router.push('/admin/create')} className="hover:text-gray-600 hover:underline">
          Create Class
        </button>
        <span>|</span>
        <button onClick={() => router.push('/admin/dashboard')} className="hover:text-gray-600 hover:underline">
          Admin Dashboard
        </button>
      </div>

    </div>
  );
}