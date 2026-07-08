"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "./AuthShell";
import { AuthCard, AuthHeader } from "@/components/molecules/AuthCard";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { Alert } from "@/components/atoms/Alert";

export function LoginForm() {
  const router = useRouter();
  const { token, ready, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If a session already exists, skip the login screen.
  useEffect(() => {
    if (ready && token) router.push("/chat");
  }, [ready, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login({ email: email.trim(), password });
      login(data);
      router.push("/chat");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Invalid email or password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthHeader title="Welcome back" subtitle="Sign in to start messaging" />

      <AuthCard>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <Alert variant="error">{error}</Alert>}

          <div className="space-y-4">
            <FormField
              label="Email"
              name="email"
              icon={Mail}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <FormField
              label="Password"
              name="password"
              icon={Lock}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" loading={loading}>
            <LogIn className="h-5 w-5" />
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/chat/register"
              className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-all"
            >
              Register here
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
