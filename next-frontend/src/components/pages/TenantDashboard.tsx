"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, Building2, House, Castle, Hotel, ArrowRight, Loader2, Clock, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopBar from "@/components/ui/TopBar";
import PropertyCard2 from "@/components/ui/PropertyCard2";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Property } from "@/lib/types";

const categories = [
  { icon: Building2, label: "Apartment", type: "Apartment" },
  { icon: House, label: "House", type: "House" },
  { icon: Castle, label: "Villa", type: "Villa" },
  { icon: Hotel, label: "Studio", type: "Studio" },
];

export default function TenantDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);

  useEffect(() => {
    if (!user) return;
    api.getWishlistIds().then(setFavorites).catch(() => {});
    api.getRecentlyViewed().then(setRecentlyViewed).catch(() => {});
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getActiveProperties()
      .then((rows) => {
        if (!cancelled) setProperties(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load properties.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filteredProperties = properties
    .filter((p) =>
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.city ?? p.location).toLowerCase().includes(searchQuery.toLowerCase())
    );

  const featured = filteredProperties.slice(0, 3);
  const popular = filteredProperties.slice(3, 9);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col min-h-0">
      <TopBar role="Tenant" page="Dashboard" searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex-1 p-8 overflow-y-auto space-y-10">
      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading properties…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
      <>
      <div className="relative">
        <div className="bg-linear-to-br from-[#5E35B1] to-indigo-700 rounded-2xl p-8 md:p-12 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white" />
          </div>
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Find Your Perfect Home</h1>
            <p className="text-violet-100 mb-8 max-w-lg">Browse thousands of verified properties, from cozy studios to luxury villas.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city, neighborhood..."
                  className="pl-10 h-12 rounded-xl bg-white text-gray-800 border-0"
                />
              </div>
              <Link href="/tenant/search">
                <Button className="h-12 px-6 bg-white text-[#5E35B1] hover:bg-gray-100 rounded-xl font-semibold">
                  Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">Browse by Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Link key={cat.type} href="/tenant/search">
              <div
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all cursor-pointer text-center group animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 mx-auto bg-violet-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-violet-100 transition-colors">
                  <cat.icon className="w-6 h-6 text-[#5E35B1]" />
                </div>
                <p className="font-medium text-[#1A1A2E]">{cat.label}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {properties.filter((p) => p.category === cat.type).length} listings
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#5E35B1]" />
            <h2 className="text-xl font-bold text-[#1A1A2E]">Recently Viewed</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyViewed.map((property, i) => (
              <div key={property.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                <PropertyCard2
                  property={property}
                  onFavorite={toggleFavorite}
                  favorited={favorites.includes(property.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wishlist */}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-[#1A1A2E]">Your Wishlist</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.filter(p => favorites.includes(p.id)).slice(0, 3).map((property, i) => (
              <div key={property.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                <PropertyCard2
                  property={property}
                  onFavorite={toggleFavorite}
                  favorited={true}
                />
              </div>
            ))}
            {favorites.length > 3 && (
              <Link href="/tenant/wishlist" className="flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-6 text-gray-400 hover:border-violet-200 hover:text-[#5E35B1] transition-colors">
                <span className="font-medium">View all {favorites.length} favorites</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Featured */}
      {filteredProperties.length > 0 && (
        <>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A1A2E]">Featured Properties</h2>
              <Link href="/tenant/search" className="text-sm text-[#5E35B1] font-medium flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3">
              {featured.map((property, i) => (
                <div key={property.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                  <PropertyCard2
                    property={property}
                    onFavorite={toggleFavorite}
                    favorited={favorites.includes(property.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popular.map((property, i) => (
                <div key={property.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                  <PropertyCard2
                    property={property}
                    onFavorite={toggleFavorite}
                    favorited={favorites.includes(property.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {filteredProperties.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          No properties match your search.
        </div>
      )}
      </>
      )}
      </div>
    </div>
  );
}
