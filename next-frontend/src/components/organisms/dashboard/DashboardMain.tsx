"use client";

import { useEffect, useState, useMemo } from "react";
import { TrendingUp, DollarSign, Home, Calendar, CheckCircle2, Clock, XCircle, Eye, Building2, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import TopBar from "@/components/ui/TopBar";
import { api } from "@/lib/api";
import type { DashboardSummary, PropertyAnalytics, BookingTrend, OccupancyData } from "@/lib/types";

function SummaryCard({ icon: Icon, label, value, sub, loading, error, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; loading: boolean; error: boolean; color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-1 h-7 w-24 animate-pulse rounded bg-slate-100" />
      ) : error ? (
        <p className="mt-1 text-sm text-red-500">Error</p>
      ) : (
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      )}
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function DashboardMain({ navto, role = "Landlord" }: { navto: string; role?: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<PropertyAnalytics | null>(null);
  const [trends, setTrends] = useState<BookingTrend[]>([]);
  const [occupancy, setOccupancy] = useState<OccupancyData | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getDashboardSummary(),
      api.getPropertyAnalytics(),
      api.getBookingTrends('monthly'),
      api.getLandlordOccupancy(),
    ])
      .then(([s, a, t, o]) => {
        setSummary(s);
        setAnalytics(a);
        setTrends(t);
        setOccupancy(o);
      })
      .catch((err) => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.getBookingTrends(trendPeriod).then(setTrends).catch(() => {});
  }, [trendPeriod]);

  const pieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Pending', value: summary.pendingBookings, color: '#f59e0b' },
      { name: 'Confirmed', value: summary.confirmedBookings, color: '#3b82f6' },
      { name: 'Completed', value: summary.completedBookings, color: '#10b981' },
      { name: 'Cancelled', value: summary.cancelledBookings, color: '#ef4444' },
      { name: 'Rejected', value: summary.rejectedBookings, color: '#6b7280' },
    ].filter(d => d.value > 0);
  }, [summary]);

  const trendChartData = useMemo(() => {
    return trends.map(t => ({ label: t.label, Bookings: t.bookings, Revenue: t.revenue }));
  }, [trends]);

  const periodLabels: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

  return (
    <div className="flex flex-col min-h-0">
      <TopBar role={role} page="Dashboard" />
      <main className="flex-1 overflow-y-auto bg-[#f6f5ff] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500">Overview of your rental business</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryCard icon={DollarSign} label="Total Revenue" value={summary ? `$${summary.totalRevenue.toLocaleString()}` : '-'} sub={summary ? `YTD: $${summary.ytdRevenue.toLocaleString()}` : undefined} loading={loading} error={!!error} color="bg-emerald-600" />
            <SummaryCard icon={TrendingUp} label="Monthly Earnings" value={summary && summary.monthlyEarnings?.length ? `$${summary.monthlyEarnings[summary.monthlyEarnings.length - 1].revenue.toLocaleString()}` : '-'} loading={loading} error={!!error} color="bg-blue-600" />
            <SummaryCard icon={BarChart3} label="Occupancy Rate" value={summary ? `${summary.overallOccupancyRate}%` : '-'} loading={loading} error={!!error} color="bg-violet-600" />
            <SummaryCard icon={Home} label="Active Listings" value={summary ? String(summary.activeListings) : '-'} loading={loading} error={!!error} color="bg-amber-600" />
            <SummaryCard icon={Calendar} label="Total Bookings" value={summary ? String(summary.totalBookings) : '-'} loading={loading} error={!!error} color="bg-indigo-600" />
            <SummaryCard icon={Clock} label="Pending" value={summary ? String(summary.pendingBookings) : '-'} loading={loading} error={!!error} color="bg-amber-500" />
            <SummaryCard icon={CheckCircle2} label="Completed" value={summary ? String(summary.completedBookings) : '-'} loading={loading} error={!!error} color="bg-emerald-500" />
            <SummaryCard icon={XCircle} label="Cancelled" value={summary ? String(summary.cancelledBookings) : '-'} loading={loading} error={!!error} color="bg-red-500" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Booking Trends</h2>
              <div className="mb-4 flex gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map(p => (
                  <button key={p} onClick={() => setTrendPeriod(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${trendPeriod === p ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
              {trendChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="Bookings" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-sm text-slate-400">No booking data yet</div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Booking Distribution</h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-sm text-slate-400">No booking data yet</div>
              )}
              <div className="mt-3 flex flex-wrap gap-3">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}: {d.value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Property Analytics</h2>
            {analytics ? (
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2"><Eye size={16} className="text-slate-400" /> Total Views: <span className="font-semibold">{analytics.totalViews}</span></div>
                  {analytics.mostViewed && <div className="flex items-center gap-1"><ArrowUpRight size={14} className="text-emerald-500" /> Most: {analytics.mostViewed.title} ({analytics.mostViewed.views})</div>}
                  {analytics.leastViewed && <div className="flex items-center gap-1"><ArrowDownRight size={14} className="text-red-500" /> Least: {analytics.leastViewed.title} ({analytics.leastViewed.views})</div>}
                </div>
                {analytics.properties.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-left text-slate-400">
                          <th className="pb-2 font-medium">Property</th>
                          <th className="pb-2 font-medium">Views</th>
                          <th className="pb-2 font-medium">Bookings</th>
                          <th className="pb-2 font-medium">Conversion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.properties.map(p => (
                          <tr key={p.id} className="border-b border-slate-50">
                            <td className="py-2.5 font-medium text-slate-800">{p.title}</td>
                            <td className="py-2.5 text-slate-600">{p.views}</td>
                            <td className="py-2.5 text-slate-600">{p.bookings}</td>
                            <td className="py-2.5 text-slate-600">{p.views > 0 ? `${Math.round((p.bookings / p.views) * 100)}%` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No properties yet</p>
                )}
              </div>
            ) : loading ? (
              <div className="h-20 animate-pulse rounded bg-slate-100" />
            ) : (
              <p className="text-sm text-slate-400">No data available</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
