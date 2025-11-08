import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

const AvailableCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [registering, setRegistering] = useState(null);

  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    axios
      .get(`${base_url}/api/auth/me`, { withCredentials: true })
      .then((res) => {
        if (res.data.user.role !== "STUDENT") {
          toast.error("Unauthorized access");
          navigate("/auth-student");
        } else {
          setStudent(res.data.user.studentProfile);
        }
      })
      .catch(() => {
        toast.error("Session expired. Please login again.");
        navigate("/auth-student");
      });
  }, []);

  useEffect(() => {
    if (!student) return;

    const fetchCourses = async () => {
      try {
        const res = await axios.get(
          `${base_url}/api/student/${student.semester}/${student.dept}`,
          { withCredentials: true }
        );

        setCourses(res.data.courses || []);
      } catch (err) {
        toast.error("Failed to fetch courses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [student]);
  const handleRegister = async (courseId) => {
    setRegistering(courseId);

    try {
      const res = await axios.post(
        `${base_url}/api/student/register`,
        { courseIds: [courseId], mode: "A" },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Registration successful!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
      console.error(err);
    } finally {
      setRegistering(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCourse(expandedCourse === id ? null : id);
  };

  const logout = async () => {
    await axios.post(`${base_url}/api/auth/logout`, {}, { withCredentials: true });
    navigate("/");
  };

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <h2 className="text-xl font-semibold animate-pulse">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Toaster position="top-right" />
      <header className="bg-green-800 text-white flex justify-between items-center px-6 py-3 shadow-md">
        <h1 className="text-lg font-semibold">Available Courses</h1>
        <button
          onClick={logout}
          className="bg-white text-green-800 px-4 py-1 rounded-md hover:bg-gray-200 transition"
        >
          Logout
        </button>
      </header>
      <main className="flex-1 p-6 md:p-10">
        <h2 className="text-2xl font-bold text-center mb-8">
          Semester {student.semester} Courses ({student.dept})
        </h2>

        {courses.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No courses available for this semester.
          </p>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border-t-4 border-green-700 rounded-2xl shadow-md hover:shadow-xl transition p-6 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-700 mb-1">📘 Code: {course.code}</p>
                  <p className="text-gray-700 mb-1">
                    🎓 Credits: {course.credits}
                  </p>
                  <p className="text-gray-700 mb-3">
                    🏛️ Type: {course.type} | Semester: {course.semester}
                  </p>

                  <button
                    onClick={() => toggleExpand(course.id)}
                    className="text-green-700 underline text-sm hover:text-green-900 transition"
                  >
                    {expandedCourse === course.id
                      ? "Hide Details ▲"
                      : "View Details ▼"}
                  </button>

                  {expandedCourse === course.id && (
                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                      <p><strong>Department:</strong> {course.dept}</p>
                      <p><strong>Active:</strong> {course.active ? "✅ Yes" : "❌ No"}</p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {new Date(course.createdAt).toLocaleDateString("en-IN")}
                      </p>
                      <p>
                        <strong>Updated:</strong>{" "}
                        {new Date(course.updatedAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRegister(course.id)}
                  disabled={registering === course.id}
                  className={`w-full mt-5 bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded-lg transition ${
                    registering === course.id ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {registering === course.id ? "Registering..." : "Register"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-green-800 text-white text-center py-3 mt-auto">
        © 2025 Student Portal
      </footer>
    </div>
  );
};

export default AvailableCourse;
