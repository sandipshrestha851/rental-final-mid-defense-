"use client";

import React, { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  UserSquare2,
  Building2,
  Shield,
  Search,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

const FILTERS = [
  { label: "All", icon: UsersIcon },
  { label: "Tenants", icon: UserSquare2 },
  { label: "Landlords", icon: Building2 },
  { label: "Admins", icon: Shield },
];

const ROLE_STYLES: Record<string, string> = {
  Admin: "text-fuchsia-600 bg-fuchsia-50",
  Landlord: "text-blue-600 bg-blue-50",
  Tenant: "text-emerald-600 bg-emerald-50",
};

const STATUS_STYLES: Record<string, string> = {
  Active: "text-emerald-600 bg-emerald-50",
  Pending: "text-amber-600 bg-amber-50",
};

function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

const INITIALS_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-indigo-500",
];

function Avatar({ name, img, id }: { name: string; img?: string; id: number }) {
  if (img) {
    return (
      <img
        src={img}
        alt={name}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const color = INITIALS_COLORS[id % INITIALS_COLORS.length];

  return (
    <div
      className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white ${color}`}
    >
      {initials}
    </div>
  );
}

export function AdminUsersPage() {
  const { user, ready } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    api
      .getUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        console.error("Failed to load users:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ready]);

  const roleMap: Record<string, string> = {
    admin: "Admin",
    landlord: "Landlord",
    tenant: "Tenant",
  };

  const filtered = users.filter((u) => {
    const displayRole = roleMap[u.role?.toLowerCase() ?? ""] ?? u.role;
    const matchesFilter =
      activeFilter === "All" || displayRole === activeFilter.replace(/s$/, "");
    const matchesQuery =
      u.full_name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="text-slate-900 font-sans">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
          <span className="ml-3 text-sm text-slate-500">Loading users...</span>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-slate-900">Users</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage platform users
              </p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search users..."
                className="w-64 rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-600 shadow-sm outline-none placeholder:text-slate-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100 w-fit">
            {FILTERS.map((f) => {
              const active = f.label === activeFilter;
              return (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.label)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <f.icon className="h-4 w-4" strokeWidth={2} />
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  {["User", "Email", "Role", "Status", "Joined", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const displayRole = roleMap[u.role?.toLowerCase() ?? ""] ?? u.role ?? "—";
                  const joined = u.created_at
                    ? new Date(u.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.full_name} id={u.id} />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {u.full_name}
                            </p>
                            {u.phone && (
                              <p className="text-xs text-slate-400">{u.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <Pill className={ROLE_STYLES[displayRole] ?? ""}>
                          {displayRole}
                        </Pill>
                      </td>
                      <td className="px-6 py-4">
                        <Pill className={STATUS_STYLES["Active"]}>
                          Active
                        </Pill>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {joined}
                      </td>
                      <td className="px-6 py-4">
                        <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          <MoreHorizontal className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-slate-400"
                    >
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
