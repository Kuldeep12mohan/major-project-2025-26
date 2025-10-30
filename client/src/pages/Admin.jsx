import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("registrations");
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [status, setStatus] = useState({
    isOpen: false,
    startDate: "",
    endDate: "",
  });

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [fetchingMappings, setFetchingMappings] = useState(false);

  // ✅ Fetch registration status on load
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/registration-status");
      setStatus(res.data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch registration status");
    }
  };

  // ✅ Fetch students, teachers & mappings
  const fetchUsersAndMappings = async () => {
    try {
      const [studentsRes, teachersRes, mappingsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/students", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/mappings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStudents(studentsRes.data.students || []);
      setTeachers(teachersRes.data.teachers || []);
      setMappings(mappingsRes.data.mappings || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users or mappings");
    }
  };

  useEffect(() => {
    if (activeTab === "manageUsers") fetchUsersAndMappings();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const handleInputChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const triggerRegistration = async () => {
    if (!dates.startDate || !dates.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/registration-toggle",
        {
          startDate: dates.startDate,
          endDate: dates.endDate,
          isOpen: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data.message || "Registration opened!");
      setStatus({
        isOpen: true,
        startDate: dates.startDate,
        endDate: dates.endDate,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update registration");
    } finally {
      setLoading(false);
    }
  };

  const closeRegistration = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/registration-toggle",
        { isOpen: false },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message || "Registration closed!");
      setStatus({ isOpen: false, startDate: "", endDate: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to close registration");
    } finally {
      setLoading(false);
    }
  };

  const mapStudentToTeacher = async () => {
    if (!selectedStudent || !selectedTeacher) {
      toast.error("Please select both student and teacher");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/map-student",
        { studentId: selectedStudent, teacherId: selectedTeacher },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      setSelectedStudent("");
      setSelectedTeacher("");
      fetchUsersAndMappings(); // ✅ Refresh mappings
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Mapping failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 transition-all duration-300">
      <Toaster position="top-right" />

      {/* Navbar */}
      <header className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white py-5 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex justify-center bg-green-50 border-y border-gray-200 shadow-sm">
        {[
          { id: "registrations", label: "Manage Registrations" },
          { id: "manageUsers", label: "Student–Teacher Mappings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold text-sm transition-all ${
              activeTab === tab.id
                ? "border-b-4 border-red-700 text-red-800 bg-white"
                : "text-gray-600 hover:text-red-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-6 py-10 max-w-6xl mx-auto space-y-8">
        {/* 🔹 Registration Tab */}
        {activeTab === "registrations" && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h3 className="text-2xl font-semibold text-red-800 mb-6">
              Registration Control
            </h3>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <input
                type="date"
                name="startDate"
                value={dates.startDate}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md px-3 py-1"
              />
              <input
                type="date"
                name="endDate"
                value={dates.endDate}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md px-3 py-1"
              />

              {status.isOpen ? (
                <button
                  onClick={closeRegistration}
                  disabled={loading}
                  className="bg-red-700 text-white px-5 py-2 rounded-lg hover:bg-red-800 transition"
                >
                  {loading ? "Processing..." : "Close Registration"}
                </button>
              ) : (
                <button
                  onClick={triggerRegistration}
                  disabled={loading}
                  className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 transition"
                >
                  {loading ? "Processing..." : "Start Registration"}
                </button>
              )}
            </div>

            <p className="text-sm text-gray-700">
              Current window:{" "}
              {status.isOpen
                ? `Active (${new Date(status.startDate).toLocaleDateString()} → ${new Date(
                    status.endDate
                  ).toLocaleDateString()})`
                : "Not Active"}
            </p>
          </div>
        )}

        {/* 🔹 Mapping Tab */}
        {activeTab === "manageUsers" && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h3 className="text-2xl font-semibold text-red-800 mb-6">
              Map Students to Teachers
            </h3>

            {/* Mapping Form */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="border px-3 py-2 rounded-md"
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user?.name} ({s.studentProfile?.enrollNo || s.enrollNo})
                  </option>
                ))}
              </select>

              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="border px-3 py-2 rounded-md"
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.name} ({t.teacherProfile?.designation || t.designation})
                  </option>
                ))}
              </select>

              <button
                onClick={mapStudentToTeacher}
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-md transition"
              >
                Map
              </button>
            </div>

            {/* Mapping Table */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold text-red-800 mb-3">
                Existing Student–Teacher Mappings
              </h4>

              {fetchingMappings ? (
                <p>Loading mappings...</p>
              ) : mappings.length === 0 ? (
                <p className="text-gray-600">No mappings found.</p>
              ) : (
                <table className="w-full text-sm border border-gray-200 rounded-lg shadow-sm bg-white">
                  <thead className="bg-green-50 text-gray-700">
                    <tr>
                      <th className="py-2 px-4 border">Student Name</th>
                      <th className="py-2 px-4 border">Email</th>
                      <th className="py-2 px-4 border">Department</th>
                      <th className="py-2 px-4 border">Teacher Name</th>
                      <th className="py-2 px-4 border">Teacher Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border">{m.user?.name || "—"}</td>
                        <td className="py-2 px-4 border">{m.user?.email || "—"}</td>
                        <td className="py-2 px-4 border">{m.dept}</td>
                        <td className="py-2 px-4 border">
                          {m.teacher?.user?.name || "Unassigned"}
                        </td>
                        <td className="py-2 px-4 border">
                          {m.teacher?.user?.email || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0f6a36] text-white text-center py-3 text-sm mt-auto">
        © 2025 Course Registration Portal
      </footer>
    </div>
  );
}
