import React from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-red-700 text-white py-3 px-6 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <button
          className="bg-white text-red-700 px-4 py-1 rounded hover:bg-gray-200 transition"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4 text-red-700">Welcome, {admin?.name || "Admin"}</h2>
        <p className="text-gray-700">
          Your Admin ID: <strong>{admin?.adminProfile?.adminId}</strong>
        </p>
        <p className="text-gray-700 mt-2">Email: {admin?.email}</p>

        {/* Add dashboard content here */}
      </main>
      <footer className="bg-red-800 text-white text-center py-3">© 2025 Student Portal</footer>
    </div>
  );
}
