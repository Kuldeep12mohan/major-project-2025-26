import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

const AvailableCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
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

        // Remove duplicate courses by title
        const coursesArray = res.data.courses || [];
        const uniqueCourses = Array.from(
          new Map(
            coursesArray.map((course) => [
              course.title?.trim().toLowerCase() || course.id,
              course,
            ])
          ).values()
        );

        setCourses(uniqueCourses);
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
        { courseId, mode: "A" },
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 text-gray-800">
      <Toaster position="top-right" />
      <header className="bg-amber-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-amber-900 font-bold text-lg">📚</span>
            </div>
            <h1 className="text-xl font-bold">Available Courses</h1>
          </div>
          <button
            onClick={logout}
            className="bg-white text-amber-900 px-6 py-2 rounded-lg hover:bg-amber-50 font-semibold transition transform hover:scale-105 shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-stone-900">
              Semester {student.semester} Courses
            </h2>
            <p className="text-center text-gray-600 font-medium">
              Department: <span className="text-amber-800 font-semibold">{student.dept}</span>
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-xl text-gray-500 mb-2">📭 No courses available</p>
                <p className="text-gray-400">Please check back later or contact your administrator.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-stone-200 hover:border-stone-300 group flex flex-col justify-between transform hover:-translate-y-1"
                >
                  <div className="h-2 bg-gradient-to-r from-amber-300 to-amber-500"></div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-stone-900 mb-3 line-clamp-2 group-hover:text-stone-800 transition">
                      {course.title}
                    </h3>
                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-center text-gray-700">
                        <span className="text-amber-800 font-semibold mr-2 min-w-fit">Code:</span>
                        <span className="text-gray-800 font-mono bg-amber-50 px-2 py-1 rounded">{course.code}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <span className="text-amber-800 font-semibold mr-2">Credits:</span>
                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">{course.credits}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <span className="text-amber-800 font-semibold mr-2">Type:</span>
                        <span className="text-gray-800">{course.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => handleRegister(course.id)}
                      disabled={registering === course.id}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        registering === course.id
                          ? "bg-amber-300 text-white cursor-not-allowed"
                          : "bg-gradient-to-r from-amber-700 to-amber-800 text-white hover:from-amber-800 hover:to-amber-900 transform hover:scale-105 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {registering === course.id ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          <span>Register</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-stone-900 text-white text-center py-4 mt-auto">
        <p className="font-medium">© 2025 Course Registration Portal • Designed for Excellence</p>
      </footer>
    </div>
  );
};

export default AvailableCourse;
