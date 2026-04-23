import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../utils/utils.js";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("token") || "";
    setToken(tokenParam);
  }, [location.search]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Password reset token is missing.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${base_url}/api/auth/reset-password`,
        { token, password },
        { withCredentials: true }
      );

      toast.success(response.data.message || "Password reset successfully.");
      const role = response.data.role;
      const redirectPath =
        role === "TEACHER"
          ? "/auth-teacher"
          : role === "ADMIN"
          ? "/admin/login"
          : "/auth-student";

      setTimeout(() => navigate(redirectPath), 1200);
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 flex flex-col">
      <Toaster position="top-right" />

      <header className="bg-amber-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Change Password</h1>
            <p className="text-sm text-amber-200">Securely update your account password.</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-white text-amber-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-100 transition"
          >
            Back Home
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden">
          <div className="p-10">
            <h2 className="text-3xl font-bold text-amber-900 mb-3">Reset your password</h2>
            <p className="text-sm text-gray-600 mb-8">
              Enter your new password and confirm it to update your account.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:outline-none"
                  placeholder="Create a new password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:outline-none"
                  placeholder="Confirm the new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-2xl text-white font-bold transition ${
                  loading
                    ? "bg-amber-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
                }`}
              >
                {loading ? "Updating password..." : "Reset password"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              Already have a token?{' '}
              <button
                className="text-amber-700 font-semibold hover:text-amber-900"
                onClick={() => navigate("/forgot-password")}
              >
                Request a new reset link
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-amber-200 text-slate-900 text-center py-4">
        <p className="font-semibold">© 2025 Course Registration Portal</p>
      </footer>
    </div>
  );
}
