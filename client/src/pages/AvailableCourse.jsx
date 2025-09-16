import React, { useEffect, useState } from "react";
import axios from "axios";

const AvailableCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const currUser = JSON.parse(localStorage.getItem("user"));
  const semester = currUser?.studentProfile?.semester;
  const dept = currUser?.studentProfile?.dept;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/courses/${semester}/${dept}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data.courses);
      } catch (err) {
        console.error("Error fetching courses", err);
      } finally {
        setLoading(false);
      }
    };

    if (semester) fetchCourses();
  }, [semester]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-800">
        <h2 className="text-xl font-semibold">Loading courses...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-maroon-700 text-white flex justify-between items-center px-6 py-3">
        <h1 className="text-lg font-semibold">Available Courses</h1>
        <button
          className="bg-white text-maroon-700 px-4 py-1 rounded-md hover:bg-gray-200 transition"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-center text-maroon-700 mb-6">
          Semester {semester} Courses
        </h2>

        {courses.length === 0 ? (
          <p className="text-center text-gray-600">
            No courses available for this semester.
          </p>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border-t-4 border-green-700 rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-maroon-700 mb-2">
                  {course.name}
                </h3>
                <p className="text-gray-600">📘 Code: {course.code}</p>
                <p className="text-gray-600">🎓 Credits: {course.credits}</p>
                <p className="text-gray-600">📅 Semester: {course.semester}</p>
                <button className="mt-4 bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-lg transition">
                  Register
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white text-center py-3">
        © 2025 Student Portal
      </footer>
    </div>
  );
};

export default AvailableCourse;
