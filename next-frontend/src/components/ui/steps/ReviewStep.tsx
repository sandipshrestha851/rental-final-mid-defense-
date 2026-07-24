"use client";

import { MapPin, BedDouble, Bath, Users, Ruler } from "lucide-react";
import { NewPropertyInput } from "../../../lib/types";

interface ReviewStepProps {
  data: NewPropertyInput;
}

export default function ReviewStep({ data }: ReviewStepProps) {
  const coverPhoto = data.photos[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <div className="h-44 w-full bg-gray-100">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt={data.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              No photo added
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {data.title || "Untitled property"}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              {[data.address, data.city, data.state].filter(Boolean).join(", ") ||
                "No address added"}
            </p>
          </div>

          {data.description && (
            <p className="text-sm text-gray-600">{data.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4 text-gray-400" />
              {data.beds} beds
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-gray-400" />
              {data.baths} baths
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-gray-400" />
              {data.guests} guests
            </span>
            {data.sqft > 0 && (
              <span className="flex items-center gap-1.5">
                <Ruler className="h-4 w-4 text-gray-400" />
                {data.sqft} sqft
              </span>
            )}
          </div>

          {data.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
              {data.amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          <p className="border-t border-gray-100 pt-3 text-base font-semibold text-violet-700">
            ${data.price.toLocaleString()}
            <span className="text-sm font-normal text-gray-400">/mo</span>
          </p>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400">
        Review the details above, then publish to add this property to your
        listings.
      </p>
    </div>
  );
}
