"use client";

import { Heart, Star, MapPin, BedDouble, Bath, Maximize, Share2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Property } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&auto=format&fit=crop&q=60";

interface PropertyCard2Props {
  property: Property;
  onFavorite?: (id: string) => void;
  favorited?: boolean;
  showShare?: boolean;
}

const PropertyCard2 = ({ property, onFavorite, favorited, showShare }: PropertyCard2Props) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);

  const {
    id, title, location, imageUrl, status, beds, baths, rating, price,
    category, city, state, sqft,
  } = property;

  const displayLocation = [city, state].filter(Boolean).join(", ") || location;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (favorited) {
        await api.removeFromWishlist(id);
      } else {
        await api.addToWishlist(id);
      }
      onFavorite?.(id);
    } catch {}
    setWishlistLoading(false);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const info = await api.getShareInfo(id);
      if (navigator.share) {
        await navigator.share({ title: info.title, text: info.description, url: info.url });
      } else {
        await navigator.clipboard.writeText(info.url);
        setShareTooltip(true);
        setTimeout(() => setShareTooltip(false), 2000);
      }
    } catch {}
  };

  return (
    <div
      className="w-full overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 sm:h-66 w-full bg-gray-200 overflow-hidden">
        <img
          className={`${isHovered ? "scale-110" : "scale-100"} h-full w-full transition-transform duration-300 object-cover`}
          src={imageUrl || PLACEHOLDER_IMAGE}
          alt={title}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
        />
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700">
          {property.propertyType || category || "Property"}
        </span>

        {user && (
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
          >
            {wishlistLoading ? (
              <Loader2 size={20} className="animate-spin text-gray-400" />
            ) : (
              <Heart
                size={20}
                className={favorited ? "text-red-500 fill-red-500" : "text-gray-600"}
              />
            )}
          </button>
        )}

        {showShare && (
          <div className="absolute right-4 top-16">
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
              title="Share"
            >
              <Share2 size={18} className="text-gray-600" />
            </button>
            {shareTooltip && (
              <span className="absolute right-0 top-12 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow">
                Link copied!
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[17px] font-semibold text-gray-900 truncate">
            {title}
          </h2>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Star size={18} className="fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-800">{rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <MapPin size={16} />
          <span className="truncate">{displayLocation}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <BedDouble size={18} />
            <span>{beds}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={18} />
            <span>{baths}</span>
          </div>
          {sqft ? (
            <div className="flex items-center gap-1">
              <Maximize size={18} />
              <span>{sqft} sqft</span>
            </div>
          ) : null}
        </div>

        <hr className="border-gray-200 mb-4" />

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[18px] font-bold text-[#5e35b6]">${price.toLocaleString()}</span>
            <span className="text-gray-500">/mo</span>
          </div>
          <button
            onClick={() => router.push(`/property/${id}`)}
            className="rounded-xl bg-[#5e35b6] px-3 py-1.5 font-medium text-white transition-colors cursor-pointer hover:bg-[#4b2796]"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard2;
