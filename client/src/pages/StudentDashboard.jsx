import React, { useEffect, useState } from "react";
import axios from "axios";
import { redirect } from "react-router-dom";

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
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
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-800">
        <h2 className="text-xl">Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-[#7a0c0c] text-white py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-lg font-bold">Student Dashboard</h1>
          <nav>
            <button className="px-3 py-1 rounded text-white hover:bg-white hover:text-[#7a0c0c] transition" onClick={()=>
              {
                localStorage.removeItem("token");
                window.location.reload();
                redirect("/")
              }
            }>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow bg-gray-100 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Welcome */}
          <h1 className="text-3xl font-bold text-[#7a0c0c] mb-8">
            Welcome, {profile.user.name} 👋
          </h1>

          {/* Profile Card */}
          <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-[#0f6a36] mb-10">
            <h2 className="text-xl font-semibold text-[#0f6a36] mb-4">
              My Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <p>
                <span className="font-medium">Enrollment No:</span>{" "}
                {profile.user.studentProfile.enrollNo}
              </p>
              <p>
                <span className="font-medium">Department:</span>{" "}
                {profile.user.studentProfile.dept}
              </p>
              <p>
                <span className="font-medium">Semester:</span>{" "}
                {profile.user.studentProfile.semester}
              </p>
              <p>
                <span className="font-medium">Email:</span> {profile.user.email}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-[#0f6a36] hover:shadow-lg cursor-pointer transition">
              <h3 className="text-lg font-semibold text-[#7a0c0c]">
                📚 Available Courses
              </h3>
              <p className="text-gray-600">Browse and register for new courses</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-[#0f6a36] hover:shadow-lg cursor-pointer transition">
              <h3 className="text-lg font-semibold text-[#7a0c0c]">
                📝 My Registrations
              </h3>
              <p className="text-gray-600">Check your registration status</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f6a36] text-white text-center py-2 text-sm">
        © 2025 Dashboard
      </footer>
    </div>
  );
};

export default StudentDashboard;
