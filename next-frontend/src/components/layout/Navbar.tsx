"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import MobileMenu from "../ui/MobileMenu";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div>
      <nav className="flex justify-between md:justify-around items-center mt-4.5 px-4 md:px-0">
        <div className="logo flex items-center gap-1.5">
          <img src="/assets/2.png" alt="Logo" className="h-12 w-auto" />
          <h2 className="webName font-bold text-2xl">RentNest</h2>
        </div>

        <div className="hidden md:flex midNav gap-12 text-[#737a88] text-xl font-medium">
          <a href="#browse"><p className="cursor-pointer">Browse</p></a>
          <a href="#how-it-works"><p className="cursor-pointer">How it works</p></a>
          <a href="#cities"><p className="cursor-pointer">Cities</p></a>
          <a href="#support"><p className="cursor-pointer">Support</p></a>
        </div>

        <div className="hidden md:flex getStarted gap-8">
          <Link href="/signin">
            <button className="signIn text-[#737a88] text-xl font-medium cursor-pointer">Sign in</button>
          </Link>
          <Link href="/get-started">
            <button className="getStarted bg-[#5e35b1] rounded-3xl w-30 h-10 text-white font-semibold text-[17px] cursor-pointer">Get Started</button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden cursor-pointer p-2 rounded-lg hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-[#737a88]" />
        </button>
      </nav>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
        <div className="flex flex-col gap-6 px-6 py-4 text-[#737a88] text-lg font-medium">
          <a href="#browse" onClick={() => setMobileOpen(false)}><p className="cursor-pointer">Browse</p></a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)}><p className="cursor-pointer">How it works</p></a>
          <a href="#cities" onClick={() => setMobileOpen(false)}><p className="cursor-pointer">Cities</p></a>
          <a href="#support" onClick={() => setMobileOpen(false)}><p className="cursor-pointer">Support</p></a>
          <hr className="border-gray-200" />
          <Link href="/signin" onClick={() => setMobileOpen(false)}>
            <button className="w-full text-[#737a88] text-lg font-medium cursor-pointer text-left">Sign in</button>
          </Link>
          <Link href="/get-started" onClick={() => setMobileOpen(false)}>
            <button className="w-full bg-[#5e35b1] rounded-3xl py-2.5 text-white font-semibold cursor-pointer">Get Started</button>
          </Link>
        </div>
      </MobileMenu>
    </div>
  );
};

export default Navbar;