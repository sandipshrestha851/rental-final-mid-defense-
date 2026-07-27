"use client";

import React from 'react'
import { useState, useEffect } from 'react'
// import {useNavigate} from 'react-router-dom'
import AdminDashboard from '../layout/AdminDashboard'
import PropertiesAdmin from './PropertiesAdmin'
import Admin_Navbar from '../layout/Admin_Navbar'
import Reservations from './MyReservations'
import { useRouter } from "next/navigation";
import { DashboardMain } from "@/components/organisms/dashboard/DashboardMain";
import { ChatApp } from "@/components/organisms/chat/ChatApp";

const AdminPage = () => {
  const [navto, setNavto] = useState<string>("dashboard")
  const router = useRouter()
  return (
    <div className="flex">
      <Admin_Navbar
        navto={navto}
        setNavto={setNavto}
      />
      <main className={`ml-[15%] w-[85%] h-screen p-4`}>
        {navto == "dashboard" && <AdminDashboard/>}
        {navto == "users" && <DashboardMain navto={navto} role="Admin" />}
        {navto == "properties" && <PropertiesAdmin/>}
        {navto == "bookings" && <DashboardMain navto={navto} role="Admin" />}
      </main>
    </div>
  )
}

export default AdminPage;