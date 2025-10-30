// src/pages/AdminLoginPage.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", adminId: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login/admin", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.user));
      toast.success("Login successful!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Toaster position="top-right" />

      {/* Navbar */}
      <header className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white py-5 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Course Registration Portal
          </h1>
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
          >
            ⬅ Back to Home
          </button>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-800 to-red-700 rounded-full flex items-center justify-center shadow-lg mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0-1.1.9-2 2-2h1V7h-1a4 4 0 00-4 4v2H8v3h2v6h3v-6h2l1-3h-3v-2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-red-800 mb-1">Admin Login</h2>
            <p className="text-gray-600 text-sm">
              Sign in to manage registration cycles and courses
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:ring-2 focus:ring-red-700 focus:border-red-700 rounded-lg p-3 text-gray-800 outline-none transition"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin ID
              </label>
              <input
                type="text"
                name="adminId"
                value={form.adminId}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:ring-2 focus:ring-red-700 focus:border-red-700 rounded-lg p-3 text-gray-800 outline-none transition"
                placeholder="Enter your admin ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:ring-2 focus:ring-red-700 focus:border-red-700 rounded-lg p-3 text-gray-800 outline-none transition"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white text-lg transition-all duration-300 shadow-md hover:shadow-xl ${
                loading
                  ? "bg-red-500 opacity-80 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-800 to-red-700 hover:from-red-900 hover:to-red-800"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Not an admin?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-red-700 font-medium hover:underline cursor-pointer"
            >
              Go back to home
            </span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f6a36] text-white text-center py-2 text-sm">
        © 2025 Course Registration Portal
      </footer>
    </div>
  );
}
