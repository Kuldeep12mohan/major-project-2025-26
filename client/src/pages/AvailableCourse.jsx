import React, { useEffect, useState } from "react";
import axios from "axios";

const AvailableCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const currUser = JSON.parse(localStorage.getItem("user"));
  console.log(currUser)
  const semester = currUser?.studentProfile?.semester;
  const dept = currUser?.studentProfile?.dept;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/courses/${semester}/${dept}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourses(res.data.courses);
      } catch (err) {
        console.error("Error fetching courses", err);
      } finally {
        setLoading(false);
      }
    };

    if (semester) fetchCourses();
  }, [semester, dept]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <h2 className="text-xl font-semibold animate-pulse">Loading courses...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 transition-colors">
      {/* Navbar */}
      <header className="bg-green-800 dark:bg-green-700 text-white flex justify-between items-center px-6 py-3 shadow-md">
        <h1 className="text-lg font-semibold tracking-wide">Available Courses</h1>
        <button
          className="bg-white text-green-800 px-4 py-1 rounded-md font-medium hover:bg-gray-200 transition hover:cursor-pointer"
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
          Semester {semester} Courses
        </h2>

        {courses.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            No courses available for this semester.
          </p>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 border-t-4 border-green-700 dark:border-green-500 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 p-6"
              >
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-3">
                  {course.name}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-1">📘 Code: {course.code}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-1">🎓 Credits: {course.credits}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">📅 Semester: {course.semester}</p>

                <button className="w-full mt-auto bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded-lg transition hover:cursor-pointer">
                  Register
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-800 dark:bg-green-700 text-white text-center py-3 mt-auto">
        © 2025 Student Portal
      </footer>
    </div>
  );
};

export default AvailableCourse;
