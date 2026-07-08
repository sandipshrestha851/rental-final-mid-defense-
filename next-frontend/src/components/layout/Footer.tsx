import React from "react";

function Footer() {
  return (
    <footer className="bg-[#1D1B33] text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
          {/* Logo Section */}
          <div>
            <div className="mb-6 logo flex gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#5E35B1] to-[#7C4DFF] flex items-center justify-center">
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
                  className="lucide lucide-house w-4 h-4 text-white"
                  aria-hidden="true"
                >
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">RentNest</h1>
            </div>
            <p className="text-[#A6A8C5] leading-8 max-w-sm">
              Premium rental management platform connecting tenants with their
              perfect homes and landlords with quality tenants.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Company</h3>
            <ul className="space-y-4 text-[#A6A8C5]">
              <li className="hover:text-white transition cursor-pointer">About</li>
              <li className="hover:text-white transition cursor-pointer">Careers</li>
              <li className="hover:text-white transition cursor-pointer">Press</li>
              <li className="hover:text-white transition cursor-pointer">Blog</li>
            </ul>
          </div>

          {/* Properties */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Properties</h3>
            <ul className="space-y-4 text-[#A6A8C5]">
              <li className="hover:text-white transition cursor-pointer">Apartments</li>
              <li className="hover:text-white transition cursor-pointer">Houses</li>
              <li className="hover:text-white transition cursor-pointer">Villas</li>
              <li className="hover:text-white transition cursor-pointer">Studios</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Support</h3>
            <ul className="space-y-4 text-[#A6A8C5]">
              <li className="hover:text-white transition cursor-pointer">Help Center</li>
              <li className="hover:text-white transition cursor-pointer">Terms of Service</li>
              <li className="hover:text-white transition cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white transition cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#343252] my-12"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[#8084A6] text-sm gap-4">
          <p>RentNest Stays. All rights reserved.</p>
          <p>Made with care for tenants and landlords everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
