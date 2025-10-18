import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const [activeTab, setActiveTab] = useState("registrations");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="bg-red-700 text-white py-3 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-semibold tracking-wide">Admin Dashboard</h1>
        <button
          className="bg-white text-red-700 px-4 py-1 rounded hover:bg-gray-200 transition"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {/* Welcome Info */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
          Welcome, {admin?.name || "Admin"}
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Admin ID: <strong>{admin?.adminProfile?.adminId || "N/A"}</strong>
        </p>
        <p className="text-gray-700 dark:text-gray-300">Email: {admin?.email || "N/A"}</p>
      </section>

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap justify-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "registrations", label: "Pending Registrations" },
          { id: "manageUsers", label: "Manage Users" },
          { id: "notices", label: "Manage Notices" },
          { id: "applications", label: "Student Applications" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all duration-200 ${activeTab === tab.id
                ? "border-b-4 border-red-700 text-red-700 dark:text-red-400"
                : "text-gray-600 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="flex-1 p-6 space-y-6">
        {activeTab === "registrations" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
              Approve or Reject Registrations
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              View pending student and teacher registration requests.
            </p>
            <div className="border-t border-gray-300 dark:border-gray-700 pt-4 text-sm text-gray-500">
              (Fetch and display pending registrations here)
            </div>
          </div>
        )}

        {activeTab === "manageUsers" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
              Manage Students & Teachers
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              View all registered users, update info, or delete accounts.
            </p>
            <div className="border-t border-gray-300 dark:border-gray-700 pt-4 text-sm text-gray-500">
              (Display all students and teachers here)
            </div>
          </div>
        )}

        {activeTab === "notices" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
              Manage Notices
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Post new notices or delete teacher notices.
            </p>

            <button className="mt-2 bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-lg transition">
              + Add New Notice
            </button>

            <div className="mt-6 border-t border-gray-300 dark:border-gray-700 pt-4 text-sm text-gray-500">
              (List all notices here)
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
              Student Applications
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Review and approve or reject applications submitted by students.
            </p>

            <div className="mt-4 space-y-4">
              {/* Example Card */}
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Leave Request</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Submitted by: <strong>John Doe (Student ID: 2025003)</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Reason: Family emergency
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded">
                    Approve
                  </button>
                  <button className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded">
                    Reject
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-300 dark:border-gray-700 pt-4 text-sm text-gray-500">
                (Fetch and display real student applications here)
              </div>
            </div>
          </div>
        )}
        {activeTab === "registrations" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
              Manage and Approve Registrations
            </h3>

            {/* Registration Control Panel */}
            <div className="mb-6 border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                Registration Period
              </h4>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  />
                </div>

                <button className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md font-medium transition">
                  Start Registration
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Current registration window: <strong>Not active</strong>
              </p>
            </div>

            {/* Approval Section */}
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Review pending student and teacher registration requests below.
            </p>

            <div className="border-t border-gray-300 dark:border-gray-700 pt-4 text-sm text-gray-500">
              (Fetch and display pending registrations here)
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-red-800 text-white text-center py-3">
        © 2025 Student Portal
      </footer>
    </div>
  );
}
