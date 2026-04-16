import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../../utils/utils.js";

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

        const profileRes = await axios.get(`${base_url}/api/auth/profile`, {
          withCredentials: true,
        });
        setProfile(profileRes.data);

        
        const statusRes = await axios.get(
          `${base_url}/api/admin/registration-status`,
          { withCredentials: true }
        );
        setRegistrationStatus(statusRes.data || { isOpen: false });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        toast.error("Session expired. Please login again.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${base_url}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout.");
    }
  };

  const { isOpen, startDate, endDate } = registrationStatus;

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      : null;

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-amber-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-amber-900 font-bold text-lg">🎓</span>
            </div>
            <h1 className="text-xl font-bold">Student Dashboard</h1>
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              Welcome back, <span className="text-amber-800">{profile.user.name}!</span> 👋
            </h1>
            <p className="text-gray-600">Here's your course registration dashboard</p>
          </div>

          {/* Registration Status Card */}
          <div
            className={`mb-8 rounded-xl p-6 shadow-lg border-l-4 transition-all transform ${
              isOpen
                ? "bg-gradient-to-br from-amber-50 to-amber-100 border-l-amber-500 text-amber-900"
                : "bg-gradient-to-br from-slate-100 to-slate-50 border-l-slate-300 text-slate-700"
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">{isOpen ? "✅" : "❌"}</span>
              <h2 className="text-xl font-bold">
                Registration is currently <strong>{isOpen ? "OPEN" : "CLOSED"}</strong>
              </h2>
            </div>
            {isOpen && startDate && endDate && (
              <p className="text-sm ml-12 mt-2 opacity-90">
                📅 Registration window: <strong>{formatDate(startDate)}</strong> to <strong>{formatDate(endDate)}</strong>
              </p>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
              <button
                onClick={() => navigate("/student/profile/edit")}
                className="bg-gradient-to-r from-amber-700 to-amber-800 text-white px-6 py-2 rounded-lg hover:from-amber-800 hover:to-amber-900 font-semibold transition transform hover:scale-105 shadow-md"
              >
                ✏️ Edit Profile
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                <p className="text-sm text-gray-600 mb-1">Enrollment No.</p>
                <p className="text-lg font-bold text-stone-900">{profile.user.studentProfile.enrollNo || "N/A"}</p>
              </div>
              <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                <p className="text-sm text-gray-600 mb-1">Department</p>
                <p className="text-lg font-bold text-stone-900">{profile.user.studentProfile.dept}</p>
              </div>
              <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                <p className="text-sm text-gray-600 mb-1">Semester</p>
                <p className="text-lg font-bold text-stone-900">{profile.user.studentProfile.semester}</p>
              </div>
              <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-lg font-bold text-stone-900 break-all text-sm">{profile.user.email}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Available Courses Card */}
            <div
              className={`rounded-xl shadow-lg border-2 transition-all transform cursor-pointer ${
                isOpen
                  ? "bg-white border-stone-200 hover:shadow-xl hover:-translate-y-1 hover:border-stone-400"
                  : "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
              }`}
              onClick={() =>
                isOpen
                  ? navigate("/available-courses")
                  : toast.error("Registration is closed!")
              }
            >
              <div className="h-1 bg-gradient-to-r from-amber-300 to-amber-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-lg font-bold ${isOpen ? "text-stone-900" : "text-gray-500"}`}>
                    📚 Available Courses
                  </h3>
                  <span className="text-2xl">{isOpen ? "→" : "🔒"}</span>
                </div>
                <p className={`text-sm ${isOpen ? "text-gray-600" : "text-gray-500"}`}>
                  {isOpen
                    ? "Browse and register for new courses"
                    : "Registration is currently closed"}
                </p>
              </div>
            </div>

            {/* My Registrations Card */}
            <div
              className="bg-white rounded-xl shadow-lg border-2 border-stone-200 hover:shadow-xl hover:-translate-y-1 hover:border-stone-400 transition-all transform cursor-pointer p-6"
              onClick={() => navigate("/my-registrations")}
            >
              <div className="h-1 bg-gradient-to-r from-amber-300 to-amber-500 rounded-t-lg mb-4 -mx-6 -mt-6 w-full"></div>
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800">📝 My Registrations</h3>
                  <span className="text-2xl">→</span>
                </div>
                <p className="text-sm text-gray-600">Check your registration status and pending approvals</p>
              </div>
            </div>

            {/* Profile Settings Card */}
            <div
              className="bg-white rounded-xl shadow-lg border-2 border-stone-200 hover:shadow-xl hover:-translate-y-1 hover:border-stone-400 transition-all transform cursor-pointer p-6"
              onClick={() => navigate("/student/profile/edit")}
            >
              <div className="h-1 bg-gradient-to-r from-amber-300 to-amber-500 rounded-t-lg mb-4 -mx-6 -mt-6 w-full"></div>
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800">⚙️ Profile Settings</h3>
                  <span className="text-2xl">→</span>
                </div>
                <p className="text-sm text-gray-600">Update your personal information and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-white text-center py-4 mt-auto">
        <p className="font-medium">© 2025 Course Registration Portal • Designed for Excellence</p>
      </footer>
    </div>
  );
};

export default StudentDashboard;
