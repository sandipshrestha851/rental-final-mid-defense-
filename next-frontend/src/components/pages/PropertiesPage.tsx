// "use client";
// import { useMemo, useState } from "react";
// import { Plus, Search } from "lucide-react";
// import TopBar from "../ui/TopBar";
// import PropertyCard from "../ui/PropertyCard";
// import StatusFilter from "../ui/StatusFilter";
// import { Property } from "../../lib/types";
// import { mockProperties } from "../../data/mockProperties";

// const STATUS_OPTIONS = ["All Status", "Active", "Pending", "Draft"];

// interface PropertiesPageProps {
//   properties?: Property[];
//   onAddProperty?: () => void;
//   onSelectProperty?: (property: Property) => void;
// }

// export default function PropertiesPage({
//   properties = mockProperties,
//   onAddProperty,
//   onSelectProperty,
// }: PropertiesPageProps) {
//   const [query, setQuery] = useState("");
//   const [status, setStatus] = useState("All Status");

//   const filtered = useMemo(() => {
//     return properties.filter((p) => {
//       const matchesQuery =
//         p.title.toLowerCase().includes(query.toLowerCase()) ||
//         p.location.toLowerCase().includes(query.toLowerCase());
//       const matchesStatus = status === "All Status" || p.status === status;
//       return matchesQuery && matchesStatus;
//     });
//   }, [properties, query, status]);

//   return (
//     <div className="min-h-screen bg-violet-50/40">
//       <TopBar />

//       <main className="mx-auto max-w-7xl px-6 py-8">
//         {/* Page header */}
//         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
//             <p className="mt-1 text-sm text-gray-500">
//               Manage your property listings
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={onAddProperty}
//             className="flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-800"
//           >
//             <Plus className="h-4 w-4" />
//             Add New Property
//           </button>
//         </div>

//         {/* Search + filter */}
//         <div className="mb-6 flex flex-col gap-3 sm:flex-row">
//           <div className="relative flex-1">
//             <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search properties..."
//               className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
//             />
//           </div>

//           <StatusFilter
//             options={STATUS_OPTIONS}
//             value={status}
//             onChange={setStatus}
//           />
//         </div>

//         {/* Cards grid */}
//         {filtered.length > 0 ? (
//           <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
//             {filtered.map((property) => (
//               <PropertyCard
//                key={property.id}
//                 property={property}
//                 onClick={onSelectProperty}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-sm text-gray-400">
//             No properties match your search.
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import TopBar from "../ui/TopBar";
import PropertyCard from "../ui/PropertyCard";
import StatusFilter from "../ui/StatusFilter";
import AddPropertyModal from "../ui/AddPropertyModal";
import { Property } from "../../lib/types";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

const STATUS_OPTIONS = ["All Status", "Active", "Pending", "Draft"];

interface PropertiesPageProps {
  onSelectProperty?: (property: Property) => void;
}

export default function PropertiesPage({
  onSelectProperty,
}: PropertiesPageProps) {
  const { token } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProperties = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await api.getMyProperties(token);
      setProperties(data);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesQuery =
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.location.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "All Status" || p.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [properties, query, status]);

  async function handleAddProperty(newProperty: Property) {
    if (!token) return;
    try {
      const saved = await api.createProperty(token, newProperty);
      setProperties((prev) => [saved, ...prev]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to save property: ${msg}`);
    }
  }

  return (
    <div className="min-h-screen bg-violet-50/40">
      <TopBar role="Landlord" page="Properties" />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your property listings
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-800"
          >
            <Plus className="h-4 w-4" />
            Add New Property
          </button>
        </div>

        {/* Search + filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search properties..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>

          <StatusFilter
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={onSelectProperty}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-sm text-gray-400">
            {properties.length === 0
              ? "No properties yet. Add your first property!"
              : "No properties match your search."}
          </div>
        )}
      </main>

      <AddPropertyModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProperty}
      />
    </div>
  );
}
