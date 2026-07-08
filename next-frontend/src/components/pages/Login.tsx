"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login({ email: email.trim(), password });
      login(data);
      // Route by role; fall back to the chat if no role was set.
      if (data.user.role === "landlord") router.push("/landlord");
      else if (data.user.role === "tenant") router.push("/tenant");
      else router.push("/chat");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Invalid email or password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🏠</div>
          <h2>Room Rental Platform</h2>
          <p>Login to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>

            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <span onClick={togglePassword}>{showPassword ? "🙈" : "👁️"}</span>
            </div>
          </div>

          <div className={styles.options}>
            <label>
              <input type="checkbox" /> Remember Me
            </label>

            <a href="/">Forgot Password?</a>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className={styles.register}>
          Don&apos;t have an account?
          <Link href="/get-started"> Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
