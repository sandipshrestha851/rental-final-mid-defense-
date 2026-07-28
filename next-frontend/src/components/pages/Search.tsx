"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import TopBar from "@/components/ui/TopBar";
import PropertyCard2 from "@/components/ui/PropertyCard2";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Property, SearchResults as SearchResultsType } from "@/lib/types";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

function Search() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    if (!user) return;
    api.getWishlistIds().then(setFavorites).catch(() => {});
  }, [user]);

  const doSearch = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.searchProperties({ keyword: query || undefined, sort, page: p, pageSize: 12 });
      setResults(result);
      setPage(result.page);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, sort]);

  useEffect(() => {
    doSearch(1);
  }, [sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(1);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="tenant-ui min-h-screen">
      <TopBar role="Tenant" page="Search" />

      <main>
        <section className="hero-wrapper relative bg-linear-to-br from-[#5E35B1] to-indigo-700 py-16 px-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Find Your Perfect Home</h1>
            <p className="text-violet-100 mb-8">Browse thousands of verified properties, from cozy studios to luxury villas.</p>
            <form onSubmit={handleSearch} className="hero-search-bar flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="hero-search-input-wrapper relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by city, neighborhood..."
                  className="w-full pl-10 pr-4 h-12 rounded-xl bg-white text-gray-800 border-0 outline-none"
                />
              </div>
              <button type="submit" className="h-12 px-6 bg-white text-[#5E35B1] hover:bg-gray-100 rounded-xl font-semibold cursor-pointer">
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {results ? `${results.total} propert${results.total === 1 ? 'y' : 'ies'} found` : ''}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

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
                <div className="text-center py-16 text-gray-400">No properties found matching your search.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
                  <button
                    onClick={() => doSearch(page - 1)}
                    disabled={page <= 1}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  {Array.from({ length: results.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => doSearch(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium cursor-pointer ${p === page ? 'bg-[#5E35B1] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => doSearch(page + 1)}
                    disabled={page >= results.totalPages}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <Link href="/chat" className="floating-chat-button fixed bottom-6 right-6 w-12 h-12 bg-[#5E35B1] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#4b2796]" aria-label="Chat">
          <ChatIcon />
        </Link>
      </main>
    </div>
  );
}

export default Search;
