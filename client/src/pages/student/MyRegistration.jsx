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
          axios.get(`${base_url}/api/student/registration`, { // updated route for verified/approved
            withCredentials: true,
          }),
        ]);

        setTempRegs(tempRes.data.tempRegs || []); // array of temp registrations
        setApprovedRegs(approvedRes.data.registrations || []);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        toast.error("Failed to load registration data!");
        navigate("/"); // session expired
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Toaster position="top-right" />

      {/* Navbar */}
      <header className="bg-green-800 text-white py-4 shadow-md px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold">My Registrations</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-green-800 px-4 py-1 rounded-md font-medium hover:bg-gray-200 transition"
        >
          Logout
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-10">

        {/* Temporary Registrations */}
        <section className="bg-white rounded-lg shadow-md border-t-4 border-yellow-600 p-6">
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4">
            Pending / Temporary Registrations
          </h2>

          {tempRegs.length === 0 ? (
            <p className="text-gray-600">No pending or temporary registrations.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 rounded-md">
                <thead className="bg-gray-100 text-gray-800">
                  <tr>
                    <th className="py-2 px-4 border-b">Course Code</th>
                    <th className="py-2 px-4 border-b">Title</th>
                    <th className="py-2 px-4 border-b">Credits</th>
                    <th className="py-2 px-4 border-b">Semester</th>
                    <th className="py-2 px-4 border-b">Dept</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Verifier</th>
                  </tr>
                </thead>
                <tbody>
                  {tempRegs.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{reg.course.code}</td>
                      <td className="py-2 px-4 border-b">{reg.course.title}</td>
                      <td className="py-2 px-4 border-b">{reg.course.credits}</td>
                      <td className="py-2 px-4 border-b">{reg.course.semester}</td>
                      <td className="py-2 px-4 border-b">{reg.course.dept}</td>
                      <td
                        className={`py-2 px-4 border-b font-semibold ${
                          reg.status === "APPROVED"
                            ? "text-green-700"
                            : reg.status === "REJECTED"
                            ? "text-red-700"
                            : "text-yellow-600"
                        }`}
                      >
                        {reg.status}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {reg.verifier?.user?.name || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Approved / Verified Registrations */}
        <section className="bg-white rounded-lg shadow-md border-t-4 border-green-700 p-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">
            Verified / Approved Registrations
          </h2>

          {approvedRegs.length === 0 ? (
            <p className="text-gray-600">No verified registrations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 rounded-md">
                <thead className="bg-gray-100 text-gray-800">
                  <tr>
                    <th className="py-2 px-4 border-b">Course Code</th>
                    <th className="py-2 px-4 border-b">Title</th>
                    <th className="py-2 px-4 border-b">Credits</th>
                    <th className="py-2 px-4 border-b">Type</th>
                    <th className="py-2 px-4 border-b">Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedRegs.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{reg.course.code}</td>
                      <td className="py-2 px-4 border-b">{reg.course.title}</td>
                      <td className="py-2 px-4 border-b">{reg.course.credits}</td>
                      <td className="py-2 px-4 border-b">{reg.course.type}</td>
                      <td className="py-2 px-4 border-b">{reg.course.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white text-center py-3 text-sm mt-auto">
        © 2025 Student Portal
      </footer>
    </div>
  );
};

export default MyRegistration;
