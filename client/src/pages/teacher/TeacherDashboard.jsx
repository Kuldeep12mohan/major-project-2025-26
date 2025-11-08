import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./utils.js";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await axios.get(`${BASE_URL}/api/auth/profile`, {
          withCredentials: true,
        });

        const user = profileRes.data.user;

        if (user.role !== "TEACHER") {
          toast.error("Unauthorized access.");
          navigate("/");
          return;
        }

        setTeacher(user);

        const coursesRes = await axios.get(
          `${BASE_URL}/api/teacher/my-courses`,
          { withCredentials: true }
        );

        setCourses(coursesRes.data.courses || []);
      } catch (err) {
        console.error("Teacher dashboard error:", err);
        toast.error("Session expired. Please login again.");
        navigate("/");
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      toast.success("Logged out!");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error(err);
      toast.error("Logout failed.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-red-800 text-white py-3 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold">Teacher Dashboard</h1>
        <button onClick={handleLogout} className="hover:underline">
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
          {/* My Courses */}
          <div
            className="bg-white shadow rounded-lg p-6 border-t-4 border-green-700 hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate("/teacher/courses")}
          >
            <h3 className="font-bold text-red-800 mb-2">📘 My Courses</h3>
            <p className="text-gray-600">
              View and manage courses assigned to you
            </p>
          </div>

          {/* Announcements */}
          <div className="bg-white shadow rounded-lg p-6 border-t-4 border-green-700 hover:shadow-lg transition cursor-pointer">
            <h3 className="font-bold text-red-800 mb-2">📢 Announcements</h3>
            <p className="text-gray-600">Post and manage announcements</p>
          </div>

          {/* Student Requests */}
          <div
            className="bg-white shadow rounded-lg p-6 border-t-4 border-green-700 hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate("/teacher/requests")}
          >
            <h3 className="font-bold text-red-800 mb-2">📝 Student Requests</h3>
            <p className="text-gray-600">
              Review registration requests from students
            </p>
          </div>

          {/* Reports */}
          <div className="bg-white shadow rounded-lg p-6 border-t-4 border-green-700 hover:shadow-lg transition cursor-pointer">
            <h3 className="font-bold text-red-800 mb-2">📊 Reports</h3>
            <p className="text-gray-600">View performance reports</p>
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
