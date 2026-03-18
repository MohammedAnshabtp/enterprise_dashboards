"use client";
import {
  Briefcase,
  LayoutGrid,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import api from "../../lib/api/axios";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  // Form States
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    mobileNumber: "",
    occupation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // ✅ LOGIN FLOW (correct already)
        const res = await api.post("/api/v1/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("accessToken", res.data?.data?.accessToken);

        window.location.href = "/dashboard";
      } else {
        // ✅ STEP 1: ONLY SEND OTP (NOT SIGNUP)
        await api.post("/api/v1/auth/signup/email/get-otp", {
          email: formData.email,
        });

        // alert("OTP sent to your email");

        // ✅ Save form data temporarily
        localStorage.setItem("signupData", JSON.stringify(formData));

        // 👉 Go to OTP page
        setShowOtpModal(true);
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);

    try {
      const signupData = JSON.parse(localStorage.getItem("signupData"));

      // ✅ Verify OTP
      await api.post("/api/v1/auth/verify/email/otp", {
        email: signupData.email,
        otp,
      });

      // ✅ Create account
      await api.post("/api/v1/auth/signup", signupData);

      // alert("Account created successfully");

      localStorage.removeItem("signupData");

      setShowOtpModal(false);
      setIsLogin(true); // switch to login
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light font-display flex flex-col justify-center items-center p-4">
      {/* Brand Logo */}
      <div className="mb-8 flex items-center gap-2 text-black">
        <LayoutGrid size={32} />
        <h1 className="text-2xl font-bold tracking-tight uppercase text-black">
          Ar Tiles Emporium
        </h1>
      </div>

      <main className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-primary/10 overflow-hidden transition-all duration-500">
        {/* Header Section */}
        <div className="bg-primary/5 p-8 text-center border-b border-primary/5">
          <h2 className="text-3xl font-extrabold text-slate-900">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin
              ? "Enter your credentials to access your luxury dashboard."
              : "Join our exclusive circle for premium architectural surfaces."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {!isLogin && (
            <>
              {/* Username Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                    size={18}
                  />
                  <input
                    name="username"
                    type="text"
                    placeholder="Enter Your Username"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all text-slate-400"
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Mobile Number Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                    size={18}
                  />
                  <input
                    name="mobileNumber"
                    type="tel"
                    placeholder="Enter your mobile number"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all text-slate-400"
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Occupation Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">
                  Occupation
                </label>
                <div className="relative">
                  <Briefcase
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                    size={18}
                  />
                  <select
                    name="occupation"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50  border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all appearance-none text-slate-400"
                    onChange={handleChange}
                  >
                    <option value="">Select Occupation</option>
                    <option value="architect">Architect</option>
                    <option value="designer">Interior Designer</option>
                    <option value="contractor">Contractor</option>
                    <option value="homeowner">Homeowner</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email Field (Always visible) */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all text-slate-600"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password Field (Always visible) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-slate-400 ml-1">
                Password
              </label>
              {isLogin && (
                <Link
                  href="/auth/forgot-password"
                  className="text-[10px] text-primary hover:underline font-bold uppercase"
                >
                  Forgot?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all text-slate-500"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary ..."
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Register Now"}
          </button>
        </form>

        {/* Footer / Toggle Section */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            {isLogin ? "New to the Emporium?" : "Already a member?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-primary font-bold hover:underline"
            >
              {isLogin ? "Create an account" : "Log in here"}
            </button>
          </p>
        </div>
      </main>

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-2 text-center text-black">
              Verify OTP
            </h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              Enter the OTP sent to your email
            </p>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border rounded-lg p-3 text-center text-lg tracking-widest text-slate-500"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full mt-4 bg-primary text-white py-3 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={() => setShowOtpModal(false)}
              className="w-full mt-2 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Trust Badge */}
      <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm">
        <ShieldCheck size={16} />
        <p>Your data is secured with AES-256 encryption</p>
      </div>
    </div>
  );
}
