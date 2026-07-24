"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 0-based
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center">
      {steps.map((label, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                  isComplete
                    ? "bg-violet-700 text-white"
                    : isCurrent
                    ? "bg-violet-100 text-violet-700 ring-2 ring-violet-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  isCurrent ? "text-violet-700" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded ${
                  isComplete ? "bg-violet-700" : "bg-gray-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
