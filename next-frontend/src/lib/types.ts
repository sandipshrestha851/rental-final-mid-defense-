// // Shared domain types used across the chat + auth feature.

// /** A user as returned by the backend (safe fields only, no password). */
// export interface User {
//   id: number;
//   full_name: string;
//   email: string;
//   phone?: string | null;
//   gender?: string | null;
//   date_of_birth?: string | null;
//   bio?: string | null;
//   role?: string | null;
//   is_online?: boolean;
//   created_at?: string | null;
// }

// /** The minimal user object stored in localStorage after login. */
// export interface AuthUser {
//   id: number;
//   full_name: string;
//   email: string;
//   role?: string | null;
// }

// /** A single chat message between two users. */
// export interface Message {
//   id: number;
//   sender_id: number;
//   receiver_id: number;
//   message: string;
//   created_at: string;
// }

// /** Payload sent to POST /api/register. Only name/email/password are required. */
// export interface RegisterPayload {
//   full_name: string;
//   email: string;
//   password: string;
//   phone?: string;
//   gender?: string;
//   date_of_birth?: string;
//   bio?: string;
//   role?: string;
// }

// /** Payload sent to POST /api/login. */
// export interface LoginPayload {
//   email: string;
//   password: string;
// }

// /** Response returned by POST /api/login. */
// export interface LoginResponse {
//   token: string;
//   user: AuthUser;
// }


// export type PropertyStatus = "Active" | "Pending" | "Draft" | "Rejected";

// export type PropertyCategory =
//   | "Apartment"
//   | "House"
//   | "Villa"
//   | "Studio"
//   | "Condo"
//   | "Loft";

// export interface Property {
//   id: string;
//   title: string;
//   location: string;
//   imageUrl: string;
//   status: PropertyStatus;
//   beds: number;
//   baths: number;
//   rating: number;
//   price: number;
//   bookings: number;
//   // Optional extended fields, populated by the Add Property wizard.
//   description?: string;
//   category?: PropertyCategory;
//   address?: string;
//   city?: string;
//   state?: string;
//   zipCode?: string;
//   country?: string;
//   guests?: number;
//   sqft?: number;
//   amenities?: string[];
//   photos?: string[];
// }

// /** Shape collected by the Add Property wizard before it's turned into a Property. */
// export interface NewPropertyInput {
//   title: string;
//   description: string;
//   category: PropertyCategory | "";
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
//   beds: number;
//   baths: number;
//   guests: number;
//   sqft: number;
//   price: number;
//   amenities: string[];
//   photos: string[]; // object URLs / data URLs for preview
// }

// export const emptyNewProperty: NewPropertyInput = {
//   title: "",
//   description: "",
//   category: "",
//   address: "",
//   city: "",
//   state: "",
//   zipCode: "",
//   country: "",
//   beds: 1,
//   baths: 1,
//   guests: 2,
//   sqft: 0,
//   price: 0,
//   amenities: [],
//   photos: [],
// };

// Shared domain types used across the chat + auth feature.

/** A user as returned by the backend (safe fields only, no password). */
export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  bio?: string | null;
  role?: string | null;
  is_online?: boolean;
  created_at?: string | null;
}

/** The minimal user object stored in localStorage after login. */
export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role?: string | null;
}

/** A single chat message between two users. */
export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
}

/** Payload sent to POST /api/register. Only name/email/password are required. */
export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  bio?: string;
  role?: string;
}

/** Payload sent to POST /api/login. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Response returned by POST /api/login. */
export interface LoginResponse {
  token: string;
  user: AuthUser;
}


export type PropertyStatus = "Active" | "Pending" | "Draft" | "Rejected";

export type PropertyCategory =
  | "Apartment"
  | "House"
  | "Villa"
  | "Studio"
  | "Condo"
  | "Loft";

export type PropertyType =
  | "For Rent"
  | "For Sale"
  | "Lease";

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
  propertyType?: PropertyType;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  guests?: number;
  sqft?: number;
  amenities?: string[];
  photos?: string[];
  // Optional landlord info — only populated by admin-facing endpoints
  // (e.g. GET /api/admin/properties). Not present on the landlord's own
  // GET /api/properties response since they already know it's theirs.
  landlordId?: number;
  landlordName?: string;
  landlordEmail?: string;
  createdAt?: string;
}

/** Shape collected by the Add Property wizard before it's turned into a Property. */
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
