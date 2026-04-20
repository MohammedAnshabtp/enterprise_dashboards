/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Camera, CircleChevronLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading, updateProfile, uploadAvatar, deleteAvatar } =
    useUserStore();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    occupation: "",
  });

  // Populate form when user is available
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        occupation: user.occupation || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(form);
    alert("Profile Updated ✅");
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <CircleChevronLeft size={26} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">
          Profile Settings
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex justify-center px-4 py-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-8 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar || "https://via.placeholder.com/150"}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
              />

              <label className="absolute bottom-1 right-1 bg-black text-white p-2 rounded-full cursor-pointer hover:scale-105 transition">
                <Camera size={16} />
                <input type="file" hidden onChange={handleFile} />
              </label>
            </div>

            {user?.avatar && (
              <button
                onClick={deleteAvatar}
                className="text-sm text-red-500 flex items-center gap-1 hover:underline"
              >
                <Trash2 size={14} /> Remove Photo
              </button>
            )}

            <h2 className="text-lg font-semibold text-gray-800">
              {form.name || "Your Name"}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Occupation</label>
              <input
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
