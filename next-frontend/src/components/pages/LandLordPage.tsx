"use client";

import React from 'react'
import { useState, useEffect } from 'react'
// import {useNavigate} from 'react-router-dom'
import Landlord_Navbar from '../layout/Landlord_Navbar'
import Reservations from './MyReservations'
import { useRouter } from "next/navigation";
import { DashboardMain } from "@/components/organisms/dashboard/DashboardMain";
import { ChatApp } from "@/components/organisms/chat/ChatApp";
import PropertiesPage from "./PropertiesPage"

const LandLordPage = () => {
  const [navto, setNavto] = useState<string>("dashboard")
  const router = useRouter()
  return (
    <div className="flex">
      <Landlord_Navbar
        navto={navto}
        setNavto={setNavto}
      />
      <main className={`${navto == "messages" ? "bg-[#0f0f1a]" : ""} ml-[15%] w-[85%] h-screen p-4`}>
        {navto == "dashboard" && <DashboardMain navto={navto} />}
        {navto == "properties" && <PropertiesPage />}
        {navto == "reservation" && <Reservations />}
        {navto == "reviews" && <DashboardMain navto={navto} />}
        {navto === "messages" && <ChatApp embedded loginPath="/signin" />}
      </main>
    </div>
  )
}

export default LandLordPage
