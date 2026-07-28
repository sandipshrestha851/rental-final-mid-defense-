"use client";

import { usePathname, useRouter } from "next/navigation";
import Tenant_Navbar from "./Tenant_Navbar";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function getNavto(path: string): string {
    if (path.startsWith('/tenant-booking') || path.startsWith('/booking-details')) return 'bookings';
    if (path.startsWith('/booking/success')) return 'bookings';
    if (path.startsWith('/tenant/book/')) return 'bookings';
    return 'dashboard';
  }

  function setNavto(value: string) {
    switch (value) {
      case 'dashboard': router.push('/tenant'); break;
      case 'search': router.push('/tenant'); break;
      case 'bookings': router.push('/tenant-booking'); break;
      case 'messages': router.push('/tenant'); break;
      default: router.push('/tenant');
    }
  }

  return (
    <div className="flex">
      <Tenant_Navbar navto={getNavto(pathname)} setNavto={setNavto} />
      <main className="ml-[15%] w-[85%] min-h-screen">
        {children}
      </main>
    </div>
  );
}
