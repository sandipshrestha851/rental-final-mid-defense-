"use client";

import { NewPropertyInput } from "../../../lib/types";
import { NumberField } from "../FormFields";

interface DetailsStepProps {
  data: NewPropertyInput;
  onChange: (patch: Partial<NewPropertyInput>) => void;
}

export default function DetailsStep({ data, onChange }: DetailsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <NumberField
          label="Bedrooms"
          value={data.beds}
          onChange={(beds) => onChange({ beds })}
        />
        <NumberField
          label="Bathrooms"
          value={data.baths}
          onChange={(baths) => onChange({ baths })}
        />
        <NumberField
          label="Max guests"
          value={data.guests}
          onChange={(guests) => onChange({ guests })}
          min={1}
        />
        <NumberField
          label="Square feet"
          value={data.sqft}
          onChange={(sqft) => onChange({ sqft })}
        />
      </div>

      <NumberField
        label="Price per month ($)"
        value={data.price}
        onChange={(price) => onChange({ price })}
        min={0}
      />
    </div>
  );
}
