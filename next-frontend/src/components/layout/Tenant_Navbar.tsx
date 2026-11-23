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
  Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import MobileMenu from "../ui/MobileMenu";
type SideNavbarProps = {
  navto: string;
  setNavto: ((value: string) => void) | React.Dispatch<React.SetStateAction<string>>;
};

const Tenant_Navbar = ({ navto, setNavto }: SideNavbarProps) => {
  const router = useRouter();
 const { user, ready, logout } = useAuth(); 
  const [isVisible, setIsVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggle() {
    setIsVisible((prev) => !prev);
  }

  function handleLogout() {
    logout();
    router.push("/signin");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="logo flex items-center gap-2 my-6 mx-5 text-white">
        <img src="/assets/2.png" alt="Logo" className="h-12 w-auto" />
        <h2 className="font-semibold text-xl">RentNest</h2>
      </div>
      <div className="seperator w-full h-px bg-[#313143]"></div>
      <div className="navOptions my-8 ml-3">
        <ul className="text-[#6e83a0] space-y-2 text-[18px] font-semibold">
          <li
            className={`${navto == "dashboard" ? "bg-[#282048] text-[#c7f1ff]" : ""} flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
            onClick={() => { setNavto("dashboard"); setMobileOpen(false); }}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </li>
          <li
            className={`${navto == "search" ? "bg-[#282048] text-[#c7f1ff]" : ""} flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
            onClick={() => { setNavto("search"); setMobileOpen(false); }}
          >
            <Search />
            <span>Search</span>
          </li>
          <li
            className={`${navto == "bookings" ? "bg-[#282048] text-[#c7f1ff]" : ""} flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
            onClick={() => { setNavto("bookings"); setMobileOpen(false); }}
          >
            <Calendar />
            <span>My Bookings</span>
          </li>
          <li
            className={`${navto == "profile" ? "bg-[#282048] text-[#c7f1ff]" : ""} flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
            onClick={() => { setNavto("profile"); setMobileOpen(false); }}
          >
            <User />
            <span>Profile</span>
          </li>
          <li
            className={`${navto == "messages" ? "bg-[#282048] text-[#c7f1ff]" : ""} flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
            onClick={() => { setNavto("messages"); setMobileOpen(false); }}
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
          <p onClick={() => { setNavto("profile"); setMobileOpen(false); }} className="profileBtn flex gap-1.5 text-[#6e83a0] cursor-pointer p-2 rounded-xl transition-all duration-200 hover:bg-[#ffffff0d] hover:text-white">
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
    </div>
  );

  return (
    <div className="flex">
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden cursor-pointer p-2 rounded-lg bg-[#1a1a2e] text-white"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
      <nav className="hidden lg:flex flex-col bg-[#1a1a2e] w-[15%] h-screen fixed">
        {sidebarContent}
      </nav>
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
        {sidebarContent}
      </MobileMenu>
    </div>
  );
};

export default Tenant_Navbar;