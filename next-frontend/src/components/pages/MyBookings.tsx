"use client";

import React, { useState } from "react";
import {
  Home,
  Search,
  Calendar,
  MessageSquare,
  ChevronLeft,
  Bell,
} from "lucide-react";
import "./MyBookings.css";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "search", label: "Search", icon: Search },
  { key: "bookings", label: "My Bookings", icon: Calendar },
  { key: "messages", label: "Messages", icon: MessageSquare },
];

const TABS = [
  { key: "all", label: "All", count: 0 },
  { key: "upcoming", label: "Upcoming", count: 0 },
  { key: "past", label: "Past", count: 0 },
  { key: "cancelled", label: "Cancelled", count: 0 },
];

export default function MyBookings() {
  const [activeNav, setActiveNav] = useState("bookings");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="app">
      <div className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Tenant</span>
            <span>/</span>
            <span className="active">Bookings</span>
          </div>

          <div className="topbar-right">
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Search properties, bookings..." />
            </div>
            <div className="icon-btn">
              <Bell size={20} />
              <span className="dot"></span>
            </div>
            <img
              className="avatar"
              src="https://i.pravatar.cc/64?img=12"
              alt="User avatar"
            />
          </div>
        </header>
        <main className="content">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Manage your reservations</p>

          <div className="tabs">
            {TABS.map(({ key, label, count }) => (
              <button
                key={key}
                className={`tab ${activeTab === key ? "active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={52} strokeWidth={1.5} />
            </div>
            <div className="empty-title">No bookings found</div>
            <div className="empty-subtitle">
              Start exploring properties to make your first booking
            </div>
            <button className="browse-btn">Browse Properties</button>
          </div>
        </main>
      </div>
    </div>
  );
}
