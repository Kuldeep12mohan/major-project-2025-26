import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <h2 className="text-xl">Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Welcome, {profile.name} 👋</h1>

      {/* Profile Card */}
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-gray-300">
          <p><span className="font-medium text-white">Enrollment No:</span> {profile.enrollmentNo}</p>
          <p><span className="font-medium text-white">Department:</span> {profile.department}</p>
          <p><span className="font-medium text-white">Semester:</span> {profile.semester}</p>
          <p><span className="font-medium text-white">Email:</span> {profile.email}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded-2xl p-6 shadow-md transition">
          <h3 className="text-lg font-semibold">📚 Available Courses</h3>
          <p className="text-gray-400">Browse and register for new courses</p>
        </div>

        <div className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded-2xl p-6 shadow-md transition">
          <h3 className="text-lg font-semibold">📝 My Registrations</h3>
          <p className="text-gray-400">Check your registration status</p>
        </div>

        <div className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded-2xl p-6 shadow-md transition">
          <h3 className="text-lg font-semibold">⚙️ Profile Settings</h3>
          <p className="text-gray-400">Update your personal information</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
