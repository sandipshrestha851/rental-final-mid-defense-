"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface StatusFilterProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function StatusFilter({ options, value, onChange }: StatusFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full min-w-[140px] max-w-[160px] items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
      >
        {value}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <ul className="absolute right-0 z-10 mt-1 w-full min-w-[140px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm ${
                  option === value
                    ? "bg-violet-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
