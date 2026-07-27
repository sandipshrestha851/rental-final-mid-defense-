"use client";

import { useState } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { NewPropertyInput, Property, emptyNewProperty } from "../../lib/types";
import StepIndicator from "./StepIndicator";
import BasicInfoStep from "./steps/BasicInfoStep";
import LocationStep from "./steps/LocationStep";
import DetailsStep from "./steps/DetailsStep";
import AmenitiesPhotosStep from "./steps/AmenitiesPhotosStep";
import ReviewStep from "./steps/ReviewStep";

const STEP_LABELS = ["Basic Info", "Location", "Details", "Amenities", "Review"];

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&auto=format&fit=crop&q=60";

interface AddPropertyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (property: Property) => void;
}

export default function AddPropertyModal({
  open,
  onClose,
  onSubmit,
}: AddPropertyModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<NewPropertyInput>(emptyNewProperty);

  if (!open) return null;

  const isLastStep = step === STEP_LABELS.length - 1;

  function patch(update: Partial<NewPropertyInput>) {
    setForm((prev) => ({ ...prev, ...update }));
  }

  function reset() {
    setForm(emptyNewProperty);
    setStep(0);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleNext() {
    if (isLastStep) {
      const location = [form.city, form.state].filter(Boolean).join(", ");

      const newProperty: Property = {
        id: crypto.randomUUID(),
        title: form.title || "Untitled property",
        location: location || "Location not set",
        imageUrl: form.photos[0] || PLACEHOLDER_IMAGE,
        status: "Pending",
        beds: form.beds,
        baths: form.baths,
        rating: 0,
        price: form.price,
        bookings: 0,
        description: form.description,
        category: form.category || undefined,
        propertyType: form.propertyType || undefined,
        address: form.address,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country,
        guests: form.guests,
        sqft: form.sqft,
        amenities: form.amenities,
        photos: form.photos,
      };

      onSubmit(newProperty);
      handleClose();
      return;
    }

    setStep((s) => s + 1);
  }

  function handleBack() {
    if (step === 0) {
      handleClose();
      return;
    }
    setStep((s) => s - 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Add New Property</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="border-b border-gray-100 px-6 py-5">
          <StepIndicator steps={STEP_LABELS} currentStep={step} />
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 0 && <BasicInfoStep data={form} onChange={patch} />}
          {step === 1 && <LocationStep data={form} onChange={patch} />}
          {step === 2 && <DetailsStep data={form} onChange={patch} />}
          {step === 3 && <AmenitiesPhotosStep data={form} onChange={patch} />}
          {step === 4 && <ReviewStep data={form} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-800"
          >
            {isLastStep ? "Publish Property" : "Next"}
            {!isLastStep && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
