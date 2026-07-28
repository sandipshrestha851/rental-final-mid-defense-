"use client";

import React from 'react'
import { useState, useEffect } from 'react'
// import {useNavigate} from 'react-router-dom'
import AdminDashboard from '../layout/AdminDashboard'
import PropertiesAdmin from './PropertiesAdmin'
import { AdminUsersPage } from './AdminUsersPage'
import Admin_Navbar from '../layout/Admin_Navbar'
import Reservations from './MyReservations'
import { useRouter } from "next/navigation";
import { DashboardMain } from "@/components/organisms/dashboard/DashboardMain";
import { ChatApp } from "@/components/organisms/chat/ChatApp";
import AdminHeader from '@/components/ui/AdminHeader'

const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  properties: "Properties",
  bookings: "Bookings",
};

const AdminPage = () => {
  const [navto, setNavto] = useState<string>("dashboard")
  const router = useRouter()
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
          {navto == "dashboard" && <AdminDashboard/>}
          {navto == "users" && <AdminUsersPage />}
          {navto == "properties" && <PropertiesAdmin/>}
          {navto == "bookings" && <DashboardMain navto={navto} role="Admin" />}
        </div>
      </main>
    </div>
  )
}

export default AdminPage;