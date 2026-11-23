"use client";

import { NewPropertyInput } from "../../../lib/types";
import { TextField } from "../FormFields";

interface LocationStepProps {
  data: NewPropertyInput;
  onChange: (patch: Partial<NewPropertyInput>) => void;
}

export default function LocationStep({ data, onChange }: LocationStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="Street address"
        value={data.address}
        onChange={(address) => onChange({ address })}
        placeholder="123 Main St"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="City"
          value={data.city}
          onChange={(city) => onChange({ city })}
          placeholder="Los Angeles"
          required
        />
        <TextField
          label="State"
          value={data.state}
          onChange={(state) => onChange({ state })}
          placeholder="CA"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="ZIP code"
          value={data.zipCode}
          onChange={(zipCode) => onChange({ zipCode })}
          placeholder="90012"
        />
        <TextField
          label="Country"
          value={data.country}
          onChange={(country) => onChange({ country })}
          placeholder="United States"
        />
      </div>
    </div>
  );
}
