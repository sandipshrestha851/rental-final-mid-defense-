"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  LogOut,
  Search,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
type SideNavbarProps = {
  navto: string;
  setNavto: React.Dispatch<React.SetStateAction<string>>;
};

const Tenant_Navbar = ({ navto, setNavto }: SideNavbarProps) => {
  const router = useRouter();
 const { user, ready, logout } = useAuth(); 
  // const [navto, setNavto] = useState("dashboard");
  const [isVisible, setIsVisible] = useState(false);

  function toggle() {
    setIsVisible((prev) => !prev);
  }

  function handleLogout() {
    logout();
    router.push("/signin");
  }

  return (
    <div className="flex">
      <nav className="flex flex-col bg-[#1a1a2e] w-[15%] h-screen fixed">
        <div className="logo flex items-center gap-2 my-6 mx-5 text-white">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-[#5E35B1] to-[#7C4DFF] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-house w-5 h-5 text-white"
              aria-hidden="true"
            >
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <h2 className="font-semibold text-xl">RentNest</h2>
        </div>
        <div className="seperator w-full h-px bg-[#313143]"></div>
        <div className="navOptions my-8 ml-3">
          <ul className="text-[#6e83a0] space-y-2 text-[18px] font-semibold">
            <li
              className={`${navto == "dashboard" ? "bg-[#282048] text-[#c7f1ff]" : ""} flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
              onClick={() => setNavto("dashboard")}
            >
              <LayoutDashboard />
              <span>Dashboard</span>
            </li>
            <li
              className={`${navto == "search" ? "bg-[#282048] text-[#c7f1ff]" : ""} flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
              onClick={() => setNavto("search")}
            >
              <Search />
              <span>Search</span>
            </li>
            <li
              className={`${navto == "bookings" ? "bg-[#282048] text-[#c7f1ff]" : ""} flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
              onClick={() => setNavto("bookings")}
            >
              <Calendar />
              <span>My Bookings</span>
            </li>
            <li
              className={`${navto == "messages" ? "bg-[#282048] text-[#c7f1ff]" : ""} flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
              onClick={() => setNavto("messages")}
            >
              <MessageSquare />
              <span>Messages</span>
            </li>
          </ul>
        </div>
        <div className="bottom mt-auto">
          <div
            className={`${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} Logout text-center w-[90%] mx-auto p-4.5 bg-[#252540] rounded-2xl space-y-1 transition-all duration-500`}
          >
            <p className="profileBtn flex gap-1.5 text-[#6e83a0] cursor-pointer p-2 rounded-xl transition-all duration-200 hover:bg-[#ffffff0d] hover:text-white">
              <User />
              <span>Profile</span>
            </p>
            <p
              onClick={handleLogout}
              className="LogoutBtn flex gap-1.5 text-[#f87171] cursor-pointer p-2 rounded-xl transition-all duration-200 hover:bg-[#ffffff0d]"
            >
              <LogOut />
              <span>Logout</span>
            </p>
          </div>

          <div
            className="profile w-[90%] flex items-center my-4 ml-3 gap-2.5 cursor-pointer rounded-xl p-2 hover:bg-[#ffffff0d]"
            onClick={() => toggle()}
          >
            <img src="/assets/guest.png" alt="" className="profilePic w-7 rounded-full" />
            <div className="info">
              <p className="uname text-[14px] font-semibold text-white">
                {!ready ? "" : user?.full_name || "Guest"}
              </p>
              <p className="role text-[12px] text-[#6e83a0]">
                {!ready
                  ? ""
                  : user?.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "Tenant"}
              </p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Tenant_Navbar;
