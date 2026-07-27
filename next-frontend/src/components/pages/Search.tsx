import React from "react";
import Link from "next/link";
import TopBar from "@/components/ui/TopBar";
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
      <TopBar role="Tenant" page="Search" />

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
