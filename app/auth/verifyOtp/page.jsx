"use client";
import { useState } from "react";
import api from "../../lib/api/axios";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signupData = JSON.parse(localStorage.getItem("signupData"));

      // ✅ STEP 2: VERIFY OTP
      await api.post("/api/v1/auth/verify/email/otp", {
        email: signupData.email,
        otp,
      });

      // ✅ STEP 3: NOW CREATE ACCOUNT
      const res = await api.post("/api/v1/auth/signup", signupData);

      alert("Account created successfully");

      console.log(res.data);

      // cleanup
      localStorage.removeItem("signupData");

      // 👉 redirect to login
      window.location.href = "/";
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="p-8 space-y-4">
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button disabled={loading}>
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </form>
  );
}
