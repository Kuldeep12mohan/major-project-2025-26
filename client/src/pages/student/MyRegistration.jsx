import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../../utils/utils.js";
import { useNavigate } from "react-router-dom";

const MyRegistration = () => {
  const [tempRegs, setTempRegs] = useState([]);
  const [approvedRegs, setApprovedRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const [tempRes, approvedRes] = await Promise.all([
          axios.get(`${base_url}/api/student/temp-registrations`, {
            withCredentials: true,
          }),
          axios.get(`${base_url}/api/student/registration`, { 
            withCredentials: true,
          }),
        ]);

        setTempRegs(tempRes.data.tempRegs || []);
        setApprovedRegs(approvedRes.data.registrations || []);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        toast.error("Failed to load registration data!");
        navigate("/"); 
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${base_url}/api/auth/logout`, {}, { withCredentials: true });
      toast.success("Logged out!");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      toast.error("Logout failed.");
      console.error(err);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 text-gray-900">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-amber-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-amber-900 font-bold text-lg">📝</span>
            </div>
            <h1 className="text-xl font-bold">My Registrations</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-amber-900 px-6 py-2 rounded-lg hover:bg-amber-50 font-semibold transition transform hover:scale-105 shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {/* Pending Registrations Section */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-200">
          <div className="h-1 bg-gradient-to-r from-amber-300 to-amber-500"></div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">⏳</span>
              Pending Registrations
            </h2>

            {tempRegs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No pending registrations</p>
                <p className="text-gray-400 text-sm mt-2">Registrations you submit will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="py-3 px-4 text-left font-bold text-gray-700">Code</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-700">Course Title</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-700">Credits</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-700">Sem</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-700">Dept</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-700">Status</th>
                      <th className="py-3 px-4 text-left font-bold text-gray-700">Verifier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempRegs.map((reg) => (
                      <tr
                        key={reg.id}
                        className="border-b border-gray-200 hover:bg-amber-50 transition"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-amber-800">
                          {reg.course.code}
                        </td>
                        <td className="py-3 px-4 font-semibold">{reg.course.title}</td>
                        <td className="py-3 px-4">
                          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {reg.course.credits}
                          </span>
                        </td>
                        <td className="py-3 px-4">{reg.course.semester}</td>
                        <td className="py-3 px-4 font-semibold">{reg.course.dept}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              reg.status === "APPROVED"
                                ? "bg-amber-100 text-amber-800"
                                : reg.status === "REJECTED"
                                ? "bg-stone-100 text-stone-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{reg.verifier?.user?.name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Approved Registrations Section */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-200">
          <div className="h-1 bg-gradient-to-r from-amber-300 to-amber-500"></div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">✅</span>
              Approved Registrations
            </h2>

            {approvedRegs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No approved registrations yet</p>
                <p className="text-gray-400 text-sm mt-2">Your registered courses will be listed here once approved by your teacher</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {approvedRegs.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-2 border-amber-200 hover:shadow-lg transition"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {reg.course.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        <span className="font-semibold">Code:</span>{" "}
                        <span className="font-mono text-amber-800">{reg.course.code}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Credits</p>
                        <p className="text-lg font-bold text-amber-700">
                          {reg.course.credits}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Type</p>
                        <p className="text-lg font-bold text-amber-700">
                          {reg.course.type}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Semester</p>
                        <p className="text-lg font-bold text-amber-700">
                          {reg.course.semester}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Department</p>
                        <p className="text-lg font-bold text-amber-700">
                          {reg.course.dept}
                        </p>
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white py-2 rounded-lg font-semibold hover:from-amber-800 hover:to-amber-900 transition">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-white text-center py-4 mt-auto">
        <p className="font-semibold">© 2025 Course Registration Portal • Designed for Excellence</p>
      </footer>
    </div>
  );
};

export default MyRegistration;
