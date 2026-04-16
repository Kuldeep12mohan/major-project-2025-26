// src/pages/StudentAuthPage.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../../utils/utils.js";

export default function StudentAuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const DEPARTMENTS = ["CS", "AI", "ECE", "ME", "EE", "AE", "CE", "CHE", "PTK", "FTB"];

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    enrollNo: "",
    facultyNo: "",
    semester: "",
    dept: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      let res;

      if (isLogin) {
        res = await axios.post(
          `${base_url}/api/auth/login`,
          {
            email: form.email,
            password: form.password,
          },
          { withCredentials: true }
        );

        if (res.data.user.role !== "STUDENT") {
          toast.error("You are not authorized to login as a student.");
          setLoading(false);
          return;
        }

        toast.success("Login successful!");
      } else {
        res = await axios.post(
          `${base_url}/api/auth/signup/student`,
          {
            name: form.name,
            email: form.email,
            password: form.password,
            enrollNo: form.enrollNo,
            facultyNo: form.facultyNo,
            semester: Number(form.semester),
            dept: form.dept,
          },
          { withCredentials: true }
        );

        toast.success("Registration successful!");
      }

      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex flex-col relative">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-amber-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-amber-900 font-bold text-lg">👨‍🎓</span>
            </div>
            <h1 className="text-xl font-bold">Student Portal</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-6 py-2 rounded-lg transition font-semibold ${
                isLogin
                  ? "bg-white text-amber-900 shadow-md"
                  : "text-white hover:bg-amber-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-6 py-2 rounded-lg transition font-semibold ${
                !isLogin
                  ? "bg-white text-amber-900 shadow-md"
                  : "text-white hover:bg-amber-700"
              }`}
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
            {/* Top Accent Bar */}
            <div className="h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700"></div>

            {/* Card Content */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-center text-gray-600 text-sm mb-8">
                {isLogin ? "Login to your student account" : "Create your student account"}
              </p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {!isLogin && (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                        required
                      />
                    </div>

                    {/* Enrollment No */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Enrollment No.
                      </label>
                      <input
                        type="text"
                        name="enrollNo"
                        value={form.enrollNo}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                        required
                      />
                    </div>

                    {/* Faculty No */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Faculty No.
                      </label>
                      <input
                        type="text"
                        name="facultyNo"
                        value={form.facultyNo}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                        required
                      />
                    </div>

                    {/* Semester */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Semester
                      </label>
                      <input
                        type="number"
                        name="semester"
                        value={form.semester}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                        min="1"
                        max="8"
                        required
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        name="dept"
                        value={form.dept}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                        required
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                    required
                  />
                </div>

                {/* Confirm Password */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                      required
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white py-3 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 ${
                    loading ? "opacity-70 cursor-not-allowed" : "hover:from-amber-800 hover:to-amber-900 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </span>
                  ) : isLogin ? (
                    "Login to Dashboard"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Toggle Link */}
              <p className="text-center text-sm text-gray-600 mt-6 pt-6 border-t border-gray-200">
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      className="text-amber-800 font-bold hover:text-amber-900 transition"
                      onClick={() => setIsLogin(false)}
                    >
                      Register Now
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      className="text-amber-800 font-bold hover:text-amber-900 transition"
                      onClick={() => setIsLogin(true)}
                    >
                      Login
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="text-amber-800 hover:text-amber-900 font-semibold transition flex items-center justify-center space-x-2 mx-auto"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-stone-900 text-white text-center py-4 mt-auto">
        <p className="font-semibold">© 2025 Course Registration Portal</p>
      </footer>
    </div>
  );
}
