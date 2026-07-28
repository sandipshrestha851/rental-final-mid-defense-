"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  MapPin,
  Home,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import type { Property, PropertyStatus } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

const currency = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

// Admin cares about these three actionable states. "Draft" listings are a
// landlord's unpublished work-in-progress and aren't part of the approval
// queue, so they're excluded from the filter tabs (but still counted in "All").
const FILTER_TABS: { key: "all" | PropertyStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Active", label: "Approved" },
  { key: "Rejected", label: "Rejected" },
];

const STATUS_STYLES: Record<PropertyStatus, { label: string; className: string }> = {
  Pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  },
  Active: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  },
  Rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  },
  Draft: {
    label: "Draft",
    className: "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200",
  },
};

const StatusBadge = ({ status }: { status: PropertyStatus }) => {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
};

const PAGE_SIZE = 8;

// ─────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────

export function PropertiesAdmin() {
  const { ready } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | PropertyStatus>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Property | null>(null);
  const [confirm, setConfirm] = useState<{ property: Property; status: PropertyStatus } | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getAllProperties()
      .then((rows) => {
        if (!cancelled) setProperties(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load properties."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready]);

  const updateStatus = async (property: Property, status: PropertyStatus) => {
    setActingId(property.id);
    try {
      const updated = await api.setPropertyStatus(property, status);
      setProperties((prev) => prev.map((p) => (p.id === property.id ? updated : p)));
      setSelected((prev) => (prev && prev.id === property.id ? updated : prev));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update property status.");
    } finally {
      setActingId(null);
      setConfirm(null);
    }
  };

  const counts = useMemo(
    () => ({
      total: properties.length,
      pending: properties.filter((p) => p.status === "Pending").length,
      approved: properties.filter((p) => p.status === "Active").length,
      rejected: properties.filter((p) => p.status === "Rejected").length,
    }),
    [properties]
  );

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesFilter = filter === "all" ? true : p.status === filter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.landlordName ?? "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [properties, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onFilter = (f: "all" | PropertyStatus) => {
    setFilter(f);
    setPage(1);
  };
  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight bg-linear-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">Properties</h1>
        <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block"></span>
          Review property listings submitted by landlords and approve or reject them.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Properties" value={counts.total} icon={<Home className="h-5 w-5" />} accent="text-slate-600 bg-slate-50" />
        <StatCard label="Pending Review" value={counts.pending} icon={<Clock className="h-5 w-5" />} accent="text-amber-600 bg-amber-50" />
        <StatCard label="Approved" value={counts.approved} icon={<CheckCircle2 className="h-5 w-5" />} accent="text-emerald-600 bg-emerald-50" />
        <StatCard label="Rejected" value={counts.rejected} icon={<XCircle className="h-5 w-5" />} accent="text-red-600 bg-red-50" />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by property, location, landlord..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm font-medium text-gray-700 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 placeholder:font-normal"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onFilter(tab.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                  filter === tab.key ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
            <span className="font-semibold">Loading properties…</span>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] uppercase tracking-[0.12em] text-gray-400">
                  <th className="px-4 py-3 font-extrabold">Property</th>
                  <th className="px-4 py-3 font-extrabold">Landlord</th>
                  <th className="px-4 py-3 font-extrabold">Price</th>
                  <th className="px-4 py-3 font-extrabold">Submitted</th>
                  <th className="px-4 py-3 font-extrabold">Status</th>
                  <th className="px-4 py-3 text-right font-extrabold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <p className="text-gray-400 font-medium">No properties match your search.</p>
                    </td>
                  </tr>
                )}
                {paged.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.title} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                            <Home className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-bold text-gray-800">{p.title}</p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-400 font-medium">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {p.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-700">{p.landlordName || `Landlord #${p.landlordId ?? "—"}`}</p>
                      {p.landlordEmail && <p className="text-xs text-gray-400 font-medium">{p.landlordEmail}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-700">{currency(p.price)}</span>
                      <span className="text-gray-400 text-xs font-medium">/mo</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-500">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="View details"
                          onClick={() => setSelected(p)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Accept"
                          disabled={p.status === "Active" || actingId === p.id}
                          onClick={() => setConfirm({ property: p, status: "Active" })}
                          className="rounded-lg p-2 text-emerald-500 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          title="Reject"
                          disabled={p.status === "Rejected" || actingId === p.id}
                          onClick={() => setConfirm({ property: p, status: "Rejected" })}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
            <p className="font-medium">
              Showing <span className="font-bold text-gray-800">{(page - 1) * PAGE_SIZE + 1}</span> to{" "}
              <span className="font-bold text-gray-800">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of{" "}
              <span className="font-bold text-gray-800">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-lg text-sm transition ${
                    page === n ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            {selected.imageUrl && (
              <img src={selected.imageUrl} alt={selected.title} className="mb-4 h-44 w-full rounded-lg object-cover" />
            )}
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">{selected.title}</h2>
              <StatusBadge status={selected.status} />
            </div>
            <p className="mb-4 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              {selected.location}
            </p>

            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Price</p>
                <p className="font-medium text-gray-800">{currency(selected.price)}/mo</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Beds / Baths</p>
                <p className="font-medium text-gray-800">{selected.beds} bd · {selected.baths} ba</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Landlord</p>
                <p className="font-medium text-gray-800">{selected.landlordName || `#${selected.landlordId ?? "—"}`}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Submitted</p>
                <p className="font-medium text-gray-800">{formatDate(selected.createdAt)}</p>
              </div>
            </div>

            {selected.description && (
              <p className="mb-4 text-sm text-gray-600">{selected.description}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                disabled={selected.status === "Rejected"}
                onClick={() => setConfirm({ property: selected, status: "Rejected" })}
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reject
              </button>
              <button
                disabled={selected.status === "Active"}
                onClick={() => setConfirm({ property: selected, status: "Active" })}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-base font-semibold text-gray-900">
              {confirm.status === "Active" ? "Accept property?" : "Reject property?"}
            </h3>
            <p className="mb-5 text-sm text-gray-500">
              {confirm.status === "Active"
                ? "The landlord will be notified and the listing will go live."
                : "The landlord will be notified that this listing was rejected."}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={actingId === confirm.property.id}
                onClick={() => updateStatus(confirm.property, confirm.status)}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
                  confirm.status === "Active" ? "bg-teal-600 hover:bg-teal-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actingId === confirm.property.id
                  ? "Saving…"
                  : confirm.status === "Active"
                  ? "Yes, Accept"
                  : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) => (
  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200">
    <div className="flex items-center justify-between">
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      <span className={`rounded-lg p-2 ${accent}`}>{icon}</span>
    </div>
    <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{value}</p>
  </div>
);

export default PropertiesAdmin;
