"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import type { Property } from "@/lib/types";
import BookingScreen from "@/components/property/PropertyDetail";
import Tenant_Navbar from "@/components/layout/Tenant_Navbar";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, ready } = useAuth();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.push("/signin"); return; }

    setLoading(true);
    setError(null);

    Promise.all([
      api.getPropertyById(id),
      api.getWishlistIds().catch(() => [] as string[]),
      api.getSimilarProperties(id).catch(() => [] as Property[]),
    ])
      .then(([prop, wishIds, simProps]) => {
        setProperty(prop);
        setSimilar(simProps);
        setWishlisted(wishIds.includes(id));
        api.trackRecentlyViewed(id).catch(() => {});
      })
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : "Failed to load property.";
        setError(err instanceof ApiError && err.status === 404 ? "Property not found." : msg);
      })
      .finally(() => setLoading(false));
  }, [ready, user, id, router]);

  if (!ready || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FCFAF6]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#EDE7DA] border-t-[#1F1B16]" />
          <p className="text-sm font-medium text-[#8A8071]">Checking session...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FCFAF6]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#EDE7DA] border-t-[#1F1B16]" />
          <p className="text-sm font-medium text-[#8A8071]">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FCFAF6]">
        <div className="text-center max-w-sm px-6">
          <p className="text-lg font-bold text-[#1F1B16] mb-2">Oops</p>
          <p className="text-sm text-[#8A8071] mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="rounded-xl bg-[#1F1B16] px-5 py-2.5 text-sm font-semibold text-[#FCFAF6] cursor-pointer hover:bg-[#3B362E] transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="flex">
      <Tenant_Navbar navto="" setNavto={() => router.push("/tenant")} />
      <main className="ml-[15%] w-[85%] h-screen p-6 overflow-y-auto">
        <BookingScreen
          property={property}
          initialWishlisted={wishlisted}
          onWishlistChange={setWishlisted}
          similarProperties={similar}
        />
      </main>
    </div>
  );
}
