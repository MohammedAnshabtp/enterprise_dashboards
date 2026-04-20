"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { getProfile } from "../../services/authServices";

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("accessToken");

    // optional: call logout API
    // await api.post("/api/v1/auth/logout");

    router.push("/auth/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProfile();
        setProfile(res?.data?.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
      <h1 className="text-xl font-semibold text-black">User visit</h1>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search products, orders"
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 text-sm text-black"
        />

        <div className="text-right">
          <p className="text-sm font-medium text-black">
            {profile?.name || "Loading..."}
          </p>
          <p className="text-xs text-gray-500">{profile?.email || ""}</p>
          <p className="text-xs text-gray-500">{profile?.role || ""}</p>
        </div>

        {/* Avatar */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setOpen(!open)}
            className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-primary hover:text-white transition-all"
          >
            A
          </div>

          {/* ✅ Dropdown */}
          {open && (
            <div className="absolute right-0 top-11 w-36 bg-white shadow-xl border border-gray-100 rounded-lg py-2 z-50">
              <button
                onClick={() => router.push("/profile")}
                className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2"
              >
                <UserRound size={14} />
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
