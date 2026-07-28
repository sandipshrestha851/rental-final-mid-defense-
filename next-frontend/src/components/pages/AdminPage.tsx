"use client";

import { useState } from 'react'
import AdminDashboard from '../layout/AdminDashboard'
import PropertiesAdmin from './PropertiesAdmin'
import { AdminUsersPage } from './AdminUsersPage'
import Admin_Navbar from '../layout/Admin_Navbar'
import AdminBookingsPage from './AdminBookingsPage'
import AdminHeader from '@/components/ui/AdminHeader'

const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  properties: "Properties",
  bookings: "Bookings",
};

const AdminPage = ({ initialPage = "dashboard" }: { initialPage?: string }) => {
  const [navto, setNavto] = useState<string>(initialPage)
  const pageLabel = PAGE_LABELS[navto] ?? "Dashboard"

  return (
    <div className="flex">
      <Admin_Navbar
        navto={navto}
        setNavto={setNavto}
      />
      <main className="ml-[15%] w-[85%] h-screen flex flex-col">
        <AdminHeader page={pageLabel} />
        <div className="flex-1 overflow-y-auto p-6">
          {navto == "dashboard" && <AdminDashboard onNavigate={setNavto} />}
          {navto == "users" && <AdminUsersPage />}
          {navto == "properties" && <PropertiesAdmin/>}
          {navto == "bookings" && <AdminBookingsPage />}
        </div>
      </main>
    </div>
  )
}

export default AdminPage;
