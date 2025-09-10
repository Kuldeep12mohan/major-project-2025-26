// src/pages/StudentAuthPage.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function StudentAuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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

    try {
      if (isLogin) {
        // Student Login
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: form.email,
          password: form.password,
          role: "STUDENT",
        });
        console.log("Login response:", res.data);
        navigate("/dashboard")

      } else {
        // Student Signup
        const res = await axios.post("http://localhost:5000/api/auth/signup/student", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: "STUDENT",
          enrollNo: form.enrollNo,
          facultyNo: form.facultyNo,
          semester: Number(form.semester),
          dept: form.dept,
        });
        console.log("Signup response:", res.data);
        navigate("/dashboard")
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("API Error:", err.response?.data || err.message);
      } else {
        console.error("Unexpected Error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-[#7a0c0c] text-white py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold">Student Portal</h1>
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
        <div className="bg-white rounded-lg p-8 max-w-md w-full border-t-4 border-[#0f6a36]">
          <h2 className="text-2xl font-bold text-center text-[#7a0c0c] mb-6">
            {isLogin ? "Student Login" : "Student Registration"}
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Student-specific fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Enrollment No.
                  </label>
                  <input
                    type="text"
                    name="enrollNo"
                    value={form.enrollNo}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="Enter enrollment no."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Faculty No.
                  </label>
                  <input
                    type="text"
                    name="facultyNo"
                    value={form.facultyNo}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="Enter faculty no."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Semester
                  </label>
                  <input
                    type="number"
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="Enter semester"
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
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="Enter department"
                  />
                </div>
              </>
            )}

            {/* Common fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Enter your email"
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
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Enter password"
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
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Confirm password"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#0f6a36] hover:bg-green-800 text-white py-2 rounded-lg font-semibold"
            >
              {isLogin ? "Login" : "Register"}
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
        © 2025 StudentPortal
      </footer>
    </div>
  );
}
