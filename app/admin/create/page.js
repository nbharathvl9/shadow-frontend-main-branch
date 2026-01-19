"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function CreateClass() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    className: '',
    totalStudents: '',
    adminPin: ''
  });

  // Dynamic Subjects State
  const [subjects, setSubjects] = useState([
    { name: '', code: '' } // Start with one empty subject
  ]);

  // Handlers
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
      // 1. Create the Class
      const payload = {
        ...formData,
        subjects: subjects,
        // Send an empty timetable structure for now
        timetable: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] }
      };

      const res = await api.post('/class/create', payload);
      
      // 2. Save Class ID to LocalStorage (so the Admin stays logged in)
      localStorage.setItem('adminClassId', res.data.classId);
      
      alert(`Class Created! ID: ${res.data.classId}`);
      router.push('/admin/dashboard'); // Redirect to Dashboard
      
    } catch (err) {
      alert('Error creating class. Check console.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 h-fit">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Class 🛠️</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-bold text-gray-700">Class Name</label>
            <input 
              required
              className="w-full p-3 border rounded-lg bg-gray-50 mt-1"
              placeholder="e.g. CSE-3A"
              onChange={(e) => setFormData({...formData, className: e.target.value})}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700">Total Students</label>
              <input 
                required type="number"
                className="w-full p-3 border rounded-lg bg-gray-50 mt-1"
                placeholder="70"
                onChange={(e) => setFormData({...formData, totalStudents: e.target.value})}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700">Admin PIN</label>
              <input 
                required type="password"
                className="w-full p-3 border rounded-lg bg-gray-50 mt-1"
                placeholder="****"
                onChange={(e) => setFormData({...formData, adminPin: e.target.value})}
              />
            </div>
          </div>

          <hr className="my-6" />

          {/* Dynamic Subjects */}
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

          {/* Submit Button */}
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
  );
}