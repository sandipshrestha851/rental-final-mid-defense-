"use client";
import { X } from "lucide-react";
import { useEffect } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-end p-4">
          <button onClick={onClose} className="cursor-pointer p-1 rounded-lg hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-20">{children}</div>
      </div>
    </>
  );
}