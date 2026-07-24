"use-client";
import { MapPin, BedDouble, Bath, Star } from "lucide-react";
import { Property } from "../../lib/types";
import StatusBadge from "../ui/StatusBadge";

interface PropertyCardProps {
  property: Property;
  onClick?: (property: Property) => void;
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  const {
    title,
    location,
    imageUrl,
    status,
    beds,
    baths,
    rating,
    price,
    bookings,
  } = property;

  return (
    <button
      type="button"
      onClick={() => onClick?.(property)}
      className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <StatusBadge status={status} />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        <div>
          <h3 className="line-clamp-1 text-[15px] font-semibold text-gray-900">
            {title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {location}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-gray-400" />
            {beds}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-gray-400" />
            {baths}
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <p className="text-base font-semibold text-violet-700">
            ${price.toLocaleString()}
            <span className="text-sm font-normal text-gray-400">/mo</span>
          </p>
          <p className="text-sm text-gray-400">{bookings} bookings</p>
        </div>
      </div>
    </button>
  );
}

