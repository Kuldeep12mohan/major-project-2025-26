import React, { useEffect, useState } from "react";
import axios from "axios";
import { base_url } from "../../utils/utils.js";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTeacher = async () => {
      try {
        const res = await axios.get(`${base_url}/api/teacher/me`, { withCredentials: true });
        if (!res.data.teacher) {
          toast.error("Unauthorized access");
          navigate("/");
          return;
        }
        setTeacher(res.data.teacher);
      } catch (err) {
        toast.error("Session expired. Please login again.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    loadTeacher();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${base_url}/api/auth/logout`, {}, { withCredentials: true });
      toast.success("Logged out!");
      setTimeout(() => navigate("/"), 700);
    } catch {
      toast.error("Logout failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-800">
        <h2 className="text-xl font-semibold animate-pulse">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-red-800 text-white py-3 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold">Teacher Dashboard</h1>
        <button onClick={handleLogout} className="hover:underline">Logout</button>
      </header>

      <main className="flex-grow p-6 max-w-6xl mx-auto space-y-6">
        {teacher && <h2 className="text-2xl font-bold mb-6">Welcome, {teacher.user.name} 👋</h2>}

        {/* Profile */}
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-green-700">
          <h3 className="font-bold text-green-800 mb-3">My Profile</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <p><strong>Employee ID:</strong> {teacher.employeeId}</p>
            <p><strong>Designation:</strong> {teacher.designation}</p>
            <p><strong>Department:</strong> {teacher.dept}</p>
            <p><strong>Email:</strong> {teacher.user.email}</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div
            className="bg-white shadow rounded-lg p-6 border-t-4 border-green-700 hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate("/teacher/courses")}
          >
            <h3 className="font-bold text-red-800 mb-2">📘 My Courses</h3>
            <p className="text-gray-600">View courses assigned to you</p>
          </div>

          <div
            className="bg-white shadow rounded-lg p-6 border-t-4 border-yellow-600 hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate("/teacher/requests")}
          >
            <h3 className="font-bold text-red-800 mb-2">📝 Pending Student Registrations</h3>
            <p className="text-gray-600">View and verify student registrations</p>
          </div>
        </div>
      </main>

      <footer className="bg-green-800 text-white text-center py-2 text-sm">
        © 2025 Teacher Dashboard
      </footer>
    </div>
  );
}
