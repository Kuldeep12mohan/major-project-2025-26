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
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Toaster position="top-right" />

            {/* Navbar */}
            <header className="bg-[#7a0c0c] text-white py-3 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
                    <h1 className="text-lg font-bold cursor-pointer" onClick={() => navigate("/dashboard")}>
                        Student Dashboard
                    </h1>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center py-10 px-4">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-t-4 border-[#0f6a36]">
                    <h2 className="text-2xl font-bold text-[#7a0c0c] mb-6 text-center">Edit Profile</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f6a36]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Semester</label>
                            <input
                                type="number"
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f6a36]"
                                required
                                min="1"
                                max="8"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Department</label>
                            <select
                                name="dept"
                                value={formData.dept}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f6a36]"
                                required
                            >
                                <option value="">Select Department</option>
                                {["CS", "ECE", "AI", "EE", "ME", "AE", "CE", "CHE", "PTK", "FTB"].map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#0f6a36] text-white py-2 rounded-md hover:bg-[#0a4d26] transition font-semibold"
                        >
                            Save Changes
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="w-full bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition font-semibold"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditProfile;
