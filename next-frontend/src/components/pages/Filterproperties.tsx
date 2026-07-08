"use client";

import React, { useState } from "react";
import "./Filterproperties.css";

const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SlidersIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const GridIcon = () => (
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
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
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
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const CloseIcon = () => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Studio",
  "Loft",
  "Condo",
  "Cottage",
  "Penthouse",
];

const AMENITIES = [
  "Wifi",
  "Kitchen",
  "Pool",
  "Gym",
  "Parking",
  "Ac",
  "Washer",
  "Balcony",
  "Security",
];

const MIN_PRICE = 0;
const MAX_PRICE = 15000;

export default function SearchProperties() {
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("Newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleFromList = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1);
    setMinPrice(value);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 1);
    setMaxPrice(value);
  };

  return (
    <div className="search-properties">
      <div className="sp-header">
        <h1 className="sp-title">Search Properties</h1>
        <p className="sp-subtitle">16 properties found</p>
      </div>

      <div className="sp-toolbar">
        <div className="sp-search-input-wrapper">
          <SearchIcon />
          <input
            type="text"
            className="sp-search-input"
            placeholder="Search by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sp-select-wrapper">
          <select
            className="sp-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Newest</option>
            <option>Oldest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
          <ChevronDownIcon />
        </div>

        <button
          className={`sp-filters-button ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <SlidersIcon />
          <span>Filters</span>
        </button>

        <div className="sp-view-toggle">
          <button
            className={`sp-view-button ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <GridIcon />
          </button>
          <button
            className={`sp-view-button ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="sp-filters-panel">
          <div className="sp-filters-panel-header">
            <h2 className="sp-filters-title">Filters</h2>
            <button
              className="sp-close-button"
              onClick={() => setShowFilters(false)}
              aria-label="Close filters"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="sp-filters-grid">
            <div className="sp-filter-group">
              <h3 className="sp-filter-label">
                Price Range: ${minPrice} - ${maxPrice}
              </h3>
              <div className="sp-range-slider">
                <div className="sp-range-track" />
                <div
                  className="sp-range-fill"
                  style={{
                    left: `${(minPrice / MAX_PRICE) * 100}%`,
                    right: `${100 - (maxPrice / MAX_PRICE) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  className="sp-range-input"
                />
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  className="sp-range-input"
                />
              </div>
            </div>

            <div className="sp-filter-group">
              <h3 className="sp-filter-label">Property Type</h3>
              <div className="sp-pill-group">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`sp-pill ${
                      selectedTypes.includes(type) ? "selected" : ""
                    }`}
                    onClick={() =>
                      toggleFromList(selectedTypes, setSelectedTypes, type)
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="sp-filter-group">
              <h3 className="sp-filter-label">Amenities</h3>
              <div className="sp-pill-group">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    className={`sp-pill ${
                      selectedAmenities.includes(amenity) ? "selected" : ""
                    }`}
                    onClick={() =>
                      toggleFromList(
                        selectedAmenities,
                        setSelectedAmenities,
                        amenity
                      )
                    }
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
