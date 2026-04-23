import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../utils/utils.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${base_url}/api/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );

      toast.success(response.data.message || "Reset instructions sent.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 flex flex-col">
      <Toaster position="top-right" />

      <header className="bg-amber-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Forgot Password</h1>
            <p className="text-sm text-amber-200">Recover your account securely.</p>
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
              Enter the email address associated with your account.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:outline-none"
                  placeholder="you@example.com"
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
                {loading ? "Sending link..." : "Send password reset link"}
              </button>
            </form>

            <div className="mt-10 text-center text-sm text-gray-600">
              Remembered your password?{' '}
              <button
                className="text-amber-700 font-semibold hover:text-amber-900"
                onClick={() => navigate("/auth-student")}
              >
                Login now
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
