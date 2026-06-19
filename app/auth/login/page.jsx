"use client";

import {
  Eye,
  EyeOff,
  LayoutGrid,
  Lock,
  Mail,
} from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import api from "../../lib/api/axios";
import { forgotPassword, updatePassword } from "../../services/authServices";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import ButtonLoader from "../../components/ui/ButtonLoader";

const loginSchema = yup.object({
  email:    yup.string().email("Enter a valid email address").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const forgotEmailSchema = yup.object({
  email: yup.string().email("Enter a valid email address").required("Email is required"),
});

const resetSchema = yup.object({
  newPassword:     yup.string().min(8, "Password must be at least 8 characters").required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotEmail, setForgotEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(loginSchema) });

  const {
    register: forgotReg,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors, isSubmitting: forgotSubmitting },
    reset: resetForgot,
  } = useForm({ resolver: yupResolver(forgotEmailSchema) });

  const {
    register: resetReg,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: resetSubmitting },
  } = useForm({ resolver: yupResolver(resetSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/api/v1/auth/login", {
        email: data.email,
        password: data.password,
      });
      localStorage.setItem("accessToken", res.data?.data?.accessToken);
      toast.success("Welcome back!");
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  const onForgotEmail = async (data) => {
    try {
      const res = await forgotPassword(data.email);
      if (res?.data?.success) {
        setForgotEmail(data.email);
        setForgotStep("reset");
        toast.success("OTP sent to your email");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to send OTP. Please try again.");
    }
  };

  const onResetPassword = async (data) => {
    try {
      const res = await updatePassword({
        email: forgotEmail,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      if (res?.data?.success) {
        toast.success("Password updated successfully! Please sign in.");
        setShowForgot(false);
        setForgotStep("email");
        resetForgot();
      } else {
        toast.error(res?.data?.message ?? "Failed to update password.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Something went wrong.");
    }
  };

  const fieldError = (msg) => msg ? (
    <p className="text-xs text-[#EF4444] mt-1">{msg}</p>
  ) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-[0_4px_12px_rgb(99_102_241/0.3)]">
          <LayoutGrid size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Ar Tiles Emporium</h1>
      </div>

      <main className="w-full max-w-md bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgb(0_0_0/0.12)] border border-[#E2E8F0] overflow-hidden">
        <div className="px-8 py-7 border-b border-[#F1F5F9] text-center">
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Welcome back</h2>
          <p className="text-sm text-[#64748B] mt-1">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <Input id="email" type="email" className="pl-9" placeholder="email@example.com" {...register("email")} />
            </div>
            {fieldError(errors.email?.message)}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[11px] font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-9 pr-10"
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldError(errors.password?.message)}
          </div>

          <Button type="submit" className="w-full mt-2" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <ButtonLoader text="Signing in…" /> : "Sign In"}
          </Button>
        </form>
      </main>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl animate-[fadeInScale_0.25s_ease_both]">
            <h2 className="text-lg font-bold text-[#0F172A] text-center mb-1">
              {forgotStep === "email" ? "Forgot password" : "Reset password"}
            </h2>
            <p className="text-sm text-[#64748B] text-center mb-5">
              {forgotStep === "email"
                ? "Enter your email and we'll send you an OTP"
                : "Enter your new password"}
            </p>

            {forgotStep === "email" && (
              <form onSubmit={handleForgotSubmit(onForgotEmail)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="forgotEmail">Email Address</Label>
                  <Input id="forgotEmail" type="email" placeholder="email@example.com" {...forgotReg("email")} />
                  {fieldError(forgotErrors.email?.message)}
                </div>
                <Button type="submit" className="w-full" disabled={forgotSubmitting}>
                  {forgotSubmitting ? <ButtonLoader text="Sending…" /> : "Send OTP"}
                </Button>
              </form>
            )}

            {forgotStep === "reset" && (
              <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="••••••••" {...resetReg("newPassword")} />
                  {fieldError(resetErrors.newPassword?.message)}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" {...resetReg("confirmPassword")} />
                  {fieldError(resetErrors.confirmPassword?.message)}
                </div>
                <Button type="submit" className="w-full" disabled={resetSubmitting}>
                  {resetSubmitting ? <ButtonLoader text="Updating…" /> : "Update Password"}
                </Button>
              </form>
            )}

            <button
              onClick={() => { setShowForgot(false); setForgotStep("email"); resetForgot(); }}
              className="w-full mt-3 text-sm text-[#94A3B8] hover:text-[#475569] transition-colors py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
