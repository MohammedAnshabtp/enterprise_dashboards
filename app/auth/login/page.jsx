"use client";
import {
  Briefcase,
  EyeOff,
  LayoutGrid,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import React, { useState } from "react";
import api from "../../lib/api/axios";
import { forgotPassword, updatePassword } from "../../services/authServices";
import { Eye } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  // const handleVerifyOtp = async () => {
  //   setLoading(true);

  //   try {
  //     const signupData = JSON.parse(localStorage.getItem("signupData"));

  //     // ✅ Verify OTP
  //     await api.post("/api/v1/auth/verify/email/otp", {
  //       email: signupData.email,
  //       otp,
  //     });

  //     // ✅ Create account
  //     await api.post("/api/v1/auth/signup", signupData);

  //     // alert("Account created successfully");

  //     localStorage.removeItem("signupData");

  //     setShowOtpModal(false);
  //     setIsLogin(true); // switch to login
  //   } catch (err) {
  //     alert(err?.response?.data?.message || "Invalid OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSendOtp = async () => {
    try {
      setLoading(true);

      const res = await forgotPassword(email);

      if (res?.data?.success) {
        alert("OTP sent successfully");
        setStep("reset");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);

      const res = await updatePassword({
        email,
        newPassword,
        confirmPassword,
      });

      if (res?.data?.success) {
        alert("Password updated successfully");

        setShowForgot(false);
        setStep("email");

        // optional reset fields
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(res?.data?.message);
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);

    try {
      const stored = localStorage.getItem("signupData");
      if (!stored) throw new Error("No signup data found");

      const signupData = JSON.parse(stored);

      await api.post("/api/v1/auth/verify/email/otp", {
        email: signupData.email,
        otp,
      });

      await api.post("/api/v1/auth/signup", signupData);

      localStorage.removeItem("signupData");

      setShowOtpModal(false);
      setIsLogin(true);
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
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[10px] text-primary hover:underline font-bold uppercase"
                >
                  Forgot?
                </button>
              )}
            </div>

            <div className="relative">
              {/* Lock Icon */}
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />

              {/* Input */}
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all text-slate-500"
              />

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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

      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-xl p-6 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-center">
              {step === "email" ? "Forgot Password" : "Reset Password"}
            </h2>

            {/* STEP 1: EMAIL */}
            {step === "email" && (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-primary py-2 rounded-lg font-bold"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {/* STEP 2: RESET PASSWORD */}
            {step === "reset" && (
              <>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />

                <button
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-2 rounded-lg font-bold"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </>
            )}

            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                setShowForgot(false);
                setStep("email");
              }}
              className="w-full text-sm text-gray-500 mt-2"
            >
              Close
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
