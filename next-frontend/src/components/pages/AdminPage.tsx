"use client";

import React from 'react'
import { useState, useEffect } from 'react'
// import {useNavigate} from 'react-router-dom'
import AdminDashboard from '../layout/AdminDashboard'
import Admin_Navbar from '../layout/Admin_Navbar'
import Reservations from './MyReservations'
import { useRouter } from "next/navigation";
import { DashboardMain } from "@/components/organisms/dashboard/DashboardMain";
import { ChatApp } from "@/components/organisms/chat/ChatApp";

const LandLordPage = () => {
  const [navto, setNavto] = useState<string>("dashboard")
  const router = useRouter()
  return (
    <div className="flex">
      <Admin_Navbar
        navto={navto}
        setNavto={setNavto}
      />
      <main className={`${navto == "messages" ? "bg-[#0f0f1a]" : ""} ml-[15%] w-[85%] h-screen p-4`}>
        {navto == "dashboard" && <DashboardMain navto={navto} />}
        {navto == "users" && <DashboardMain navto={navto} />}
        {navto == "properties" && <Reservations />}
        {navto == "bookies" && <DashboardMain navto={navto} />}
      </main>
    </div>
  )
}

export default LandLordPage
