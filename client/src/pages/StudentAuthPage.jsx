// src/pages/StudentAuthPage.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast"; // ✅ for notifications

export default function StudentAuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false); // ✅ Loader state

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

    // basic validation
    if (!isLogin && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      let res;
      if (isLogin) {
        // 🔹 Student Login
        res = await axios.post("http://localhost:5000/api/auth/login", {
          email: form.email,
          password: form.password,
          role: "STUDENT",
        });
        toast.success("Login successful!");
        console.log("res",res.data)
      } else {
        // 🔹 Student Signup
        res = await axios.post(
          "http://localhost:5000/api/auth/signup/student",
          {
            name: form.name,
            email: form.email,
            password: form.password,
            role: "STUDENT",
            enrollNo: form.enrollNo,
            facultyNo: form.facultyNo,
            semester: Number(form.semester),
            dept: form.dept,
          }
        );
        toast.success("Registration successful!");
      }

      // ✅ Save token & user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      console.log("res",res.data)

      // Redirect after short delay
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch(err)  {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "API Error occurred!");
        console.error("API Error:", err.response?.data || err.message);
      } else {
        toast.error("Unexpected error occurred!");
        console.error("Unexpected Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      {/* ✅ Toast container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Navbar */}
      <header className="bg-[#7a0c0c] text-white py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold">Student Portal</h1>
          <nav>
            <button
              onClick={() => setIsLogin(true)}
              className={`px-3 py-1 rounded transition-all duration-200 hover:bg-white hover:text-[#7a0c0c] hover:cursor-pointer ${
                isLogin ? "bg-white text-[#7a0c0c]" : "text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`ml-2 px-3 py-1 rounded transition-all duration-200 hover:bg-white hover:text-[#7a0c0c] hover:cursor-pointer ${
                !isLogin ? "bg-white text-[#7a0c0c]" : "text-white"
              }`}
            >
              Register
            </button>
          </nav>
        </div>
      </header>

      {/* Form Section */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full border-t-4 border-[#0f6a36] shadow-lg">
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
                    required
                  />
                </div>

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
                    required
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
                    required
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
                    required
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
                    required
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
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Enter your email"
                required
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
                required
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
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center bg-[#0f6a36] hover:bg-green-800 text-white py-2 rounded-lg font-semibold transition-all duration-200 hover:cursor-pointer ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  Processing...
                </div>
              ) : isLogin ? (
                "Login"
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Switch link */}
          <p className="text-center text-sm mt-4 text-gray-600">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  className="text-[#7a0c0c] font-semibold hover:underline hover:cursor-pointer"
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  className="text-[#7a0c0c] font-semibold hover:underline hover:cursor-pointer"
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
        © 2025 Student Portal
      </footer>
    </div>
  );
}
