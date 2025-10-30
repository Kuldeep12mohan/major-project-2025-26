// src/pages/HomePage.tsx
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <header className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white py-6 px-8 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Course Registration Portal
            </h1>
          </div>

          {/* ✅ Navbar Buttons */}
          <nav className="flex space-x-4">
            <button
              onClick={() => navigate("/auth-student")}
              className="bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-200 px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl"
            >
              Student Login
            </button>
            <button
              onClick={() => navigate("/auth-teacher")}
              className="bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-200 px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl"
            >
              Teacher Login
            </button>
            <button
              onClick={() => navigate("/admin/login")}
              className="bg-yellow-500 hover:bg-yellow-600 transform hover:scale-105 transition-all duration-200 px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl"
            >
              Admin Login
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center p-8">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-8 shadow-sm">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Streamlined Course Management
          </div>

          <h2 className="text-6xl font-bold bg-gradient-to-r from-red-800 via-red-700 to-red-900 bg-clip-text text-transparent mb-6 leading-tight">
            Welcome to the Course
            <br />
            <span className="text-green-700">Registration System</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            A sophisticated platform designed to streamline course registration
            for students and empower teachers with comprehensive course
            management tools and real-time enrollment insights.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                For Students
              </h3>
              <p className="text-gray-600 text-sm">
                Browse courses, manage registrations, and track your academic
                journey with ease.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-red-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-2 0H5m2 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m6 0v-3a2 2 0 00-2-2h-2a2 2 0 00-2 2v3"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                For Teachers
              </h3>
              <p className="text-gray-600 text-sm">
                Create courses, monitor enrollments, and manage your teaching
                portfolio effectively.
              </p>
            </div>
          </div>

          {/* ✅ CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => navigate("/auth-student")}
              className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg w-full sm:w-auto"
            >
              <span className="flex items-center justify-center">
                I am a Student
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </button>

            <button
              onClick={() => navigate("/auth-teacher")}
              className="group bg-gradient-to-r from-red-800 to-red-700 hover:from-red-900 hover:to-red-800 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg w-full sm:w-auto"
            >
              <span className="flex items-center justify-center">
                I am a Teacher
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </button>

            {/* ✅ New Admin Login Button */}
            <button
              onClick={() => navigate("/admin/login")}
              className="group bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg w-full sm:w-auto"
            >
              <span className="flex items-center justify-center">
                I am an Admin
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f6a36] text-white text-center py-2 text-sm">
        © 2025 Course Registration Portal
      </footer>
    </div>
  );
}
