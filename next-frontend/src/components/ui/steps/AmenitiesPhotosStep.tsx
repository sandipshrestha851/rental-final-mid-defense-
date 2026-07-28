"use client";

import { useRef } from "react";
import {
  Wifi,
  Utensils,
  Car,
  Waves,
  Wind,
  Tv,
  Dumbbell,
  Flame,
  PawPrint,
  Briefcase,
  Upload,
  X,
} from "lucide-react";
import { NewPropertyInput } from "../../../lib/types";
import { FieldLabel } from "../FormFields";

const AMENITIES: { label: string; icon: typeof Wifi }[] = [
  { label: "WiFi", icon: Wifi },
  { label: "Kitchen", icon: Utensils },
  { label: "Free parking", icon: Car },
  { label: "Pool", icon: Waves },
  { label: "Air conditioning", icon: Wind },
  { label: "TV", icon: Tv },
  { label: "Gym", icon: Dumbbell },
  { label: "Fireplace", icon: Flame },
  { label: "Pets allowed", icon: PawPrint },
  { label: "Workspace", icon: Briefcase },
];

interface AmenitiesPhotosStepProps {
  data: NewPropertyInput;
  onChange: (patch: Partial<NewPropertyInput>) => void;
}

export default function AmenitiesPhotosStep({
  data,
  onChange,
}: AmenitiesPhotosStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleAmenity(label: string) {
    const has = data.amenities.includes(label);
    onChange({
      amenities: has
        ? data.amenities.filter((a) => a !== label)
        : [...data.amenities, label],
    });
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files);
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    onChange({
      photos: [...data.photos, ...urls],
      photoFiles: [...data.photoFiles, ...newFiles],
    });
  }

  function removePhoto(url: string) {
    const idx = data.photos.indexOf(url);
    if (idx >= 0) {
      const newPhotoFiles = [...data.photoFiles];
      newPhotoFiles.splice(idx, 1);
      const newPhotos = data.photos.filter((p) => p !== url);
      onChange({ photos: newPhotos, photoFiles: newPhotoFiles });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <FieldLabel>Amenities</FieldLabel>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {AMENITIES.map(({ label, icon: Icon }) => {
            const selected = data.amenities.includes(label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleAmenity(label)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                  selected
                    ? "border-violet-600 bg-violet-50 text-violet-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel>Photos</FieldLabel>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-8 text-sm text-gray-500 transition hover:border-violet-300 hover:bg-violet-50/40"
        >
          <Upload className="h-5 w-5 text-gray-400" />
          Click to upload photos, or drag and drop
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {data.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {data.photos.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
              >
                <img
                  src={url}
                  alt="Property preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  aria-label="Remove photo"
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
