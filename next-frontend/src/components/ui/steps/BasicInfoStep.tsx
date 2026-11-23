"use client";

import { Building2, Home, Palmtree, Warehouse, Hotel, Building, Tag } from "lucide-react";
import { NewPropertyInput, PropertyCategory, PropertyType } from "../../../lib/types";
import { TextField, TextAreaField, FieldLabel } from "../FormFields";

const CATEGORIES: { value: PropertyCategory; icon: typeof Home }[] = [
  { value: "Apartment", icon: Building2 },
  { value: "House", icon: Home },
  { value: "Villa", icon: Palmtree },
  { value: "Studio", icon: Warehouse },
  { value: "Condo", icon: Building },
  { value: "Loft", icon: Hotel },
];

const PROPERTY_TYPES: PropertyType[] = ["For Rent", "For Sale", "Lease"];

interface BasicInfoStepProps {
  data: NewPropertyInput;
  onChange: (patch: Partial<NewPropertyInput>) => void;
}

export default function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="Property title"
        value={data.title}
        onChange={(title) => onChange({ title })}
        placeholder="e.g. Industrial Loft in Arts District"
        required
      />

      <TextAreaField
        label="Description"
        value={data.description}
        onChange={(description) => onChange({ description })}
        placeholder="Describe what makes this place special..."
      />

      <div>
        <FieldLabel>Listing type</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PROPERTY_TYPES.map((value) => {
            const selected = data.propertyType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ propertyType: value })}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                  selected
                    ? "border-violet-600 bg-violet-50 text-violet-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Tag className="h-4 w-4" />
                {value}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel>Category</FieldLabel>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {CATEGORIES.map(({ value, icon: Icon }) => {
            const selected = data.category === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ category: value })}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-medium transition ${
                  selected
                    ? "border-violet-600 bg-violet-50 text-violet-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                {value}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
