"use client";

import { Heart, Star, MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { useState } from "react";

const PropertyCard = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-md transition-translate duration-300 hover:shadow-xl hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Placeholder */}
      <div className="relative h-66 w-full bg-gray-200 overflow-hidden">
        <img
          className={`${isHovered ? "scale-110" : "scale-100"} Property_img h-full w-full transition-transform duration-300 object-cover`}
          src="/assets/sample_property.png"
          alt=""
        />
        {/* Category */}
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700">
          House
        </span>

        {/* Favorite */}
        <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
          <Heart size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-6">
        {/* Title & Rating */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[17px] font-semibold text-gray-900">
            Modern Family Home with Garden
          </h2>

          <div className="flex items-center gap-1">
            <Star size={18} className="fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-800">4.9</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <MapPin size={16} />
          <span>Austin, TX</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <BedDouble size={18} />
            <span>4</span>
          </div>

          <div className="flex items-center gap-1">
            <Bath size={18} />
            <span>3</span>
          </div>

          <div className="flex items-center gap-1">
            <Maximize size={18} />
            <span>2800 sqft</span>
          </div>
        </div>

        <hr className="border-gray-200 mb-4" />

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[18px] font-bold text-[#5e35b6]">$4,500</span>
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

export default PropertyCard;
