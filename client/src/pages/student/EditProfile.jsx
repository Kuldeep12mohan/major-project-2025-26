import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { base_url } from "../../utils/utils.js";

const EditProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        semester: "",
        dept: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${base_url}/api/auth/profile`, {
                    withCredentials: true,
                });
                const { user } = res.data;
                setFormData({
                    name: user.name || "",
                    semester: user.studentProfile?.semester || "",
                    dept: user.studentProfile?.dept || "",
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching profile:", err);
                toast.error("Failed to load profile.");
                navigate("/dashboard");
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${base_url}/api/student/profile`, formData, {
                withCredentials: true,
            });
            toast.success("Profile updated successfully!");
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error(err.response?.data?.error || "Failed to update profile");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-800">
                <h2 className="text-xl">Loading...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
            <Toaster position="top-right" />

            {/* Header */}
            <header className="bg-amber-900 text-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
                    <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition" onClick={() => navigate("/dashboard")}>
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-amber-900 font-bold text-lg">⚙️</span>
                        </div>
                        <h1 className="text-xl font-bold">Edit Profile</h1>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-white hover:bg-amber-700 px-4 py-2 rounded-lg transition"
                    >
                        ← Back
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-10 px-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 w-full max-w-md">
                    {/* Top Accent */}
                    <div className="h-1 bg-gradient-to-r from-amber-300 to-amber-500"></div>

                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Update Profile</h2>
                        <p className="text-center text-gray-600 text-sm mb-8">Manage your account information</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                                    required
                                />
                            </div>

                            {/* Semester Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                                <input
                                    type="number"
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                                    required
                                    min="1"
                                    max="8"
                                />
                            </div>

                            {/* Department Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                                <select
                                    name="dept"
                                    value={formData.dept}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-semibold transition"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {["CS", "ECE", "AI", "EE", "ME", "AE", "CE", "CHE", "PTK", "FTB"].map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Save Button */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white py-3 rounded-lg hover:from-amber-800 hover:to-amber-900 font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                ✓ Save Changes
                            </button>

                            {/* Cancel Button */}
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-200"
                            >
                                ✕ Cancel
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-stone-900 text-white text-center py-4">
                <p className="font-semibold">© 2025 Course Registration Portal</p>
            </footer>
        </div>
    );
};

export default EditProfile;
