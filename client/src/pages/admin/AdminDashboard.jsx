import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { BASE_URL } from "../../utils/utils.js"

export default function AdminDashboard() {
  const navigate = useNavigate();

  // States
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("registrations");

  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [status, setStatus] = useState({ isOpen: false });

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingMappings, setLoadingMappings] = useState(false);

  const [filters, setFilters] = useState({
    dept: "",
    year: "",
    semester: "",
    query: "",
  });

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  // Loader
  const Loader = () => (
    <div className="w-full flex justify-center py-10">
      <div className="animate-spin h-10 w-10 border-4 border-red-800 border-t-transparent rounded-full"></div>
    </div>
  );

  // ✅ Load Admin from Server (No LocalStorage)
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/auth/me`, { withCredentials: true })
      .then((res) => {
        if (res.data.user.role !== "ADMIN") {
          toast.error("Unauthorized access");
          navigate("/admin/login");
        } else {
          setAdmin(res.data.user);
        }
      })
      .catch(() => {
        toast.error("Please login again");
        navigate("/admin/login");
      });
  }, []);

  // ✅ Fetch registration status
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/admin/registration-status`, { withCredentials: true })
      .then((res) => setStatus(res.data))
      .catch(() => toast.error("Failed to load status"));
  }, []);

  // ✅ Fetch students, teachers, mappings
  const fetchAllData = async () => {
    try {
      setLoadingData(true);

      const [sRes, tRes, mRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/students`, { withCredentials: true }),
        axios.get(`${BASE_URL}/api/admin/teachers`, { withCredentials: true }),
        axios.get(`${BASE_URL}/api/admin/mappings`, { withCredentials: true }),
      ]);

      setStudents(sRes.data.students || []);
      setTeachers(tRes.data.teachers || []);
      setMappings(mRes.data.mappings || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoadingData(false);
      setLoadingStudents(false);
      setLoadingTeachers(false);
      setLoadingMappings(false);
    }
  };

  useEffect(() => {
    if (activeTab === "manageUsers") fetchAllData();
  }, [activeTab]);

  // ✅ Filtering Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filters.dept && s.dept !== filters.dept) return false;
      if (filters.semester && String(s.semester) !== filters.semester) return false;

      if (filters.year) {
        const y = Math.ceil(s.semester / 2);
        if (String(y) !== filters.year) return false;
      }

      if (filters.query) {
        const q = filters.query.toLowerCase();
        return (
          s.user?.name?.toLowerCase().includes(q) ||
          s.enrollNo?.toLowerCase().includes(q) ||
          s.user?.email?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, filters]);

  // ✅ Select Students
  const toggleStudent = (id) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const all = filteredStudents.map((s) => s.id);
    const allSelected = all.every((id) => selectedStudents.has(id));
    setSelectedStudents(allSelected ? new Set() : new Set(all));
  };

  // ✅ Map Single
  const mapSingle = async (studentId) => {
    if (!selectedTeacher) return toast.error("Select a teacher");

    try {
      await axios.post(
        `${BASE_URL}/api/admin/map-student`,
        { studentId, teacherId: Number(selectedTeacher) },
        { withCredentials: true }
      );
      toast.success("Mapped successfully");
      fetchAllData();
    } catch {
      toast.error("Mapping failed");
    }
  };

  // ✅ Bulk Mapping: Selected Students
  const mapSelected = async () => {
    if (!selectedTeacher) return toast.error("Select a teacher");
    if (selectedStudents.size === 0) return toast.error("Select students");

    try {
      await axios.post(
        `${BASE_URL}/api/admin/map-many`,
        { studentIds: [...selectedStudents], teacherId: Number(selectedTeacher) },
        { withCredentials: true }
      );

      toast.success("Bulk mapping complete");
      setSelectedStudents(new Set());
      fetchAllData();
    } catch {
      toast.error("Bulk mapping failed");
    }
  };

  // ✅ Bulk Mapping: Map All Filtered
  const mapAllFiltered = async () => {
    if (!selectedTeacher) return toast.error("Select a teacher");
    if (filteredStudents.length === 0) return toast.error("No students found");

    try {
      await axios.post(
        `${BASE_URL}/api/admin/map-many`,
        {
          studentIds: filteredStudents.map((s) => s.id),
          teacherId: Number(selectedTeacher),
        },
        { withCredentials: true }
      );

      toast.success("Mapped all filtered students");
      fetchAllData();
    } catch {
      toast.error("Mapping failed");
    }
  };

  // ✅ Registration Toggle
  const startReg = async () => {
    if (!dates.startDate || !dates.endDate)
      return toast.error("Select both dates");

    try {
      await axios.post(
        `${BASE_URL}/api/admin/registration-toggle`,
        { isOpen: true, ...dates },
        { withCredentials: true }
      );

      setStatus({ isOpen: true, ...dates });
      toast.success("Registration opened");
    } catch {
      toast.error("Failed to open registration");
    }
  };

  const closeReg = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/admin/registration-toggle`,
        { isOpen: false },
        { withCredentials: true }
      );

      setStatus({ isOpen: false });
      toast.success("Registration closed");
    } catch {
      toast.error("Failed to close registration");
    }
  };

  // ✅ Logout
  const logout = async () => {
    await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    navigate("/admin/login");
  };

  // ----------------------------------------------------------------
  // RETURN UI
  // ----------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-red-800 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button className="bg-green-700 px-4 py-1 rounded" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center bg-green-50">
        <button
          className={`p-3 ${activeTab === "registrations" && "border-b-4 border-red-700"}`}
          onClick={() => setActiveTab("registrations")}
        >
          Registrations
        </button>

        <button
          className={`p-3 ${activeTab === "manageUsers" && "border-b-4 border-red-700"}`}
          onClick={() => setActiveTab("manageUsers")}
        >
          Student–Teacher Mapping
        </button>
      </div>

      {/* Registration Control */}
      {activeTab === "registrations" && (
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Registration Window</h2>

          <div className="flex gap-4 my-4">
            <input
              type="date"
              className="border p-2"
              value={dates.startDate}
              onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
            />
            <input
              type="date"
              className="border p-2"
              value={dates.endDate}
              onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
            />

            {!status.isOpen ? (
              <button className="bg-green-700 text-white px-4 py-2 rounded" onClick={startReg}>
                Open Registration
              </button>
            ) : (
              <button className="bg-red-700 text-white px-4 py-2 rounded" onClick={closeReg}>
                Close
              </button>
            )}
          </div>

          <p className="text-gray-700">
            Status:{" "}
            {status.isOpen
              ? `Active (${status.startDate} → ${status.endDate})`
              : "Closed"}
          </p>
        </div>
      )}

      {/* Mapping Section */}
      {activeTab === "manageUsers" && (
        <div className="p-6">
          {loadingData ? (
            <Loader />
          ) : (
            <>
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <select
                  value={filters.dept}
                  onChange={(e) => setFilters({ ...filters, dept: e.target.value })}
                  className="border p-2"
                >
                  <option value="">All Departments</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="EE">EE</option>
                </select>

                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="border p-2"
                >
                  <option value="">Year</option>
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>
                      {y} Year
                    </option>
                  ))}
                </select>

                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  className="border p-2"
                >
                  <option value="">Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                <input
                  placeholder="Search name / enroll / email"
                  className="border p-2"
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                />
              </div>

              {/* Teacher Select */}
              <select
                className="border p-2 mb-4"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user.name} ({t.dept})
                  </option>
                ))}
              </select>

              {/* Bulk Actions */}
              <div className="flex gap-4 mb-4">
                <button onClick={mapSelected} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Map Selected ({selectedStudents.size})
                </button>

                <button
                  onClick={mapAllFiltered}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  Map All Filtered ({filteredStudents.length})
                </button>
              </div>

              {/* Student Table */}
              <table className="w-full text-sm border bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={
                          filteredStudents.length > 0 &&
                          filteredStudents.every((s) => selectedStudents.has(s.id))
                        }
                      />
                    </th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Enroll</th>
                    <th className="p-2 border">Dept</th>
                    <th className="p-2 border">Semester</th>
                    <th className="p-2 border">Teacher</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-gray-500">
                        No students match filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-2 border">
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(s.id)}
                            onChange={() => toggleStudent(s.id)}
                          />
                        </td>
                        <td className="p-2 border">{s.user.name}</td>
                        <td className="p-2 border">{s.enrollNo}</td>
                        <td className="p-2 border">{s.dept}</td>
                        <td className="p-2 border">{s.semester}</td>
                        <td className="p-2 border">{s.teacher?.user?.name || "Unassigned"}</td>
                        <td className="p-2 border">
                          <button
                            className="bg-green-700 text-white px-3 py-1 rounded"
                            onClick={() => mapSingle(s.id)}
                          >
                            Map
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
