// src/pages/HomePage.jsx
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-amber-50 to-amber-100">
      {/* Navbar */}
      <header className="bg-gradient-to-r from-amber-300 via-amber-200 to-slate-100 text-slate-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition">
              <span className="text-amber-700 text-2xl font-bold">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Course Portal</h1>
              <p className="text-slate-500 text-xs">Registration System</p>
            </div>
          </div>

          {/* Navbar Buttons */}
          <nav className="flex space-x-3">
            <button
              onClick={() => navigate("/auth-student")}
              className="bg-white text-slate-700 hover:bg-amber-50 px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              👨‍🎓 Student
            </button>

            <button
              onClick={() => navigate("/auth-teacher")}
              className="bg-white text-slate-700 hover:bg-amber-50 px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              👨‍🏫 Teacher
            </button>

            <button
              onClick={() => navigate("/admin/login")}
              className="bg-slate-300 hover:bg-slate-400 text-slate-900 px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              ⚙️ Admin
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center p-8">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-900 text-sm font-semibold mb-8 shadow-sm border border-amber-200">
            <span className="mr-2">✨</span>
            Streamlined Course Management
          </div>

          {/* Main Heading */}
          <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 bg-clip-text text-transparent">
              Smart Course
            </span>
            <br />
            <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
              Registration System
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Simplify your academic journey with our intelligent course registration platform designed for students, teachers, and administrators.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            {/* Students Card */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-amber-100 group">
              <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-amber-200 transition">
                <span className="text-4xl">👨‍🎓</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">For Students</h3>
              <p className="text-gray-600 text-sm mb-4">
                Access your course dashboard and registration tools.
              </p>
              <div className="h-1 w-12 bg-gradient-to-r from-amber-300 to-slate-400 rounded-full mx-auto"></div>
            </div>

            {/* Teachers Card */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-amber-100 group">
              <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-amber-200 transition">
                <span className="text-4xl">👨‍🏫</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">For Teachers</h3>
              <p className="text-gray-600 text-sm mb-4">
                Manage courses, review student registrations, and guide academic excellence.
              </p>
              <div className="h-1 w-12 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full mx-auto"></div>
            </div>

            {/* Admins Card */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-amber-100 group">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-slate-200 transition">
                <span className="text-4xl">⚙️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">For Admins</h3>
              <p className="text-gray-600 text-sm mb-4">
                Control registration periods, manage users, and oversee the entire system.
              </p>
              <div className="h-1 w-12 bg-gradient-to-r from-amber-300 to-slate-400 rounded-full mx-auto"></div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigate("/auth-student")}
              className="group bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-900 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-bold text-lg w-full sm:w-auto"
            >
              <span className="flex items-center justify-center">
                Get Started as Student
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>

            <button
              onClick={() => navigate("/auth-teacher")}
              className="group bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-slate-900 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-bold text-lg w-full sm:w-auto"
            >
              <span className="flex items-center justify-center">
                Get Started as Teacher
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>

            <button
              onClick={() => navigate("/admin/login")}
              className="group bg-gradient-to-r from-slate-300 to-slate-400 hover:from-slate-400 hover:to-slate-500 text-slate-900 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-bold text-lg w-full sm:w-auto"
            >
              <span className="flex items-center justify-center">
                Admin Portal
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>

          {/* Features List */}
          <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Easy Course Discovery</h4>
                <p className="text-sm text-gray-600 mt-1">Find and register for courses in just a few clicks</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Real-Time Updates</h4>
                <p className="text-sm text-gray-600 mt-1">Instant notifications for registration status changes</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Secure Access</h4>
                <p className="text-sm text-gray-600 mt-1">Protected accounts with role-based access control</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Smart Analytics</h4>
                <p className="text-sm text-gray-600 mt-1">Comprehensive dashboards for admins and teachers</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-200 to-slate-200 text-slate-900 text-center py-6 mt-auto border-t-4 border-amber-300">
        <p className="font-semibold">© 2025 Course Registration Portal</p>
        <p className="text-slate-600 text-sm mt-2">Designed for Excellence • Empowering Education</p>
      </footer>
    </div>
  );
}

