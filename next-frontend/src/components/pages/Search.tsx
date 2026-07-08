import React from "react";
import Link from "next/link";
import "./Search.css";

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChatIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

function Search() {
  return (
    <div className="tenant-ui">
      <header className="navbar">
        <div className="navbar-brand">Tenant</div>

        <div className="navbar-actions">
          <div className="navbar-search">
            <SearchIcon className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search properties, bookings..."
              className="navbar-search-input"
            />
          </div>

          <button className="icon-button" aria-label="Notifications">
            <BellIcon />
            <span className="notification-dot" />
          </button>

          <button className="avatar-button" aria-label="Profile">
            <img
              src="https://i.pravatar.cc/80?img=13"
              alt="User avatar"
              className="avatar-image"
            />
          </button>
        </div>
      </header>

      <main className="hero-wrapper">
        <section className="hero">
          <div className="hero-circle hero-circle-left" />
          <div className="hero-circle hero-circle-right" />

          <div className="hero-content">
            <h1 className="hero-title">Find Your Perfect Home</h1>
            <p className="hero-subtitle">
              Browse thousands of verified properties, from cozy studios to
              luxury villas.
            </p>

            <div className="hero-search-bar">
              <div className="hero-search-input-wrapper">
                <SearchIcon className="hero-search-icon" />
                <input
                  type="text"
                  placeholder="Search by city, neighborhood..."
                  className="hero-search-input"
                />
              </div>
              <button className="hero-search-button">Search</button>
            </div>
          </div>
        </section>

        <Link href="/chat" className="floating-chat-button" aria-label="Chat">
          <ChatIcon />
        </Link>
      </main>
    </div>
  );
}

export default Search;
