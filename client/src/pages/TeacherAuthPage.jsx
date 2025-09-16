// src/pages/TeacherAuthPage.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isLogin && form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Teacher Login
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: form.email,
          password: form.password,
          role: "TEACHER",
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/teacher-dashboard");
      } else {
        // Teacher Signup
        const res = await axios.post(
          "http://localhost:5000/api/auth/signup/teacher",
          {
            email: form.email,
            password: form.password,
            name: form.name,
            employeeId: form.employeeId,
            designation: form.designation,
            dept: form.dept,
            role: "TEACHER",
          }
        );

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/teacher-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-[#7a0c0c] text-white py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold">Teacher Portal</h1>
          <nav>
            <button
              onClick={() => setIsLogin(true)}
              className={`px-3 py-1 rounded ${
                isLogin ? "bg-white text-[#7a0c0c]" : "text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`ml-2 px-3 py-1 rounded ${
                !isLogin ? "bg-white text-[#7a0c0c]" : "text-white"
              }`}
            >
              Register
            </button>
          </nav>
        </div>
      </header>

      {/* Auth Card */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full border-t-4 border-[#0f6a36] shadow">
          <h2 className="text-2xl font-bold text-center text-[#7a0c0c] mb-6">
            {isLogin ? "Teacher Login" : "Teacher Registration"}
          </h2>

          {error && (
            <p className="text-center text-red-600 text-sm mb-4">{error}</p>
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
              className="w-full bg-[#0f6a36] hover:bg-green-800 text-white py-2 rounded-lg font-semibold"
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Register"}
            </button>
          </form>

          {/* Switch link */}
          <p className="text-center text-sm mt-4 text-gray-600">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  className="text-[#7a0c0c] font-semibold"
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  className="text-[#7a0c0c] font-semibold"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <footer className="bg-[#0f6a36] text-white text-center py-2 text-sm">
        © 2025 Teacher Portal
      </footer>
    </div>
  );
}
