import React, { useEffect, useState } from "react";
import axios from "axios";
import { base_url } from "../../utils/utils.js";
import toast, { Toaster } from "react-hot-toast";

export const PendingRegistration = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudents, setExpandedStudents] = useState({});

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-800">
        <h2 className="text-xl font-semibold animate-pulse">
          Loading pending registrations...
        </h2>
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster position="top-right" />

      {/* Title Box - Matches Screenshot */}
      <div className="border-l-4 border-amber-500 bg-white px-4 py-3 rounded shadow mb-6">
        <h1 className="text-xl font-bold text-amber-900">
          Pending Student Registrations
        </h1>
        <p className="text-sm text-gray-600">
          Review and verify course registration requests.
        </p>
      </div>

      {Object.keys(groupedByStudent).length === 0 ? (
        <p className="text-gray-600">No pending registrations at the moment.</p>
      ) : (
        <div className="space-y-5">
          {Object.values(groupedByStudent).map(({ student, registrations }) => (
            <div
              key={student.id}
              className="rounded-lg shadow bg-white border border-amber-800/20"
            >
              {/* Header - Similar to Profile Card */}
              <div
                onClick={() => toggleStudent(student.id)}
                className="cursor-pointer flex justify-between items-center px-4 py-3 bg-amber-50 border-b border-amber-800/20 hover:bg-amber-100 transition"
              >
                <div>
                  <p className="font-semibold text-amber-900">
                    {student.user.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Enrollment: {student.enrollmentNo}
                  </p>
                </div>
                <span className="text-lg text-gray-700">
                  {expandedStudents[student.id] ? "▲" : "▼"}
                </span>
              </div>

              {expandedStudents[student.id] && (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-800 border-b">
                    <tr>
                      <th className="py-2 px-4">Course Code</th>
                      <th className="py-2 px-4">Course Title</th>
                      <th className="py-2 px-4">Semester</th>
                      <th className="py-2 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{reg.course.code}</td>
                        <td className="py-2 px-4 border-b">{reg.course.title}</td>
                        <td className="py-2 px-4 border-b">
                          {reg.course.semester}
                        </td>
                        <td className="py-2 px-4 border-b text-center space-x-2">
                          <button
                            onClick={() => handleAction(reg.id, "APPROVED")}
                            className="bg-amber-700 text-white px-3 py-1 rounded hover:bg-amber-800 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(reg.id, "REJECTED")}
                            className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 transition"
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
