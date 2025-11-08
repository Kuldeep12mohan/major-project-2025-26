import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../utils/utils";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  const headers = { Authorization: `Bearer ${token}` };

  // Tabs
  const [activeTab, setActiveTab] = useState("registrations");

  // Registration
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [status, setStatus] = useState({ isOpen: false });

  // Data
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [mappings, setMappings] = useState([]);

  // Loading States
  const [loadingData, setLoadingData] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingMappings, setLoadingMappings] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    dept: "",
    year: "",
    semester: "",
    query: "",
  });

  // Selection
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  // ---------------------------
  // Loader Component
  const Loader = () => (
    <div className="w-full flex justify-center py-10">
      <div className="animate-spin h-10 w-10 border-4 border-red-800 border-t-transparent rounded-full"></div>
    </div>
  );

  // ---------------------------
  // FETCH REGISTRATION STATUS
  useEffect(() => {
    axios
      .get(`${base_url}/api/admin/registration-status`)
      .then((res) => setStatus(res.data))
      .catch(() => toast.error("Failed to load status"));
  }, []);

  // ---------------------------
  // FETCH USERS & MAPPINGS
  const fetchAllData = async () => {
    try {
      setLoadingData(true);
      setLoadingStudents(true);
      setLoadingTeachers(true);
      setLoadingMappings(true);

      const [sRes, tRes, mRes] = await Promise.all([
        axios.get(`${base_url}/api/admin/students`, { headers }),
        axios.get(`${base_url}/api/admin/teachers`, { headers }),
        axios.get(`${base_url}/api/admin/mappings`, { headers }),
      ]);

      setStudents(Array.isArray(sRes.data.students) ? sRes.data.students : []);
      setTeachers(Array.isArray(tRes.data.teachers) ? tRes.data.teachers : []);
      setMappings(Array.isArray(mRes.data.mappings) ? mRes.data.mappings : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
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

  // ---------------------------
  // FILTERED STUDENTS
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];

    return students.filter((s) => {
      if (filters.dept && s.dept !== filters.dept) return false;
      if (filters.semester && String(s.semester) !== filters.semester) return false;

      if (filters.year) {
        const derivedYear = Math.ceil((s.semester || 0) / 2);
        if (String(derivedYear) !== filters.year) return false;
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

  // ---------------------------
  // SELECT / UNSELECT STUDENTS
  const toggleStudent = (id) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allIds = filteredStudents.map((s) => s.id);
    const allSelected = allIds.every((id) => selectedStudents.has(id));
    setSelectedStudents(allSelected ? new Set() : new Set(allIds));
  };

  // ---------------------------
  // MAPPING ACTIONS
  const mapSingle = async (studentId) => {
    if (!studentId || !selectedTeacher) return toast.error("Pick student + teacher");

    try {
      await axios.post(
        `${base_url}/api/admin/map-student`,
        { studentId, teacherId: Number(selectedTeacher) },
        { headers }
      );
      toast.success("Mapped!");
      fetchAllData();
    } catch {
      toast.error("Mapping failed");
    }
  };

  const mapSelected = async () => {
    if (!selectedTeacher) return toast.error("Select a teacher");
    if (selectedStudents.size === 0)
      return toast.error("No students selected");

    const ids = Array.from(selectedStudents);

    try {
      await axios.post(
        `${base_url}/api/admin/map-many`,
        { studentIds: ids, teacherId: Number(selectedTeacher) },
        { headers }
      );

      toast.success(`Mapped ${ids.length} students`);
      setSelectedStudents(new Set());
      fetchAllData();
    } catch {
      toast.error("Bulk mapping failed");
    }
  };

  const mapAllFiltered = async () => {
    if (!selectedTeacher) return toast.error("Select a teacher");
    if (filteredStudents.length === 0)
      return toast.error("No students in filter");

    const ids = filteredStudents.map((s) => s.id);

    try {
      await axios.post(
        `${base_url}/api/admin/map-many`,
        { studentIds: ids, teacherId: Number(selectedTeacher) },
        { headers }
      );
      toast.success(`Mapped ${ids.length} students`);
      setSelectedStudents(new Set());
      fetchAllData();
    } catch {
      toast.error("Bulk mapping failed");
    }
  };

  // ---------------------------
  // REGISTRATION CONTROL
  const startReg = async () => {
    const { startDate, endDate } = dates;
    if (!startDate || !endDate) return toast.error("Select both dates");

    try {
      await axios.post(
        `${base_url}/api/admin/registration-toggle`,
        { isOpen: true, startDate, endDate },
        { headers }
      );
      toast.success("Registration opened");
      setStatus({ isOpen: true, startDate, endDate });
    } catch {
      toast.error("Failed to open registration");
    }
  };

  const closeReg = async () => {
    try {
      await axios.post(
        `${base_url}/api/admin/registraion-toggle`,
        { isOpen: false },
        { headers }
      );
      toast.success("Registration closed");
      setStatus({ isOpen: false });
    } catch {
      toast.error("Failed to close registration");
    }
  };

  // ---------------------------
  // LOGOUT
  const logout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  // ---------------------------
  // RENDER UI
  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-red-800 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button className="bg-green-700 px-4 py-1 rounded" onClick={logout}>
          Logout
        </button>
      </div>

      {/* TABS */}
      <div className="flex justify-center bg-green-50">
        <button
          className={`p-3 ${activeTab === "registrations" ? "border-b-4 border-red-700" : ""}`}
          onClick={() => setActiveTab("registrations")}
        >
          Registrations
        </button>

        <button
          className={`p-3 ${activeTab === "manageUsers" ? "border-b-4 border-red-700" : ""}`}
          onClick={() => setActiveTab("manageUsers")}
        >
          Student–Teacher Mappings
        </button>
      </div>

      {/* ------------------------ REGISTRATION TAB ------------------------ */}
      {activeTab === "registrations" && (
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Registration Control</h2>

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
                Close Registration
              </button>
            )}
          </div>

          <p className="text-gray-700">
            Status:{" "}
            {status.isOpen
              ? `Active (${status.startDate} → ${status.endDate})`
              : "Not Active"}
          </p>
        </div>
      )}

      {/* ------------------------ MAPPING TAB ------------------------ */}
      {activeTab === "manageUsers" && (
        <div className="p-6">
          {/* Top-level Loader */}
          {loadingData ? (
            <Loader />
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Student–Teacher Mapping</h2>

              {/* FILTERS */}
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

              {/* TEACHER SELECT */}
              <select
                className="border p-2 mb-4"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.name} ({t.dept})
                  </option>
                ))}
              </select>

              {/* BULK BUTTONS */}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={mapSelected}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Map Selected ({selectedStudents.size})
                </button>

                <button
                  onClick={mapAllFiltered}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  Map All Filtered ({filteredStudents.length})
                </button>
              </div>

              {/* STUDENT TABLE */}
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
                    <th className="p-2 border">Sem</th>
                    <th className="p-2 border">Teacher</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingStudents || loadingTeachers || loadingMappings ? (
                    <tr>
                      <td colSpan="7">
                        <Loader />
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-6 text-gray-500">
                        No students found for selected filters.
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
                        <td className="p-2 border">{s.user?.name}</td>
                        <td className="p-2 border">{s.enrollNo}</td>
                        <td className="p-2 border">{s.dept}</td>
                        <td className="p-2 border">{s.semester}</td>
                        <td className="p-2 border">
                          {s.teacher?.user?.name || "Unassigned"}
                        </td>
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
