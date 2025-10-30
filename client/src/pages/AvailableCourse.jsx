import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const AvailableCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [registering, setRegistering] = useState(null);

  const currUser = JSON.parse(localStorage.getItem("user"));
  const semester = currUser?.studentProfile?.semester;
  const dept = currUser?.studentProfile?.dept;
  const token = localStorage.getItem("token");

  // ✅ Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/${semester}/${dept}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error("Error fetching courses", err);
        toast.error(err.response?.data?.error || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    if (semester && dept && token) fetchCourses();
  }, [semester, dept, token]);

  // ✅ Register for a single course
  const handleRegister = async (courseId) => {
    setRegistering(courseId);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/student/register",
        { courseIds: [courseId], mode: "A" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message || "Course registered successfully!");
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setRegistering(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCourse(expandedCourse === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-800 transition">
        <h2 className="text-xl font-semibold animate-pulse">
          Loading courses...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Toaster position="top-right" />

      {/* Navbar */}
      <header className="bg-green-800 text-white flex justify-between items-center px-6 py-3 shadow-md">
        <h1 className="text-lg font-semibold tracking-wide">Available Courses</h1>
        <button
          className="bg-white text-green-800 px-4 py-1 rounded-md font-medium hover:bg-gray-200 transition"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <h2 className="text-2xl font-bold text-center mb-8">
          Semester {semester} Courses ({dept})
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

                  {/* Course Details */}
                  {expandedCourse === course.id && (
                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                      <p>
                        <strong>Department:</strong> {course.dept}
                      </p>
                      <p>
                        <strong>Active:</strong>{" "}
                        {course.active ? "Yes ✅" : "No ❌"}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {new Date(course.createdAt).toLocaleDateString("en-IN")}
                      </p>
                      <p>
                        <strong>Last Updated:</strong>{" "}
                        {new Date(course.updatedAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Register Button */}
                <button
                  onClick={() => handleRegister(course.id)}
                  disabled={registering === course.id}
                  className={`w-full mt-5 bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded-lg transition ${
                    registering === course.id
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {registering === course.id ? "Registering..." : "Register"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white text-center py-3 mt-auto">
        © 2025 Student Portal
      </footer>
    </div>
  );
};

export default AvailableCourse;
