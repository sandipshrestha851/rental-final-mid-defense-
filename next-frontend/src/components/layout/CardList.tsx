import React from "react";
import PropertyCard2 from "../ui/PropertyCard2";
import { mockProperties } from "../../data/mockProperties";

const CardList = () => {
  return (
    <div className="PropertyContainer flex flex-wrap justify-between gap-8">
      <PropertyCard2 />
      <PropertyCard2 />
      <PropertyCard2 />
      <PropertyCard2 />
      <PropertyCard2 />
      <PropertyCard2 />
    </div>
  );
};

export default CardList;
