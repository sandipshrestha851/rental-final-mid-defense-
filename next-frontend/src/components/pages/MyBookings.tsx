"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import "./MyBookings.css";

const TABS = [
  { key: "all", label: "All", count: 0 },
  { key: "upcoming", label: "Upcoming", count: 0 },
  { key: "past", label: "Past", count: 0 },
  { key: "cancelled", label: "Cancelled", count: 0 },
];

export default function MyBookings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="app">
      <div className="main">
        <TopBar role="Tenant" page="Bookings" searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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
