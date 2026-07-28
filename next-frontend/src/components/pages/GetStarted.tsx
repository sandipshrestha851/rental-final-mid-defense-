"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { api, ApiError } from "@/lib/api";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
};

function GetStarted() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("tenant");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const name = form.full_name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const password = form.password;

    if (!name) {
      setError("Full Name is required.");
      return;
    }
    if (name.length < 2) {
      setError("Full Name must be at least 2 characters.");
      return;
    }
    if (/\d/.test(name)) {
      setError("Full Name cannot contain numbers.");
      return;
    }

    if (!email) {
      setError("Email is required.");
      return;
    }
    // Check if email format looks like a phone number
    if (/^\+?[\d\s\-()]{7,20}$/.test(email)) {
      setError("Email cannot be a phone number.");
      return;
    }
    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    if (phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        setError("Phone number must be exactly 10 digits and contain only numbers.");
        return;
      }
    }

    // Password strength checks matching the backend rules
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one special character.");
      return;
    }

    if (password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.register({
        full_name: name,
        email: email,
        phone: phone,
        password: password,
        role,
      });

      setSuccess("Account created successfully! Redirecting to sign in...");
      setForm(initialForm);
      setTimeout(() => router.push("/signin"), 1500);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f5ff] flex flex-col items-center py-10">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-linear-to-r from-violet-700 to-purple-500 flex items-center justify-center">
          <Home className="text-white w-5 h-5" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">RentNest</h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-slate-900">Create Account</h2>

        <p className="text-center text-gray-500 mt-2 mb-8">Join RentNest today</p>

        {/* Alerts */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm px-4 py-3">
            {success}
          </div>
        )}

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full h-12 border rounded-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full h-12 border rounded-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Phone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full h-12 border rounded-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter a password"
              className="w-full h-12 border rounded-xl pl-12 pr-12 outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="confirm_password"
              type="password"
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Repeat password"
              className="w-full h-12 border rounded-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Role */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("tenant")}
              className={`cursor-pointer h-11 rounded-xl border transition ${
                role === "tenant"
                  ? "bg-violet-100 border-violet-600 text-violet-700 font-semibold"
                  : "border-gray-300 hover:border-violet-500"
              }`}
            >
              Tenant
            </button>

            <button
              type="button"
              onClick={() => setRole("landlord")}
              className={`cursor-pointer h-11 rounded-xl border transition ${
                role === "landlord"
                  ? "bg-violet-100 border-violet-600 text-violet-700 font-semibold"
                  : "border-gray-300 hover:border-violet-500"
              }`}
            >
              Landlord
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="cursor-pointer w-full h-12 rounded-xl bg-linear-to-r from-violet-700 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {/* Footer */}
        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/signin">
            <span className="text-violet-700 font-semibold cursor-pointer hover:underline">
              Sign In
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default GetStarted;
