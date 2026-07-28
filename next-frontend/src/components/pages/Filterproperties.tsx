"use client";

import React, { useState, useEffect, useCallback } from "react";
import PropertyCard2 from "@/components/ui/PropertyCard2";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Property, SearchResults } from "@/lib/types";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import "./Filterproperties.css";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SlidersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Studio", "Loft", "Condo"];
const AMENITIES = ["Wifi", "Kitchen", "Pool", "Gym", "Parking", "AC", "Washer", "Balcony", "Security"];
const MIN_PRICE = 0;
const MAX_PRICE = 15000;

export default function SearchProperties() {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    api.getWishlistIds().then(setFavorites).catch(() => {});
  }, [user]);

  const doSearch = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | string[] | undefined> = {
        keyword: searchTerm || undefined,
        minPrice: minPrice > MIN_PRICE ? minPrice : undefined,
        maxPrice: maxPrice < MAX_PRICE ? maxPrice : undefined,
        category: selectedTypes.length === 1 ? selectedTypes[0] : undefined,
        sort: sortBy,
        page: p,
        pageSize: 12,
      };
      if (selectedAmenities.length > 0) {
        params.amenities = selectedAmenities;
      }
      const result = await api.searchProperties(params);
      setResults(result);
      setPage(result.page);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, minPrice, maxPrice, selectedTypes, selectedAmenities, sortBy]);

  useEffect(() => {
    doSearch(1);
  }, [sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(1);
  };

  const toggleFromList = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1);
    setMinPrice(value);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 1);
    setMaxPrice(value);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="search-properties max-w-7xl mx-auto px-4 py-6">
      <div className="sp-header mb-6">
        <h1 className="sp-title text-2xl font-bold">Search Properties</h1>
        <p className="sp-subtitle text-gray-500">{results ? `${results.total} properties found` : ''}</p>
      </div>

      <div className="sp-toolbar flex flex-wrap items-center gap-3 mb-4">
        <form onSubmit={handleSearch} className="sp-search-input-wrapper flex-1 min-w-[200px] flex items-center border border-gray-200 rounded-lg px-3 py-2">
          <SearchIcon />
          <input
            type="text"
            className="sp-search-input ml-2 flex-1 outline-none"
            placeholder="Search by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="sp-select-wrapper relative">
          <select
            className="sp-select border border-gray-200 rounded-lg px-3 py-2 pr-8 bg-white outline-none appearance-none cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
          <ChevronDownIcon />
        </div>

        <button
          className={`sp-filters-button flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${showFilters ? 'bg-[#5E35B1] text-white border-[#5E35B1]' : 'border-gray-200 hover:bg-gray-50'}`}
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <SlidersIcon />
          <span>Filters</span>
        </button>

        <div className="sp-view-toggle flex border border-gray-200 rounded-lg overflow-hidden">
          <button className={`sp-view-button p-2 cursor-pointer ${viewMode === "grid" ? "bg-gray-100" : ""}`} onClick={() => setViewMode("grid")} aria-label="Grid view"><GridIcon /></button>
          <button className={`sp-view-button p-2 cursor-pointer ${viewMode === "list" ? "bg-gray-100" : ""}`} onClick={() => setViewMode("list")} aria-label="List view"><ListIcon /></button>
        </div>

        <button onClick={() => doSearch(1)} className="px-4 py-2 bg-[#5E35B1] text-white rounded-lg hover:bg-[#4b2796] cursor-pointer font-medium">
          Search
        </button>
      </div>

      {showFilters && (
        <div className="sp-filters-panel border border-gray-200 rounded-xl p-6 mb-6">
          <div className="sp-filters-panel-header flex items-center justify-between mb-4">
            <h2 className="sp-filters-title font-semibold">Filters</h2>
            <button className="sp-close-button text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => setShowFilters(false)} aria-label="Close filters">
              <CloseIcon />
            </button>
          </div>

          <div className="sp-filters-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="sp-filter-group">
              <h3 className="sp-filter-label font-medium mb-2">Price Range: ${minPrice} - ${maxPrice}</h3>
              <div className="sp-range-slider relative h-8">
                <div className="sp-range-track absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded" />
                <div className="sp-range-fill absolute top-1/2 -translate-y-1/2 h-1 bg-[#5E35B1] rounded" style={{ left: `${(minPrice / MAX_PRICE) * 100}%`, width: `${((maxPrice - minPrice) / MAX_PRICE) * 100}%` }} />
                <input type="range" min={MIN_PRICE} max={MAX_PRICE} value={minPrice} onChange={handleMinPriceChange} className="sp-range-input absolute top-0 w-full h-full opacity-0 cursor-pointer" />
                <input type="range" min={MIN_PRICE} max={MAX_PRICE} value={maxPrice} onChange={handleMaxPriceChange} className="sp-range-input absolute top-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="sp-filter-group">
              <h3 className="sp-filter-label font-medium mb-2">Property Type</h3>
              <div className="sp-pill-group flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`sp-pill px-3 py-1.5 rounded-full text-sm border cursor-pointer ${selectedTypes.includes(type) ? 'bg-[#5E35B1] text-white border-[#5E35B1]' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => toggleFromList(selectedTypes, setSelectedTypes, type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="sp-filter-group">
              <h3 className="sp-filter-label font-medium mb-2">Amenities</h3>
              <div className="sp-pill-group flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    className={`sp-pill px-3 py-1.5 rounded-full text-sm border cursor-pointer ${selectedAmenities.includes(amenity) ? 'bg-[#5E35B1] text-white border-[#5E35B1]' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => toggleFromList(selectedAmenities, setSelectedAmenities, amenity)}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => doSearch(1)} className="mt-4 px-5 py-2 bg-[#5E35B1] text-white rounded-lg hover:bg-[#4b2796] cursor-pointer font-medium">
            Apply Filters
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Searching…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && results && (
        <>
          {results.properties.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No properties found matching your filters.</div>
          ) : (
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
            }>
              {results.properties.map((property) => (
                <PropertyCard2
                  key={property.id}
                  property={property}
                  onFavorite={toggleFavorite}
                  favorited={favorites.includes(property.id)}
                  showShare
                />
              ))}
            </div>
          )}

          {results.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => doSearch(page - 1)} disabled={page <= 1} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              {Array.from({ length: results.totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => doSearch(p)} className={`w-9 h-9 rounded-lg text-sm font-medium cursor-pointer ${p === page ? 'bg-[#5E35B1] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
              ))}
              <button onClick={() => doSearch(page + 1)} disabled={page >= results.totalPages} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
