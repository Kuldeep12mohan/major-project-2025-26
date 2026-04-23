import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../../utils/utils.js";

export default function TeacherAuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
    designation: "",
    dept: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isLogin) {
        if (!form.name.trim()) {
          throw new Error("Full name is required");
        }
        if (!isValidEmail(form.email)) {
          throw new Error("Enter a valid email address");
        }
        if (form.password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (!form.employeeId.trim()) {
          throw new Error("Employee ID is required");
        }
        if (!form.designation.trim()) {
          throw new Error("Designation is required");
        }
        if (!form.dept.trim()) {
          throw new Error("Department is required");
        }
      } else {
        if (!isValidEmail(form.email)) {
          throw new Error("Enter a valid email address");
        }
        if (form.password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
      }

      if (isLogin) {
        const res = await axios.post(
          `${base_url}/api/auth/login`,
          {
            email: form.email,
            password: form.password,
          },
          { withCredentials: true }
        );

        if (res.data.user.role !== "TEACHER") {
          setError("You are not authorized to login as a teacher.");
          setLoading(false);
          return;
        }

        toast.success("Login successful!");
        navigate("/teacher-dashboard");
      } else {
        await axios.post(
          `${base_url}/api/auth/signup/teacher`,
          {
            email: form.email,
            password: form.password,
            name: form.name,
            employeeId: form.employeeId,
            designation: form.designation,
            dept: form.dept,
          },
          { withCredentials: true }
        );

        navigate("/teacher-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Navbar */}
      <Toaster position="top-right" />
      <header className="bg-amber-900 text-white py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold">Teacher Portal</h1>
          <nav>
            <button
              onClick={() => setIsLogin(true)}
              className={`px-3 py-1 rounded ${
                isLogin ? "bg-white text-amber-900" : "text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`ml-2 px-3 py-1 rounded ${
                !isLogin ? "bg-white text-amber-900" : "text-white"
              }`}
            >
              Register
            </button>
          </nav>
        </div>
      </header>

      {/* Auth Card */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full border-t-4 border-amber-700 shadow">
          <h2 className="text-2xl font-bold text-center text-amber-900 mb-6">
            {isLogin ? "Teacher Login" : "Teacher Registration"}
          </h2>

          {error && (
            <p className="text-center text-amber-700 text-sm mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    placeholder="Enter employee ID"
                    required
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="Enter designation"
                    required
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <input
                    type="text"
                    name="dept"
                    value={form.dept}
                    onChange={handleChange}
                    placeholder="Enter department"
                    required
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>

            {isLogin && (
              <div className="text-right text-sm text-amber-900 hover:text-amber-700 transition">
                <button type="button" onClick={() => navigate("/forgot-password")}>Forgot password?</button>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-lg font-semibold"
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-gray-600">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  className="text-amber-900 font-semibold"
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  className="text-amber-900 font-semibold"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <footer className="bg-stone-900 text-white text-center py-2 text-sm">
        © 2025 Teacher Portal
      </footer>
    </div>
  );
}
