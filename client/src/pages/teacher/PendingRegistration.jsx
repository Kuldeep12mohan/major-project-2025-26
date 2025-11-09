import React, { useEffect, useState } from "react";
import axios from "axios";
import { base_url } from "../../utils/utils.js";
import toast, { Toaster } from "react-hot-toast";

export const PendingRegistration = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudents, setExpandedStudents] = useState({});

  // Fetch pending registrations
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get(`${base_url}/api/teacher/pending`, { withCredentials: true });
        setPendingRequests(res.data.pending || []);
      } catch (err) {
        console.error("Error fetching pending registrations:", err);
        toast.error(err.response?.data?.error || "Failed to load pending requests");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  // Approve / Reject
  const handleAction = async (tempRegId, action) => {
    try {
      const res = await axios.post(`${base_url}/api/teacher/verify`, { tempRegId, action }, { withCredentials: true });
      toast.success(res.data.message);
      setPendingRequests((prev) => prev.filter((r) => r.id !== tempRegId));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  // Toggle student accordion
  const toggleStudent = (studentId) => {
    setExpandedStudents((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-800">
        <h2 className="text-xl font-semibold animate-pulse">Loading pending registrations...</h2>
      </div>
    );
  }

  // Group by student
  const groupedByStudent = pendingRequests.reduce((acc, reg) => {
    const studentId = reg.student.id;
    if (!acc[studentId]) acc[studentId] = { student: reg.student, registrations: [] };
    acc[studentId].registrations.push(reg);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Pending Student Registrations</h1>

      {Object.keys(groupedByStudent).length === 0 ? (
        <p className="text-gray-600">No pending registrations at the moment.</p>
      ) : (
        <div className="space-y-4">
          {Object.values(groupedByStudent).map(({ student, registrations }) => (
            <div key={student.id} className="border rounded-md overflow-hidden shadow-sm bg-white">
              {/* Student header */}
              <div
                onClick={() => toggleStudent(student.id)}
                className="bg-gray-100 cursor-pointer flex justify-between items-center px-4 py-2 hover:bg-gray-200 transition"
              >
                <span className="font-semibold">{student.user.name}</span>
                <span>{expandedStudents[student.id] ? "▲" : "▼"}</span>
              </div>

              {/* Registrations table */}
              {expandedStudents[student.id] && (
                <table className="w-full text-left border-t border-gray-200">
                  <thead className="bg-gray-50 text-gray-800">
                    <tr>
                      <th className="py-2 px-4 border-b">Course Code</th>
                      <th className="py-2 px-4 border-b">Course Title</th>
                      <th className="py-2 px-4 border-b">Semester</th>
                      <th className="py-2 px-4 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{reg.course.code}</td>
                        <td className="py-2 px-4 border-b">{reg.course.title}</td>
                        <td className="py-2 px-4 border-b">{reg.course.semester}</td>
                        <td className="py-2 px-4 border-b space-x-2">
                          <button
                            onClick={() => handleAction(reg.id, "APPROVED")}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(reg.id, "REJECTED")}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
