import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../../utils/utils.js";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("registrations");

  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [status, setStatus] = useState({ isOpen: false });

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [filters, setFilters] = useState({
    dept: "",
    semester: "",
  });

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [expandedTeacher, setExpandedTeacher] = useState(null);

  const DEPARTMENTS = ["CS", "AI", "ECE", "ME", "EE", "AE", "CHE", "PTK", "FTB", "CE"];

  const Loader = () => (
    <div className="w-full flex justify-center py-10">
      <div className="animate-spin h-10 w-10 border-4 border-amber-700 border-t-transparent rounded-full"></div>
    </div>
  );

  useEffect(() => {
    axios
      .get(`${base_url}/api/auth/me`, { withCredentials: true })
      .then((res) => {
        if (res.data.user.role !== "ADMIN") {
          toast.error("Unauthorized access");
          navigate("/admin/login");
        } else {
          setAdmin(res.data.user);
        }
      })
      .catch(() => {
        toast.error("Please login");
        navigate("/admin/login");
      });
  }, []);


  useEffect(() => {
    axios
      .get(`${base_url}/api/admin/registration-status`, { withCredentials: true })
      .then((res) => setStatus(res.data))
      .catch(() => toast.error("Failed to load status"));
  }, []);

  const fetchAllData = async () => {
    try {
      setLoadingData(true);

      const [sRes, tRes, mRes] = await Promise.all([
        axios.get(`${base_url}/api/admin/students`, { withCredentials: true }),
        axios.get(`${base_url}/api/admin/teachers`, { withCredentials: true }),
        axios.get(`${base_url}/api/admin/mappings`, { withCredentials: true }),
      ]);

      setStudents(sRes.data.students || []);
      setTeachers(tRes.data.teachers || []);
      setMappings(mRes.data.mappings || []);

    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (activeTab === "manageUsers") fetchAllData();
    if (activeTab === "verifications") fetchVerifications();
  }, [activeTab]);

  const fetchVerifications = async () => {
    try {
      setLoadingData(true);
      const res = await axios.get(`${base_url}/api/admin/verifications`, { withCredentials: true });
      setVerifications(res.data.verifications || []);
    } catch {
      toast.error("Failed to load verifications");
    } finally {
      setLoadingData(false);
    }
  };

  const handleVerification = async (registrationId, status) => {
    try {
      await axios.post(
        `${base_url}/api/admin/verify`,
        { registrationId, status },
        { withCredentials: true }
      );
      toast.success(`Registration ${status.toLowerCase()} successfully`);
      fetchVerifications();
    } catch {
      toast.error("Action failed");
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filters.dept && s.dept !== filters.dept) return false;
      if (filters.semester && String(s.semester) !== filters.semester) return false;
      return true;
    });
  }, [students, filters]);

  const mapAllFiltered = async () => {
    if (!selectedTeacher) return toast.error("Select a teacher");
    if (filteredStudents.length === 0) return toast.error("No students found");

    try {
      await axios.post(
        `${base_url}/api/admin/map-many`,
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

  const startReg = async () => {
    if (!dates.startDate || !dates.endDate)
      return toast.error("Select both dates");

    try {
      await axios.post(
        `${base_url}/api/admin/registration-toggle`,
        { isOpen: true, ...dates },
        { withCredentials: true }
      );

  
      const res = await axios.get(`${base_url}/api/admin/registration-status`, { withCredentials: true });
      setStatus(res.data);

      toast.success("Registration opened");
    } catch {
      toast.error("Failed to open registration");
    }
  };

  const closeReg = async () => {
    try {
      await axios.post(
        `${base_url}/api/admin/registration-toggle`,
        { isOpen: false },
        { withCredentials: true }
      );


      const res = await axios.get(`${base_url}/api/admin/registration-status`, { withCredentials: true });
      setStatus(res.data);

      toast.success("Registration closed");
    } catch {
      toast.error("Failed to close registration");
    }
  };

  const logout = async () => {
    await axios.post(`${base_url}/api/auth/logout`, {}, { withCredentials: true });
    navigate("/admin/login");
  };


  return (
    <div className="min-h-screen bg-stone-50">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-amber-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button className="bg-amber-700 px-4 py-1 rounded" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center bg-amber-50 mt-1">
        <button
          className={`p-3 px-6 font-medium ${activeTab === "registrations" && "border-b-4 border-amber-700"}`}
          onClick={() => setActiveTab("registrations")}
        >
          Registrations
        </button>

        <button
          className={`p-3 px-6 font-medium ${activeTab === "manageUsers" && "border-b-4 border-amber-700"}`}
          onClick={() => setActiveTab("manageUsers")}
        >
          Student–Teacher Mapping
        </button>

        <button
          className={`p-3 px-6 font-medium ${activeTab === "verifications" && "border-b-4 border-amber-700"}`}
          onClick={() => setActiveTab("verifications")}
        >
          Verifications
        </button>
      </div>
      {activeTab === "registrations" && (
        <div className="p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Registration Window</h2>

          <div className="flex gap-4 my-4">
            <input
              type="date"
              className="border p-2 rounded"
              value={dates.startDate}
              onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
            />
            <input
              type="date"
              className="border p-2 rounded"
              value={dates.endDate}
              onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
            />

            {!status.isOpen ? (
              <button className="bg-amber-700 text-white px-4 py-2 rounded" onClick={startReg}>
                Open
              </button>
            ) : (
              <button className="bg-amber-900 text-white px-4 py-2 rounded" onClick={closeReg}>
                Close
              </button>
            )}
          </div>

          <p className="text-gray-700 mt-2">
            Status:{" "}
            <span className={status.isActive ? "text-amber-700 font-bold" : "text-stone-700 font-bold"}>
              {status.message}
            </span>
          </p>
        </div>
      )}

      {activeTab === "manageUsers" && (
        <div className="p-6 flex flex-col items-center">
          {loadingData ? (
            <Loader />
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-6">Map Students to a Teacher</h2>

              <div className="flex flex-col gap-4 w-full max-w-md">

                <select
                  value={filters.dept}
                  onChange={(e) => setFilters({ ...filters, dept: e.target.value })}
                  className="border p-3 rounded"
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  className="border p-3 rounded"
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  className="border p-3 rounded"
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
              </div>

             
              <p className="mt-4 text-gray-700">
                <strong>{filteredStudents.length}</strong> students found.
              </p>

             
              <button
                onClick={mapAllFiltered}
                className="mt-6 bg-amber-700 hover:bg-amber-800 transition text-white px-8 py-3 rounded-lg shadow-lg"
              >
                Map All Students
              </button>

             
              <h3 className="text-lg font-semibold mt-10 mb-4">Current Mapping Overview</h3>

              <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-4">
                {teachers.map((teacher) => {
                  const mapped = mappings.filter((m) => m.teacherId === teacher.id);

                  return (
                    <div key={teacher.id} className="border-b py-3">
                      <div
                        className="flex justify-between cursor-pointer"
                        onClick={() =>
                          setExpandedTeacher(expandedTeacher === teacher.id ? null : teacher.id)
                        }
                      >
                        <span className="font-medium">
                          {teacher.user.name} ({teacher.dept})
                        </span>
                        <span className="text-gray-600">{mapped.length} students</span>
                      </div>

                      
                      {expandedTeacher === teacher.id && mapped.length > 0 && (
                        <div className="mt-2 ml-4 text-sm text-gray-700">
                          {mapped.map((stud) => (
                            <div key={stud.id} className="py-1">
                              • {stud.user.name} ({stud.dept} - Sem {stud.semester})
                            </div>
                          ))}
                        </div>
                      )}

                      {expandedTeacher === teacher.id && mapped.length === 0 && (
                        <div className="mt-2 ml-4 text-sm text-gray-500">No students assigned.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

     
      {activeTab === "verifications" && (
        <div className="p-6 flex flex-col items-center w-full">
          <h2 className="text-xl font-semibold mb-6">Pending Course Approvals</h2>

          {loadingData ? (
            <Loader />
          ) : verifications.length === 0 ? (
            <p className="text-gray-600">No pending verifications.</p>
          ) : (
            <div className="w-full max-w-4xl overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-6">Course</th>
                    <th className="py-3 px-6">Verified By</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {verifications.map((v) => (
                    <tr key={v.id} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6">
                        <div className="font-medium">{v.student.user.name}</div>
                        <div className="text-xs text-gray-500">{v.student.enrollNo}</div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="font-medium">{v.course.code}</div>
                        <div className="text-xs text-gray-500">{v.course.title}</div>
                      </td>
                      <td className="py-3 px-6">
                        {v.verifier?.user?.name || "Unknown"}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center gap-2">
                          <button
                            onClick={() => handleVerification(v.id, "APPROVED")}
                            className="bg-amber-700 text-white px-3 py-1 rounded hover:bg-amber-800 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerification(v.id, "REJECTED")}
                            className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
