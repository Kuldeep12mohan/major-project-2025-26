import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { base_url } from '../../utils/utils';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${base_url}/api/teacher/courses`, {
          withCredentials: true,
        });
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${base_url}/api/auth/logout`, {}, { withCredentials: true });
      toast.success('Logged out successfully!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-800">
        <h2 className="text-xl">Loading courses...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-amber-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-amber-900 font-bold text-lg">📚</span>
            </div>
            <h1 className="text-xl font-bold">My Courses</h1>
          </div>
          <button
            className="px-6 py-2 bg-white text-amber-900 rounded-lg hover:bg-amber-50 font-semibold transition transform hover:scale-105 shadow-md"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/teacher-dashboard')}
            className="mb-6 flex items-center gap-2 text-amber-800 hover:text-amber-900 font-semibold transition"
          >
            ← Back to Dashboard
          </button>

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              My <span className="text-amber-800">Courses</span> 📘
            </h1>
            <p className="text-gray-600">Here are the courses assigned to you</p>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 border-l-4 border-l-amber-700">
              <p className="text-gray-500 text-sm">Total Courses</p>
              <p className="text-3xl font-bold text-amber-900">{courses.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 border-l-4 border-l-green-500">
              <p className="text-gray-500 text-sm">Active Courses</p>
              <p className="text-3xl font-bold text-green-700">{courses.filter(c => c.isActive).length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 border-l-4 border-l-blue-500">
              <p className="text-gray-500 text-sm">Departments</p>
              <p className="text-3xl font-bold text-blue-700">{new Set(courses.map(c => c.department?.name).filter(Boolean)).size}</p>
            </div>
          </div>

          {/* Course Cards */}
          {courses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-8 text-center">
              <p className="text-gray-500 text-lg">No courses assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`bg-white rounded-xl shadow-lg border border-stone-200 p-6 transition transform hover:scale-105 hover:shadow-xl ${
                    course.isActive ? 'border-l-4 border-l-amber-700' : 'border-l-4 border-l-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-amber-900 text-lg">{course.name}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      course.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{course.description || 'No description available'}</p>
                  <div className="text-sm text-gray-500 space-y-2 border-t border-stone-200 pt-3">
                    <p><span className="font-medium text-gray-700">Code:</span> {course.code}</p>
                    <p><span className="font-medium text-gray-700">Semester:</span> {course.semester}</p>
                    <p><span className="font-medium text-gray-700">Credits:</span> {course.credits}</p>
                    {course.department && (
                      <p><span className="font-medium text-gray-700">Department:</span> {course.department.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-white text-center py-3 text-sm">
        © 2025 Teacher Dashboard
      </footer>
    </div>
  );
};

export default MyCourses;