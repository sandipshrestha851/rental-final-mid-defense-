"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.adminLogin({ username: username.trim(), password });
      login(data);
      router.push("/admin");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Invalid username or password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f3ff] min-h-screen flex items-center justify-center p-5 font-sans">
      <div className="w-full max-w-105 bg-white rounded-[25px] p-8 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(94,53,177,0.2)]">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#EDE7F6] rounded-full flex items-center justify-center mx-auto text-[#5E35B1] transition-transform duration-500 hover:scale-105">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-[#5E35B1] text-2xl font-bold mt-4 tracking-tight">Admin Portal</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in to control dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm transition-all duration-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-slate-700 font-semibold text-sm">Username</label>
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm outline-none transition-all duration-200 focus:border-[#5E35B1] focus:ring-1 focus:ring-[#5E35B1]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-slate-700 font-semibold text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 pr-11 border border-slate-200 rounded-xl text-sm outline-none transition-all duration-200 focus:border-[#5E35B1] focus:ring-1 focus:ring-[#5E35B1]"
                required
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-[#5E35B1] border-slate-300 focus:ring-[#5E35B1]"
              />
              <span>Remember Session</span>
            </label>
            <a href="/signin" className="text-[#5E35B1] hover:underline font-medium">
              User Login?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#5E35B1] hover:bg-[#4A2C91] text-white font-semibold rounded-xl text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg shadow-violet-100"
          >
            {loading ? "Verifying..." : "Login Securely"}
          </button>
        </form>
      </div>
    </div>
  );
}
