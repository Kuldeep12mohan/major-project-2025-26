import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { base_url } from "../../utils/utils.js";
import toast, { Toaster } from "react-hot-toast";

export const PendingRegistration = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudents, setExpandedStudents] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get(`${base_url}/api/teacher/pending`, {
          withCredentials: true,
        });
        setPendingRequests(res.data.pending || []);
      } catch (err) {
        console.error("Error fetching pending:", err);
        toast.error(err.response?.data?.error || "Failed to load pending requests");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleAction = async (tempRegId, action) => {
    try {
      const res = await axios.post(
        `${base_url}/api/teacher/verify`,
        { tempRegId, action },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setPendingRequests((prev) => prev.filter((r) => r.id !== tempRegId));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  const toggleStudent = (studentId) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

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
        <h2 className="text-xl">Loading pending registrations...</h2>
      </div>
    );
  }

  const groupedByStudent = pendingRequests.reduce((acc, reg) => {
    const studentId = reg.student.id;
    if (!acc[studentId])
      acc[studentId] = { student: reg.student, registrations: [] };
    acc[studentId].registrations.push(reg);
    return acc;
  }, {});

  const studentCount = Object.keys(groupedByStudent).length;
  const registrationCount = pendingRequests.length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-amber-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-amber-900 font-bold text-lg">📝</span>
            </div>
            <h1 className="text-xl font-bold">Pending Registrations</h1>
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
              Pending <span className="text-amber-800">Registrations</span> 📝
            </h1>
            <p className="text-gray-600">Review and verify course registration requests</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 border-l-4 border-l-amber-700">
              <p className="text-gray-500 text-sm">Pending Requests</p>
              <p className="text-3xl font-bold text-amber-900">{registrationCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 border-l-4 border-l-blue-500">
              <p className="text-gray-500 text-sm">Students</p>
              <p className="text-3xl font-bold text-blue-700">{studentCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 border-l-4 border-l-green-500">
              <p className="text-gray-500 text-sm">Total Registrations</p>
              <p className="text-3xl font-bold text-green-700">{registrationCount}</p>
            </div>
          </div>

          {studentCount === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-8 text-center">
              <p className="text-gray-500 text-lg">✓ No pending registrations at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {Object.values(groupedByStudent).map(({ student, registrations }) => (
                <div
                  key={student.id}
                  className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 border-l-4 border-l-amber-700 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-amber-700 font-bold text-xl">
                          {student.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-900 text-lg">{student.name}</h3>
                        <p className="text-gray-600 text-sm">{student.email}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {registrations.length} course registration(s)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleStudent(student.id)}
                      className="px-5 py-2.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 font-semibold transition"
                    >
                      {expandedStudents[student.id] ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                  {expandedStudents[student.id] && (
                    <div className="mt-5 pt-5 border-t border-stone-200">
                      <div className="grid gap-4">
                        {registrations.map((reg) => (
                          <div
                            key={reg.id}
                            className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-lg p-4 flex justify-between items-center border border-stone-200"
                          >
                            <div>
                              <p className="font-medium text-amber-900 text-lg">
                                📚 {reg.course.name}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Mode: {reg.mode} • Status: {reg.status}
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleAction(reg.id, "approve")}
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition flex items-center gap-2 shadow-md"
                              >
                                <span>✓</span> Approve
                              </button>
                              <button
                                onClick={() => handleAction(reg.id, "reject")}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition flex items-center gap-2 shadow-md"
                              >
                                <span>✗</span> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
