"use client";

import React, { useState } from "react";
import "./MyReservations.css";
import {
  LayoutGrid,
  Building2,
  Calendar,
  Star,
  User,
  MessageSquare,
  Search,
  Bell,
  ChevronLeft,
  Eye,
  MapPin,
} from "lucide-react";

interface Reservation {
  id: number;
  property: string;
  location: string;
  image: string | null;
  guest: string;
  dates: string;
  amount: string;
  status: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "My Properties", icon: Building2 },
  { label: "Reservations", icon: Calendar, active: true },
  { label: "Reviews", icon: Star },
  { label: "Profile", icon: User },
  { label: "Messages", icon: MessageSquare },
];

const TABS = [
  { key: "all", label: "All", count: 6 },
  { key: "pending", label: "Pending", count: 0 },
  { key: "confirmed", label: "Confirmed", count: 2 },
  { key: "completed", label: "Completed", count: 3 },
  { key: "cancelled", label: "Cancelled", count: 1 },
];

const RESERVATIONS: Reservation[] = [
  {
    id: 1,
    property: "Industrial Loft in Arts District",
    location: "Los Angeles",
    image: null,
    guest: "Ryan Mitchell",
    dates: "2025-01-15 - 2025-02-15",
    amount: "3,200",
    status: "confirmed",
  },
  {
    id: 2,
    property: "Contemporary Townhouse Near Tech Hub",
    location: "San Francisco",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&h=100&fit=crop",
    guest: "Sarah Williams",
    dates: "2025-01-10 - 2025-04-10",
    amount: "14,400",
    status: "confirmed",
  },
  {
    id: 3,
    property: "Downtown Studio with Skyline Views",
    location: "Chicago",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=100&fit=crop",
    guest: "Daniel Lee",
    dates: "2024-11-01 - 2024-11-30",
    amount: "2,100",
    status: "completed",
  },
  {
    id: 4,
    property: "Desert Modern Oasis",
    location: "Palm Springs",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=100&h=100&fit=crop",
    guest: "Daniel Lee",
    dates: "2024-12-20 - 2024-12-27",
    amount: "4,760",
    status: "completed",
  },
  {
    id: 5,
    property: "Soho Artist Loft",
    location: "New York",
    image: null,
    guest: "Emma Thompson",
    dates: "2025-01-05 - 2025-02-05",
    amount: "5,800",
    status: "cancelled",
  },
  {
    id: 6,
    property: "Industrial Loft in Arts District",
    location: "Los Angeles",
    image: null,
    guest: "Emma Thompson",
    dates: "2024-09-01 - 2024-10-01",
    amount: "3,200",
    status: "completed",
  },
];

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  pending: "Pending",
};

export default function Reservations() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = RESERVATIONS.filter((r) => {
    const matchesTab = activeTab === "all" ? true : r.status === activeTab;
    const matchesSearch =
      searchTerm.trim() === "" ||
      r.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.guest.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="res-app">
      <div className="res-main">
        <header className="res-topbar">
          <div className="res-breadcrumb">
            <span className="res-breadcrumb-muted">Landlord</span>
            <span className="res-breadcrumb-sep">/</span>
            <span className="res-breadcrumb-active">Reservations</span>
          </div>

          <div className="res-topbar-right">
            <div className="res-topbar-search">
              <Search size={16} className="res-icon-muted" />
              <input placeholder="Search properties, bookings..." />
            </div>
            <button className="res-icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="res-notif-dot" />
            </button>
            <div className="res-avatar-topbar" />
          </div>
        </header>

        <main className="res-content">
          <div className="res-page-heading">
            <h1>Reservations</h1>
            <p>Manage your booking requests</p>
          </div>

          <div className="res-search-bar">
            <Search size={16} className="res-icon-muted" />
            <input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="res-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`res-tab ${activeTab === tab.key ? "res-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="res-table-card">
            <table className="res-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Guest</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="res-property-cell">
                        <div className="res-thumb">
                          {r.image && <img src={r.image} alt={r.property} />}
                        </div>
                        <div className="res-property-info">
                          <span className="res-property-name">{r.property}</span>
                          <span className="res-property-location">
                            <MapPin size={12} />
                            {r.location}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="res-guest-name">{r.guest}</td>
                    <td className="res-dates">
                      <Calendar size={14} className="res-icon-muted" />
                      {r.dates}
                    </td>
                    <td className="res-amount">${r.amount}</td>
                    <td>
                      <span className={`res-status res-status-${r.status}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td>
                      <button className="res-action-btn" aria-label="View reservation">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="res-empty-row">
                      No reservations match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
