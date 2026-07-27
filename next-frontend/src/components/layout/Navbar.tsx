import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <div>
      <nav className="flex justify-around mt-4.5 items-center">
        <div className="logo flex items-center gap-1.5">
          <img src="/assets/2.png" alt="Logo" className="h-12 w-auto" />
          <h2 className="webName font-bold text-2xl">RentNest</h2>
        </div>
        <div className="midNav flex gap-12 text-[#737a88] text-xl font-medium">
          <a href="#"><p className="cursor-pointer">Browse</p></a>
          <a href="#"><p className="cursor-pointer">How it works</p></a>
          <a href="#"><p className="cursor-pointer">Cities</p></a>
          <a href="#"><p className="cursor-pointer">Support</p></a>
        </div>
        <div className="getStarted flex gap-8">
          <Link href="/signin">
            <button className="signIn text-[#737a88] text-xl font-medium cursor-pointer">Sign in</button>
          </Link>
          <Link href="/get-started">
            <button className="getStarted bg-[#5e35b1] rounded-3xl w-30 h-10 text-white font-semibold text-[17px] cursor-pointer">Get Started</button>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
