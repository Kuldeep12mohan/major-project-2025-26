import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({
    isOpen: false,
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        // ✅ Fetch user profile
        const profileRes = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileRes.data);

        // ✅ Fetch current registration status from backend
        const statusRes = await axios.get("http://localhost:5000/api/admin/registration-status");
        setRegistrationStatus(statusRes.data || { isOpen: false });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        toast.error("Failed to load dashboard data!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    setTimeout(() => navigate("/"), 1000);
  };

  const { isOpen, startDate, endDate } = registrationStatus;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-800">
        <h2 className="text-xl">Loading Dashboard...</h2>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-800">
        <h2 className="text-xl">Unable to load profile. Please login again.</h2>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />

      {/* Navbar */}
      <header className="bg-[#7a0c0c] text-white py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-lg font-bold">Student Dashboard</h1>
          <nav className="flex items-center gap-3">
            <button
              className="px-3 py-1 rounded text-white hover:bg-white hover:text-[#7a0c0c] transition"
              onClick={handleLogout}
            >
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

          {/* Registration Status Banner */}
          <div
            className={`mb-6 p-4 rounded-md text-center font-medium ${
              isOpen
                ? "bg-green-100 text-green-800 border border-green-400"
                : "bg-red-100 text-red-800 border border-red-400"
            }`}
          >
            {isOpen ? (
              <>
                ✅ Registration is currently <strong>OPEN</strong>.
                {startDate && endDate && (
                  <p className="text-sm mt-1">
                    Open from <strong>{formatDate(startDate)}</strong> to{" "}
                    <strong>{formatDate(endDate)}</strong>.
                  </p>
                )}
              </>
            ) : (
              "❌ Registration is currently CLOSED by the Admin."
            )}
          </div>

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
            {/* Available Courses */}
            <div
              className={`rounded-lg p-6 shadow-md border-t-4 border-[#0f6a36] transition ${
                isOpen
                  ? "bg-white hover:shadow-lg cursor-pointer"
                  : "bg-gray-100 cursor-not-allowed opacity-70"
              }`}
              onClick={() => {
                if (isOpen) {
                  navigate("/available-courses");
                } else {
                  toast.error("Registration is closed!");
                }
              }}
            >
              <h3
                className={`text-lg font-semibold ${
                  isOpen ? "text-[#7a0c0c]" : "text-gray-500"
                }`}
              >
                📚 Available Courses
              </h3>
              <p className="text-gray-600">
                {isOpen
                  ? "Browse and register for new courses"
                  : "You cannot register for courses right now"}
              </p>
            </div>

            {/* My Registrations */}
            <div
              className="bg-white rounded-lg p-6 shadow-md border-t-4 border-[#0f6a36] hover:shadow-lg cursor-pointer transition"
              onClick={() => navigate("/my-registrations")}
            >
              <h3 className="text-lg font-semibold text-[#7a0c0c]">
                📝 My Registrations
              </h3>
              <p className="text-gray-600">Check your registration status</p>
            </div>

            {/* Performance / Analytics */}
            <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-[#0f6a36] hover:shadow-lg cursor-pointer transition">
              <h3 className="text-lg font-semibold text-[#7a0c0c]">
                📈 Performance Insights
              </h3>
              <p className="text-gray-600">
                View analytics and personalized recommendations
              </p>
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
