// src/pages/TeacherDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setTeacher(parsed);

      // Fetch teacher's assigned courses
      axios
        .get(`http://localhost:5000/api/teacher/${parsed.id}/courses`)
        .then((res) => setCourses(res.data))
        .catch((err) => console.error(err));
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-800 text-white py-3 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold">Teacher Dashboard</h1>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          className="hover:underline"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        {teacher && (
          <h2 className="text-2xl font-bold mb-6">
            Welcome, {teacher.name} 👋
          </h2>
        )}

        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6 border-t-4 border-green-700">
          <h3 className="font-bold text-green-800 mb-3">My Profile</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <p>
              <strong>Employee ID:</strong>{" "}
              {teacher?.teacherProfile?.employeeId}
            </p>
            <p>
              <strong>Designation:</strong>{" "}
              {teacher?.teacherProfile?.designation}
            </p>
            <p>
              <strong>Department:</strong> {teacher?.teacherProfile?.dept}
            </p>
            <p>
              <strong>Email:</strong> {teacher?.email}
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6 border-t-4 border-green-700 hover:shadow-lg transition">
            <h3 className="font-bold text-red-800 mb-2">📘 My Courses</h3>
            <p className="text-gray-600">Manage and view assigned courses</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border-t-4 border-green-700 hover:shadow-lg transition">
            <h3 className="font-bold text-red-800 mb-2">📢 Announcements</h3>
            <p className="text-gray-600">Post and manage announcements</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border-t-4 border-green-700 hover:shadow-lg transition">
            <h3 className="font-bold text-red-800 mb-2">📝 Student Requests</h3>
            <p className="text-gray-600">
              Review course registration requests
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border-t-4 border-green-700 hover:shadow-lg transition">
            <h3 className="font-bold text-red-800 mb-2">📊 Reports</h3>
            <p className="text-gray-600">View student performance reports</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white text-center py-2 text-sm">
        © 2025 Teacher Dashboard
      </footer>
    </div>
  );
}
