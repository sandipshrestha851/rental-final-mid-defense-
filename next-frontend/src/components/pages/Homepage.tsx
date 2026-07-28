"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import PropertyCard2 from "../ui/PropertyCard2";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Property } from "@/lib/types";

const Homepage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    api.getWishlistIds().then(setFavorites).catch(() => {});
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    api
      .getActiveProperties()
      .then((rows) => {
        if (!cancelled) setProperties(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div>
      <div className="-mb-10">
        <Navbar />
        <div className="intro mt-40 flex">
          <div className="left w-[38%] ml-[15%]">
            <div className="introText">
              <p className="text-[#5e35b6] mb-6">Rental Management Simplified</p>
              <h1 className="heading text-6xl font-bold">Find Your Perfect Stay, Manage Your Properties</h1>
              <p className="descriptions text-[#6B7290] mt-6 text-xl">Discover beautiful homes, apartments, and unique spaces. For tenants and landlords who value simplicity and elegance.</p>
            </div>
            <div className="buttons mt-6 flex gap-5">
              <button className="browseProp bg-[#5e35b1] px-7 py-3.5 rounded-2xl text-white font-semibold hover:bg-[#502c99] transition-all duration-300 ease cursor-pointer">Browse Properties</button>
              <button className="listProp text-[#9735b1] px-7 py-3.5 rounded-2xl font-semibold border-2 border-[#ddd6fe] hover:bg-[#ebebeb] transition-all duration-300 ease cursor-pointer">List Your Property</button>
            </div>
            <div className="acheivements flex mt-10 justify-between mr-24">
              <div className="properties">
                <div className="upper flex gap-1">
                  <img src="/assets/properties_icon.svg" alt="" className="icon text-[#5E35B1] w-4" />
                  <p className="acheiveNumber text-xl font-bold">2400+</p>
                </div>
                <p className="acheiveName text-[12px]">Properties</p>
              </div>
              <div className="Tenants">
                <div className="upper flex gap-1">
                  <img src="/assets/properties_icon.svg" alt="" className="icon text-[#5E35B1] w-4" />
                  <p className="acheiveNumber text-xl font-bold">15,000+</p>
                </div>
                <p className="acheiveName text-[12px]">Happy Tenants</p>
              </div>
              <div className="Rating">
                <div className="upper flex gap-1">
                  <img src="/assets/properties_icon.svg" alt="" className="icon text-[#5E35B1] w-4" />
                  <p className="acheiveNumber text-xl font-bold">4.8</p>
                </div>
                <p className="acheiveName text-[12px]">Rating</p>
              </div>
              <div className="Cities">
                <div className="upper flex gap-1">
                  <img src="/assets/properties_icon.svg" alt="" className="icon text-[#5E35B1] w-4" />
                  <p className="acheiveNumber text-xl font-bold">50+</p>
                </div>
                <p className="acheiveName text-[12px]">Cities</p>
              </div>
            </div>
          </div>
          <div className="right w-[30%] mr-[15%] flex ml-13 gap-7">
            <img className="left_img w-60 h-64 rounded-2xl m-auto -rotate-8" src="/assets/left_img.png" alt="" />
            <div className="right_images">
              <img className="top_right_img w-3xs h-72 rounded-2xl relative rotate-8 -z-1" src="/assets/top_right_img.png" alt="" />
              <img className="right_bottom_img w-60 h-64 rounded-2xl absolute top-101" src="/assets/right_bottom_img.png" alt="" />
            </div>
          </div>
        </div>

        <div className="FeaturedProp ml-[15%] mr-[15%] mt-40">
          <div className="heading flex justify-between items-center">
            <div className="leftHeading mb-8">
              <h1 className="text-4xl font-bold">Featured Properties</h1>
              <p className="text-[#717171]">Hand-picked properties for you</p>
            </div>
            <div className="viewBtn text-[#7235b1] cursor-pointer flex gap-0.5 items-center">
              <a href="#" className="no-underline hover:underline font-bold">View All</a>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4" aria-hidden="true">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
          <div className="cards">
             <div className="PropertyContainer grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {!loading && properties.slice(0, 6).map((property) => (
                <PropertyCard2 key={property.id} property={property} onFavorite={toggleFavorite} favorited={favorites.includes(property.id)} showShare />
              ))}
            </div>
          </div>
        </div>

        <div className="HowItWorks bg-white mt-40 p-18">
          <div className="Heading mb-16 text-center">
            <h1 className="text-4xl font-bold">How RentNest Works</h1>
            <p className="text-[#717171]">Three simple steps to your perfect stay or successful rental</p>
          </div>
          <div className="ml-[15%] mr-[15%] flex justify-between">
            <div className="box bg-[#f5f3ff] w-[30%] p-9 rounded-2xl shadow-md hover:shadow-xl">
              <div className="icon w-16 h-16 rounded-2xl bg-linear-to-br from-[#673cc8] via-[#7144e4] to-[#7648ef] shadow-lg flex items-center justify-center m-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key w-7 h-7 text-white" aria-hidden="true">
                  <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" /><path d="m21 2-9.6 9.6" /><circle cx="7.5" cy="15.5" r="5.5" />
                </svg>
              </div>
              <div className="title text-center flex flex-col gap-3.5 mt-3.5">
                <h2 className="text-2xl font-semibold">Browse &amp; Discover</h2>
                <p className="text-[#717171]">Explore thousands of verified properties with rich details, high-quality photos, and honest reviews from real tenants.</p>
              </div>
            </div>
            <div className="box bg-[#f5f3ff] w-[30%] p-9 rounded-2xl shadow-md hover:shadow-xl">
              <div className="icon w-16 h-16 rounded-2xl bg-linear-to-br from-[#673cc8] via-[#7144e4] to-[#7648ef] shadow-lg flex items-center justify-center m-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar w-7 h-7 text-white" aria-hidden="true">
                  <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
                </svg>
              </div>
              <div className="title text-center flex flex-col gap-3.5 mt-3.5">
                <h2 className="text-2xl font-semibold">Book Your Stay</h2>
                <p className="text-[#717171]">Simple booking process with instant confirmation, flexible cancellation policies, and secure payment processing.</p>
              </div>
            </div>
            <div className="box bg-[#f5f3ff] w-[30%] p-9 rounded-2xl shadow-md hover:shadow-xl">
              <div className="icon w-16 h-16 rounded-2xl bg-linear-to-br from-[#673cc8] via-[#7144e4] to-[#7648ef] shadow-lg flex items-center justify-center m-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key w-7 h-7 text-white" aria-hidden="true">
                  <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" /><path d="m21 2-9.6 9.6" /><circle cx="7.5" cy="15.5" r="5.5" />
                </svg>
              </div>
              <div className="title text-center flex flex-col gap-3.5 mt-3.5">
                <h2 className="text-2xl font-semibold">Move In &amp; Enjoy</h2>
                <p className="text-[#717171]">Seamless move-in experience with landlord communication tools, digital lease signing, and 24/7 support.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="PopularCities mt-40 ml-[15%] mr-[15%]">
          <div className="Heading mb-16 text-center">
            <h1 className="text-4xl font-bold">Popular Cities</h1>
            <p className="text-[#717171]">Explore properties in top destinations</p>
          </div>
          <div className="cities flex justify-between">
            <div className="group cityCard relative w-70 h-86 rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <img src="/assets/kathmandu.jpg" alt="" className="cityImg w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"></div>
              <div className="text absolute text-white left-5 bottom-5.25">
                <h2 className="font-bold text-2xl">Kathmandu</h2>
                <p className="text-[#dadada]">343 Properties</p>
              </div>
            </div>
            <div className="group cityCard relative w-70 h-86 rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <img src="/assets/pokhara.jpg" alt="" className="cityImg w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"></div>
              <div className="text absolute text-white left-5 bottom-5.25">
                <h2 className="font-bold text-2xl">Pokhara</h2>
                <p className="text-[#dadada]">256 Properties</p>
              </div>
            </div>
            <div className="group cityCard relative w-70 h-86 rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <img src="/assets/lalitpur.jpg" alt="" className="cityImg w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"></div>
              <div className="text absolute text-white left-5 bottom-5.25">
                <h2 className="font-bold text-2xl">Lalitpur</h2>
                <p className="text-[#dadada]">100 Properties</p>
              </div>
            </div>
            <div className="group cityCard relative w-70 h-86 rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <img src="/assets/bhaktapur.jpg" alt="" className="cityImg w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"></div>
              <div className="text absolute text-white left-5 bottom-5.25">
                <h2 className="font-bold text-2xl">Bhaktapur</h2>
                <p className="text-[#dadada]">203 Properties</p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer mt-40">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
