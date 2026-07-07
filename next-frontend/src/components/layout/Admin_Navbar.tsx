"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  Shield,
  Building2,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type SideNavbarProps = {
  navto: string;
  setNavto: React.Dispatch<React.SetStateAction<string>>;
};

const Admin_Navbar = ({ navto, setNavto }: SideNavbarProps) => {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/authadmin");
  }

  return (
    <div className="flex">
      <nav className="flex flex-col bg-[#1a1a2e] w-[15%] h-screen fixed">

        {/* Brand Logo */}
        <div className="logo flex items-center gap-2 my-6 mx-5 text-white">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-[#5E35B1] to-[#7C4DFF] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-semibold text-xl">RentNest</h2>
        </div>

        <div className="seperator w-full h-px bg-[#313143]"></div>

        {/* Nav Options */}
        <div className="navOptions my-8 ml-3 text-left">
          <ul className="text-[#6e83a0] space-y-2 text-[18px] font-semibold">
            <li
              className={`${navto === "dashboard" ? "bg-[#282048] text-[#c7f1ff]" : ""
                } flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
              onClick={() => setNavto("dashboard")}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span>Dashboard</span>
            </li>

            <li
              className={`${navto === "users" ? "bg-[#282048] text-[#c7f1ff]" : ""
                } flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
              onClick={() => setNavto("users")}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span>Users</span>
            </li>

            <li
              className={`${navto === "properties" ? "bg-[#282048] text-[#c7f1ff]" : ""
                } flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
              onClick={() => setNavto("properties")}
            >
              <Building2 className="w-5 h-5 shrink-0" />
              <span>Properties</span>
            </li>

            <li
              className={`${navto === "bookings" ? "bg-[#282048] text-[#c7f1ff]" : ""
                } flex gap-1.5 items-center cursor-pointer p-2 rounded-xl transition-all duration-100 hover:bg-[#ffffff0d] hover:text-[#c7f1ff] w-[95%]`}
              onClick={() => setNavto("bookings")}
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>Bookings</span>
            </li>
          </ul>
        </div>

        {/* Bottom Profile Details (Simple, without sub-sections/popups) */}
        <div className="bottom mt-auto p-4 border-t border-[#313143]/40">
          <div className="flex items-center gap-2.5 mb-3 px-1 text-left">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-md select-none">
              SA
            </div>
            <div className="overflow-hidden">
              <p className="uname text-[13px] font-semibold text-white truncate">
                {!ready ? "" : user?.full_name || "System Admin"}
              </p>
              <p className="role text-[9px] text-[#6e83a0] tracking-wider uppercase font-semibold">
                Admin Console
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-red-950/40 hover:bg-red-900/50 text-red-400 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>

      </nav>
    </div>
  );
};

export default Admin_Navbar;
