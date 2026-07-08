import React from "react";
import PropertyCard from "../ui/PropertyCard";

const CardList = () => {
  return (
    <div className="PropertyContainer flex flex-wrap justify-between gap-8">
      <PropertyCard />
      <PropertyCard />
      <PropertyCard />
      <PropertyCard />
      <PropertyCard />
      <PropertyCard />
    </div>
  );
};

export default CardList;
