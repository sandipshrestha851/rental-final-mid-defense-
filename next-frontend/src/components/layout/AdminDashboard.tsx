"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { ChatApp } from "@/components/organisms/chat/ChatApp";
import {
  Users,
  Shield,
  Search,
  CheckCircle,
  HelpCircle,
  Database,
  Calendar,
  Activity,
  Building2,
  Bell,
  Info,
  CheckCircle2,
  XCircle,
  Sun,
  Moon
} from "lucide-react";

const AdminDashboard = () => {
  const [navto, setNavto] = useState<string>("dashboard");
  const router = useRouter();
  const { user, token, ready } = useAuth();

  // Dashboard logic & statistics states
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Interactive Chart Hover States
  const [hoveredRevenueIndex, setHoveredRevenueIndex] = useState<number | null>(null);
  const [hoveredDonutIndex, setHoveredDonutIndex] = useState<number | null>(null);

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Property 'Desert Modern Oasis' pending approval", time: "Just now", read: false },
    { id: 2, text: "New tenant user registered: Ryan Mitchell", time: "2 hours ago", read: false },
    { id: 3, text: "Booking payment processed successfully", time: "5 hours ago", read: true }
  ]);

  // Add toast helper
  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Live timer for dashboard UI
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check auth and redirect if not admin
  useEffect(() => {
    if (ready) {
      if (!user || user.role !== "admin") {
        router.push("/authadmin");
      } else {
        addToast(`System Admin session verified.`, "info");
      }
    }
  }, [user, ready, router]);

  // Fetch users when authenticated
  useEffect(() => {
    if (ready && user && user.role === "admin" && token) {
      setLoadingUsers(true);
      api.getUsers(token)
        .then((data) => {
          console.log(data)
          setUsers(data);
          addToast("Dashboard analytics synchronized.", "success");
        })
        .catch((err) => {
          console.error("Failed to load users:", err);
          addToast("Unable to synchronize backend metrics.", "error");
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    }
  }, [ready, user, token]);

  // Stats calculation
  const totalUsers = users.length;
  const landlordsCount = users.filter((u) => u.role === "landlord").length;
  const tenantsCount = users.filter((u) => u.role === "tenant").length;
  

  // Actual total values mapping the dashboard screenshot metrics
  const totalPropertiesCount = 20; // 20 properties
  const totalBookingsCount = 20; // 20 bookings

  // Mock revenue coordinates calculation
  const revenueData = [
    { month: "Jan", amount: 55000, label: "$55k" },
    { month: "Feb", amount: 58000, label: "$58k" },
    { month: "Mar", amount: 65000, label: "$65k" },
    { month: "Apr", amount: 70000, label: "$70k" },
    { month: "May", amount: 78000, label: "$78k" },
    { month: "Jun", amount: 85000, label: "$85k" },
    { month: "Jul", amount: 88000, label: "$88k" },
    { month: "Aug", amount: 82000, label: "$82k" },
    { month: "Sep", amount: 95000, label: "$95k" },
    { month: "Oct", amount: 102000, label: "$102k" },
    { month: "Nov", amount: 108000, label: "$108k" },
    { month: "Dec", amount: 118000, label: "$118k" }
  ];

  const chartHeight = 200;
  const chartWidth = 560;
  const chartPaddingLeft = 45;
  const chartPaddingRight = 15;
  const chartPaddingTop = 15;
  const chartPaddingBottom = 30;

  const chartInnerWidth = chartWidth - chartPaddingLeft - chartPaddingRight;
  const chartInnerHeight = chartHeight - chartPaddingTop - chartPaddingBottom;

  const points = useMemo(() => {
    return revenueData.map((d, i) => {
      const x = chartPaddingLeft + (i / (revenueData.length - 1)) * chartInnerWidth;
      const y = chartPaddingTop + chartInnerHeight - (d.amount / 130000) * chartInnerHeight;
      return { x, y, ...d };
    });
  }, [chartInnerWidth, chartInnerHeight]);

  const linePathStr = useMemo(() => {
    return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  }, [points]);

  const areaPathStr = useMemo(() => {
    if (points.length === 0) return "";
    return `${linePathStr} L ${points[points.length - 1].x} ${chartPaddingTop + chartInnerHeight} L ${points[0].x} ${chartPaddingTop + chartInnerHeight} Z`;
  }, [points, linePathStr]);

  // Donut chart calculations (default matching user's screenshot breakdown)
  const tenantsCountVal = totalUsers > 0 ? tenantsCount : 4;
  const landlordsCountVal = totalUsers > 0 ? landlordsCount : 4;
  const adminsCountVal = 1; // 2 admins in screenshot
  const totalDonutCount = tenantsCountVal + landlordsCountVal + adminsCountVal;

  const donutCategories = [
    { label: "Tenants", count: tenantsCountVal, color: "#3b82f6", textClass: "text-blue-500" },
    { label: "Landlords", count: landlordsCountVal, color: "#8b5cf6", textClass: "text-violet-500" },
    { label: "Admins", count: adminsCountVal, color: "#06b6d4", textClass: "text-cyan-500" }
  ];

  const donutRadius = 45;
  const donutStrokeWidth = 14;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~282.74

  if (!ready || !user || user.role !== "admin") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-violet-50 dark:bg-slate-950 transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E35B1]"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Verifying Authorization Credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${darkMode ? "dark bg-[#0f0f1a] text-slate-100" : "bg-[#f5f3ff] text-slate-800"} transition-colors duration-300`}>
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg pointer-events-auto border animate-slideIn ${toast.type === "success"
                ? "bg-emerald-500 text-white border-emerald-400"
                : toast.type === "error"
                  ? "bg-red-500 text-white border-red-400"
                  : "bg-indigo-600 text-white border-indigo-500"
              }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === "error" && <XCircle className="w-5 h-5 shrink-0" />}
            {toast.type === "info" && <Info className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Right Content Main Container */}
      <main className={`${navto === "messages" ? "bg-[#0f0f1a]" : ""
        } flex-1 min-h-screen p-6 overflow-y-auto`}>

        {navto === "dashboard" && (
          <div className="space-y-6 animate-fadeIn text-left">

            {/* Top Navigation / Breadcrumbs Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold mb-1">
                  <span className="text-[#7C4DFF] hover:underline cursor-pointer" onClick={() => setNavto("dashboard")}>Admin</span>
                </div>
                <h1 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Admin Dashboard</h1>
                <p className="text-sm text-slate-400 font-semibold mt-0.5">Platform overview and analytics</p>
              </div>

              {/* Right widgets header */}
              <div className="flex flex-wrap items-center gap-3 ml-auto sm:ml-0">

                {/* Search Bar placeholder */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search properties, bookings..."
                    className={`pl-9 pr-4 py-2 border rounded-xl text-sm outline-none transition-colors w-48 sm:w-60 ${darkMode
                        ? "bg-slate-900 border-slate-700 text-white focus:border-violet-500"
                        : "bg-white border-slate-200 text-slate-700 focus:border-violet-500"
                      }`}
                  />
                </div>

                {/* Dark Mode Switcher */}
                <button
                  onClick={() => {
                    setDarkMode(!darkMode);
                    addToast(`Theme style toggled`, "info");
                  }}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${darkMode ? "hover:bg-slate-800 text-amber-400" : "hover:bg-slate-100 text-slate-500"
                    }`}
                  title="Toggle Light/Dark Theme"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notification Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`p-2 rounded-xl border relative cursor-pointer transition-colors ${darkMode ? "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-700/50" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)}></div>
                      <div className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl border p-4 z-40 animate-fadeIn ${darkMode ? "bg-[#16162d] border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                        }`}>
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs font-black uppercase tracking-wider">Notifications</h4>
                          <button
                            onClick={() => {
                              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                              addToast("All notifications cleared.", "success");
                            }}
                            className="text-xs font-bold text-violet-500 hover:underline"
                          >
                            Mark Read
                          </button>
                        </div>
                        <div className="space-y-2 max-h-52 overflow-y-auto">
                          {notifications.map(n => (
                            <div
                              key={n.id}
                              className={`p-2.5 rounded-lg text-left text-sm border ${n.read
                                  ? "bg-transparent border-transparent text-slate-400"
                                  : darkMode
                                    ? "bg-slate-800/40 border-slate-800 text-slate-200"
                                    : "bg-slate-50 border-slate-100 text-slate-800"
                                }`}
                            >
                              <p className="font-semibold">{n.text}</p>
                              <span className="text-[11px] text-slate-400 mt-1 block">{n.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Pic Indicator */}
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-md select-none">
                  SA
                </div>

              </div>
            </header>

            {/* Metrics cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Total Users */}
              <div className="p-6 rounded-2xl bg-blue-600 text-white shadow-lg flex items-center justify-between hover:scale-[1.02] transition-transform duration-200">
                <div className="space-y-2">
                  <span className="text-xs font-black text-blue-100 uppercase tracking-wider">Total Users</span>
                  <h3 className="text-3xl font-black">{totalUsers > 0 ? totalUsers : 10}</h3>
                  <p className="text-xs text-blue-100 font-semibold">Active database records</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Landlords */}
              <div className="p-6 rounded-2xl bg-violet-600 text-white shadow-lg flex items-center justify-between hover:scale-[1.02] transition-transform duration-200">
                <div className="space-y-2">
                  <span className="text-xs font-black text-violet-100 uppercase tracking-wider">Landlords</span>
                  <h3 className="text-3xl font-black">{totalUsers > 0 ? landlordsCount : 4}</h3>
                  <p className="text-xs text-violet-100 font-semibold font-mono">Platform list hosts</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
              </div>

              {/* Properties */}
              <div className="p-6 rounded-2xl bg-indigo-900 text-white shadow-lg flex items-center justify-between hover:scale-[1.02] transition-transform duration-200">
                <div className="space-y-2">
                  <span className="text-xs font-black text-indigo-200 uppercase tracking-wider">Properties</span>
                  <h3 className="text-3xl font-black">{totalPropertiesCount}</h3>
                  <p className="text-xs text-indigo-200 font-semibold">Approved housing units</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              {/* Bookings */}
              <div className="p-6 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between hover:scale-[1.02] transition-transform duration-200">
                <div className="space-y-2">
                  <span className="text-xs font-black text-emerald-100 uppercase tracking-wider">Bookings</span>
                  <h3 className="text-3xl font-black">{totalBookingsCount}</h3>
                  <p className="text-xs text-emerald-100 font-semibold">Confirmed bookings</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Interactive SVG Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Revenue area curve chart (Col Span 2) */}
              <div className={`p-6 rounded-2xl border relative flex flex-col justify-between lg:col-span-2 ${darkMode ? "bg-slate-800/40 border-slate-800/60" : "bg-white border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)]"
                }`}>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Platform Revenue</h4>
                  <p className={`text-xs font-medium mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Interactive monthly billing summary</p>
                </div>

                <div className="relative mt-4 self-center w-full max-w-140 select-none">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines */}
                    {[0, 1, 2, 3, 4].map((grid, idx) => {
                      const yVal = chartPaddingTop + (idx / 4) * chartInnerHeight;
                      return (
                        <line
                          key={grid}
                          x1={chartPaddingLeft}
                          y1={yVal}
                          x2={chartWidth - chartPaddingRight}
                          y2={yVal}
                          stroke={darkMode ? "#1e1e38" : "#f1f5f9"}
                          strokeDasharray="4 4"
                        />
                      );
                    })}

                    {/* Y-Axis Labels */}
                    {[120000, 90000, 60000, 30000, 0].map((amt, idx) => {
                      const yVal = chartPaddingTop + (idx / 4) * chartInnerHeight + 4;
                      return (
                        <text
                          key={amt}
                          x={chartPaddingLeft - 8}
                          y={yVal}
                          textAnchor="end"
                          className="text-[11px] font-bold fill-slate-400"
                        >
                          {`$${amt / 1000}k`}
                        </text>
                      );
                    })}

                    {/* X-Axis Month labels */}
                    {points.map((p, idx) => (
                      <text
                        key={idx}
                        x={p.x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-slate-400"
                      >
                        {p.month}
                      </text>
                    ))}

                    {/* Area fill */}
                    <path d={areaPathStr} fill="url(#revenueGrad)" />

                    {/* Spline line curve */}
                    <path
                      d={linePathStr}
                      fill="none"
                      stroke="#7C4DFF"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Hover vertical bar guides */}
                    {hoveredRevenueIndex !== null && (
                      <g>
                        <line
                          x1={points[hoveredRevenueIndex].x}
                          y1={chartPaddingTop}
                          x2={points[hoveredRevenueIndex].x}
                          y2={chartPaddingTop + chartInnerHeight}
                          stroke="#7C4DFF"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <circle
                          cx={points[hoveredRevenueIndex].x}
                          cy={points[hoveredRevenueIndex].y}
                          r="5"
                          fill="#7C4DFF"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      </g>
                    )}

                    {/* Interactive hover overlays */}
                    {points.map((p, idx) => {
                      const barWidth = chartInnerWidth / revenueData.length;
                      const barX = p.x - barWidth / 2;
                      return (
                        <rect
                          key={idx}
                          x={barX}
                          y={chartPaddingTop}
                          width={barWidth}
                          height={chartInnerHeight}
                          fill="transparent"
                          className="cursor-crosshair"
                          onMouseEnter={() => setHoveredRevenueIndex(idx)}
                          onMouseLeave={() => setHoveredRevenueIndex(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Tooltip Overlay */}
                  {hoveredRevenueIndex !== null && (
                    <div
                      className="absolute bg-slate-950/90 text-white text-xs rounded-xl p-2.5 shadow-2xl border border-slate-800 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-75"
                      style={{
                        left: `${((points[hoveredRevenueIndex].x - chartPaddingLeft) / chartInnerWidth) * 100}%`,
                        top: `${(points[hoveredRevenueIndex].y / chartHeight) * 100 - 8}%`,
                        marginLeft: "30px"
                      }}
                    >
                      <p className="font-bold tracking-wide">{points[hoveredRevenueIndex].month}</p>
                      <p className="text-[#c7f1ff] font-extrabold text-sm mt-0.5">{points[hoveredRevenueIndex].label}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* User distribution donut chart */}
              <div className={`p-6 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-slate-800/40 border-slate-800/60" : "bg-white border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)]"
                }`}>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">User Distribution</h4>
                  <p className={`text-xs font-medium mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Ratio of platform account types</p>
                </div>

                {/* SVG Donut */}
                <div className="relative my-4 flex items-center justify-center">
                  <svg width="150" height="150" viewBox="0 0 120 120" className="overflow-visible">
                    <g transform="rotate(-90 60 60)">
                      <circle
                        cx="60"
                        cy="60"
                        r={donutRadius}
                        fill="transparent"
                        stroke={darkMode ? "#1e1e38" : "#f1f5f9"}
                        strokeWidth={donutStrokeWidth}
                      />
                      {donutCategories.map((c, idx) => {
                        const pct = (c.count / totalDonutCount) * 100;
                        const strokeDasharray = `${(pct / 100) * donutCircumference} ${donutCircumference}`;

                        const offset = -donutCategories
                          .slice(0, idx)
                          .reduce((acc, curr) => acc + (curr.count / totalDonutCount) * donutCircumference, 0);

                        const isHovered = hoveredDonutIndex === idx;

                        return (
                          <circle
                            key={idx}
                            cx="60"
                            cy="60"
                            r={donutRadius}
                            fill="transparent"
                            stroke={c.color}
                            strokeWidth={isHovered ? donutStrokeWidth + 3 : donutStrokeWidth}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="cursor-pointer transition-all duration-300"
                            onMouseEnter={() => setHoveredDonutIndex(idx)}
                            onMouseLeave={() => setHoveredDonutIndex(null)}
                          />
                        );
                      })}
                    </g>

                    {/* Central label */}
                    <text x="60" y="58" textAnchor="middle" className={`text-base font-black transition-colors ${darkMode ? 'fill-white' : 'fill-slate-800'}`}>
                      {totalDonutCount}
                    </text>
                    <text x="60" y="72" textAnchor="middle" className="text-[10px] font-black tracking-wider uppercase fill-slate-400">
                      {hoveredDonutIndex !== null ? donutCategories[hoveredDonutIndex].label : "Accounts"}
                    </text>
                  </svg>
                </div>

                {/* Legends list */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {donutCategories.map((cat, idx) => {
                    const percentage = Math.round((cat.count / totalDonutCount) * 100);
                    const isHovered = hoveredDonutIndex === idx;
                    return (
                      <div
                        key={cat.label}
                        className={`flex items-center justify-between text-sm px-2.5 py-1.5 rounded-lg transition-colors duration-150 ${isHovered ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        onMouseEnter={() => setHoveredDonutIndex(idx)}
                        onMouseLeave={() => setHoveredDonutIndex(null)}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                          <span className={darkMode ? "text-slate-300" : "text-slate-600"}>{cat.label}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold">
                          <span className={`font-mono ${cat.textClass}`}>{cat.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Activities and Quick Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Recent Activity List */}
              <div className={`p-6 rounded-2xl border lg:col-span-2 flex flex-col justify-between ${darkMode ? "bg-slate-800/40 border-slate-800/60" : "bg-white border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)]"
                }`}>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Recent Activity</h4>

                  <div className="space-y-4">
                    {[
                      { title: "1 properties pending approval", label: "Property approval queue check", time: "Just now", color: "text-amber-500 bg-amber-500/10" },
                      { title: "10 total users on platform", label: "Registered accounts database snapshot", time: "2h ago", color: "text-blue-500 bg-blue-500/10" },
                      { title: "20 bookings this month", label: "Lease schedule confirmation summaries", time: "5h ago", color: "text-emerald-500 bg-emerald-500/10" },
                      { title: "$65k revenue generated", label: "Platform aggregates invoice updates", time: "1d ago", color: "text-violet-500 bg-violet-500/10" }
                    ].map((activity, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-3 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-300/30 transition-all duration-150 text-left"
                      >
                        <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm ${activity.color}`}>
                          {idx === 0 && <Building2 className="w-4 h-4" />}
                          {idx === 1 && <Users className="w-4 h-4" />}
                          {idx === 2 && <Calendar className="w-4 h-4" />}
                          {idx === 3 && <Activity className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{activity.title}</p>
                          <p className="text-xs text-slate-400 mt-1 font-semibold">{activity.label}</p>
                        </div>
                        <span className="ml-auto text-xs text-slate-400 shrink-0 font-bold">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions Card Grid */}
              <div className={`p-6 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-slate-800/40 border-slate-800/60" : "bg-white border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)]"
                }`}>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Quick Actions</h4>

                  <div className="grid grid-cols-2 gap-4">

                    <button
                      onClick={() => {
                        addToast("Manage Users registry selection - Coming soon", "info");
                      }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:scale-102 hover:shadow-md ${darkMode ? "bg-slate-800/60 border-slate-700/60 hover:bg-slate-700/60 text-white" : "bg-slate-50 border-slate-100 hover:bg-white text-slate-700"
                        }`}
                    >
                      <Users className="w-5 h-5 text-blue-500 mb-2" />
                      <p className="text-sm font-bold leading-tight">Manage Users</p>
                      <span className="text-xs text-slate-400 mt-1 block">View and manage all users</span>
                    </button>

                    <button
                      onClick={() => {
                        addToast("Property Approvals listing - Coming soon", "info");
                      }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:scale-102 hover:shadow-md ${darkMode ? "bg-slate-800/60 border-slate-700/60 hover:bg-slate-700/60 text-white" : "bg-slate-50 border-slate-100 hover:bg-white text-slate-700"
                        }`}
                    >
                      <Building2 className="w-5 h-5 text-amber-500 mb-2" />
                      <p className="text-sm font-bold leading-tight">Property Approvals</p>
                      <span className="text-xs text-slate-400 mt-1 block">Pending approvals</span>
                    </button>

                    <button
                      onClick={() => {
                        addToast("Booking Overview schedules - Coming soon", "info");
                      }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:scale-102 hover:shadow-md ${darkMode ? "bg-slate-800/60 border-slate-700/60 hover:bg-slate-700/60 text-white" : "bg-slate-50 border-slate-100 hover:bg-white text-slate-700"
                        }`}
                    >
                      <Calendar className="w-5 h-5 text-emerald-500 mb-2" />
                      <p className="text-sm font-bold leading-tight">Booking Overview</p>
                      <span className="text-xs text-slate-400 mt-1 block">View all bookings</span>
                    </button>

                    <button
                      onClick={() => {
                        addToast("Platform Configuration settings - Coming soon", "info");
                      }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:scale-102 hover:shadow-md ${darkMode ? "bg-slate-800/60 border-slate-700/60 hover:bg-slate-700/60 text-white" : "bg-slate-50 border-slate-100 hover:bg-white text-slate-700"
                        }`}
                    >
                      <Database className="w-5 h-5 text-violet-500 mb-2" />
                      <p className="text-sm font-bold leading-tight">Platform Settings</p>
                      <span className="text-xs text-slate-400 mt-1 block">Configure platform</span>
                    </button>

                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
