"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Users,
  Calendar,
  FileText,
  Lock,
  UserPlus,
} from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { AuthShell } from "./AuthShell";
import { AuthCard, AuthHeader } from "@/components/molecules/AuthCard";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { Alert } from "@/components/atoms/Alert";

// Single source of truth for the form's shape + initial values.
const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  gender: "",
  date_of_birth: "",
  bio: "",
  password: "",
  confirm_password: "",
};

type FormState = typeof initialForm;

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Generic change handler keyed by the input's `name`.
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        gender: form.gender,
        date_of_birth: form.date_of_birth,
        bio: form.bio.trim(),
        password: password,
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setForm(initialForm);
      setTimeout(() => router.push("/chat/login"), 1500);
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
    <AuthShell>
      <AuthHeader
        title="Create an account"
        subtitle="Join the real-time chat workspace"
      />

      <AuthCard>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <FormField
            label="Full Name"
            name="full_name"
            icon={User}
            type="text"
            required
            value={form.full_name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
          />

          <FormField
            label="Email"
            name="email"
            icon={Mail}
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />

          <FormField
            label="Phone"
            name="phone"
            icon={Phone}
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+977 98XXXXXXXX"
          />

          <FormField
            label="Gender"
            name="gender"
            icon={Users}
            as="select"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </FormField>

          <FormField
            label="Date of Birth"
            name="date_of_birth"
            icon={Calendar}
            type="date"
            value={form.date_of_birth}
            onChange={handleChange}
          />

          <FormField
            label="Bio"
            name="bio"
            icon={FileText}
            as="textarea"
            rows={3}
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell us a little about yourself..."
          />

          <FormField
            label="Password"
            name="password"
            icon={Lock}
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <FormField
            label="Confirm Password"
            name="confirm_password"
            icon={Lock}
            type="password"
            required
            value={form.confirm_password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <Button type="submit" loading={loading}>
            <UserPlus className="h-5 w-5" />
            Register
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/chat/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-all"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
