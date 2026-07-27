import React from "react";
import PropertyCard2 from "../ui/PropertyCard2";
import { mockProperties } from "../../data/mockProperties";
const CardList = () => {
  const active = mockProperties.filter((p) => p.status === "Active");

  return (
    <div className="PropertyContainer flex flex-wrap justify-between gap-8">
      {active.map((property) => (
        <PropertyCard2 key={property.id} property={property} />
      ))}
    </div>
  );
};

export default CardList;
