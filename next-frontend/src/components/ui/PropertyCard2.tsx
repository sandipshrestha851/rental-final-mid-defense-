"use client";

import { Heart, Star, MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/lib/types";

interface PropertyCard2Props {
  property: Property;
  onFavorite?: (id: string) => void;
  favorited?: boolean;
}

const PropertyCard2 = ({ property, onFavorite, favorited }: PropertyCard2Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    id, title, location, imageUrl, status, beds, baths, rating, price,
    category, city, state, sqft,
  } = property;

  const displayLocation = [city, state].filter(Boolean).join(", ") || location;

  return (
    <div
      className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-66 w-full bg-gray-200 overflow-hidden">
        <img
          className={`${isHovered ? "scale-110" : "scale-100"} h-full w-full transition-transform duration-300 object-cover`}
          src={imageUrl}
          alt={title}
        />
        {/* Property Type */}
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700">
          {property.propertyType || category || "Property"}
        </span>

        {/* Favorite */}
        {onFavorite && (
          <button
            onClick={() => onFavorite(id)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
          >
            <Heart
              size={20}
              className={favorited ? "text-red-500 fill-red-500" : "text-gray-600"}
            />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6">
        {/* Title & Rating */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[17px] font-semibold text-gray-900 truncate">
            {title}
          </h2>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Star size={18} className="fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-800">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <MapPin size={16} />
          <span className="truncate">{displayLocation}</span>
        </div>

        {/* Property Details */}
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

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[18px] font-bold text-[#5e35b6]">${price.toLocaleString()}</span>
            <span className="text-gray-500">/mo</span>
          </div>

          <button className="rounded-xl bg-[#5e35b6] px-3 py-1.5 font-medium text-white transition-colors cursor-pointer hover:bg-[#4b2796]">
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard2;
