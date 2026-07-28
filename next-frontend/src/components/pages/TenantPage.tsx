"use client";

import React from 'react'
import { useState, useEffect } from 'react'
// import {useNavigate} from 'react-router-dom'
import Tenant_Navbar from '../layout/Tenant_Navbar'
import TenantDashboard from './TenantDashboard'
import Reservations from './MyReservations'
import { useRouter } from "next/navigation";
import Search from "./Search"
import MyBookings from "./MyBookings"
import { DashboardMain } from "@/components/organisms/dashboard/DashboardMain";
import { ChatApp } from "@/components/organisms/chat/ChatApp";
import ProfilePage from "./ProfilePage";

const TenantPage = () => {
    const [navto, setNavto] = useState<string>("dashboard")
    const router = useRouter()
    return (
        <div className="flex">
            <Tenant_Navbar
                navto={navto}
                setNavto={setNavto}
            />
            <main className={`${navto=="messages"?"bg-[#0f0f1a]":""} ml-[15%] w-[85%] h-screen p-4`}>
                {navto === "dashboard" && <TenantDashboard/>}
                {navto === "search" && <Search />}
                {navto === "bookings" && <MyBookings />}
                {navto === "profile" && <ProfilePage />}
                {navto === "messages" && <ChatApp embedded loginPath="/signin" />}
            </main>
        </div>
    )
}

export default TenantPage
