export type PropertyStatus = "Active" | "Pending" | "Draft" | "Rejected";

export type PropertyCategory =
  | "Apartment"
  | "House"
  | "Villa"
  | "Studio"
  | "Condo"
  | "Loft";

export interface Property {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  status: PropertyStatus;
  beds: number;
  baths: number;
  rating: number;
  price: number;
  bookings: number;
  // Optional extended fields, populated by the Add Property wizard.
  description?: string;
  category?: PropertyCategory;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  guests?: number;
  sqft?: number;
  amenities?: string[];
  photos?: string[];
}

/** Shape collected by the Add Property wizard before it's turned into a Property. */
export type PropertyType =
  | "For Rent"
  | "For Sale"
  | "Lease";

export interface NewPropertyInput {
  title: string;
  description: string;
  category: PropertyCategory | "";
  propertyType: PropertyType | "";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  beds: number;
  baths: number;
  guests: number;
  sqft: number;
  price: number;
  amenities: string[];
  photos: string[]; // object URLs / data URLs for preview
}

export const emptyNewProperty: NewPropertyInput = {
  title: "",
  description: "",
  category: "",
  propertyType: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  beds: 1,
  baths: 1,
  guests: 2,
  sqft: 0,
  price: 0,
  amenities: [],
  photos: [],
};
