import { Search, Bell } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-gray-400">Landlord</span>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-violet-700">Properties</span>
      </nav>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties, bookings..."
            className="w-64 rounded-full bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-gray-500 hover:bg-gray-50"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        <img
          src="https://i.pravatar.cc/64?img=12"
          alt="Account"
          className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
        />
      </div>
    </header>
  );
}
