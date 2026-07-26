// // Thin, typed wrapper around the backend REST API.
// // Keeps all fetch logic + error handling in one place so components stay clean.

// import type {
//   LoginPayload,
//   LoginResponse,
//   Message,
//   Property,
//   RegisterPayload,
//   User,
// } from "./types";

// export const API_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// /** Error thrown when the API responds with a non-2xx status. */
// export class ApiError extends Error {
//   status: number;
//   constructor(message: string, status: number) {
//     super(message);
//     this.name = "ApiError";
//     this.status = status;
//   }
// }

// /** Core request helper: sends JSON, parses JSON, throws ApiError on failure. */
// async function request<T>(
//   path: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   let res: Response;
//   try {
//     res = await fetch(`${API_URL}${path}`, {
//       ...options,
//       headers: {
//         "Content-Type": "application/json",
//         ...(options.headers || {}),
//       },
//     });
//   } catch (err) {
//     throw new ApiError(
//       `Network error: ${err instanceof Error ? err.message : "Unknown"}`,
//       0
//     );
//   }

//   let data: unknown = null;
//   const text = await res.text();
//   if (text) {
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = text;
//     }
//   }

//   if (!res.ok) {
//     const message =
//       (data && typeof data === "object" && "message" in data
//         ? (data as { message?: string }).message
//         : null) ||
//       `Request failed with status ${res.status}`;
//     throw new ApiError(message, res.status);
//   }

//   if (!data) {
//     throw new ApiError("Empty response from server", res.status);
//   }

//   return data as T;
// }

// /** Attach the Bearer token header for authenticated requests. */
// function authHeaders(token: string): HeadersInit {
//   return { Authorization: `Bearer ${token}` };
// }

// /** Shape of a property row returned by the backend (snake_case). */
// interface PropertyRow {
//   id: string;
//   landlord_id: number;
//   title: string;
//   description: string | null;
//   location: string;
//   category: string | null;
//   address: string | null;
//   city: string | null;
//   state: string | null;
//   zip_code: string | null;
//   country: string | null;
//   image_url: string;
//   status: string;
//   beds: number;
//   baths: number;
//   guests: number | null;
//   sqft: number | null;
//   rating: number;
//   price: number;
//   bookings: number;
//   amenities: string | null;
//   photos: string | null;
//   created_at: string;
// }

// /** Convert a snake_case DB row to a camelCase Property. */
// function toProperty(row: PropertyRow): Property {
//   let amenities: string[] | undefined;
//   try { amenities = row.amenities ? JSON.parse(row.amenities) : undefined; } catch { amenities = undefined; }
//   let photos: string[] | undefined;
//   try { photos = row.photos ? JSON.parse(row.photos) : undefined; } catch { photos = undefined; }

//   return {
//     id: row.id,
//     title: row.title,
//     location: row.location,
//     imageUrl: row.image_url || "",
//     status: row.status as Property["status"],
//     beds: row.beds,
//     baths: row.baths,
//     rating: Number(row.rating),
//     price: Number(row.price),
//     bookings: row.bookings,
//     description: row.description || undefined,
//     category: (row.category as Property["category"]) || undefined,
//     address: row.address || undefined,
//     city: row.city || undefined,
//     state: row.state || undefined,
//     zipCode: row.zip_code || undefined,
//     country: row.country || undefined,
//     guests: row.guests ?? undefined,
//     sqft: row.sqft ?? undefined,
//     amenities,
//     photos,
//   };
// }

// /** Convert a camelCase Property (or partial) to snake_case for the API. */
// function toPropertyRow(p: Partial<Property> & { landlord_id: number }) {
//   return {
//     id: p.id,
//     landlord_id: p.landlord_id,
//     title: p.title,
//     description: p.description || null,
//     location: p.location,
//     category: p.category || null,
//     address: p.address || null,
//     city: p.city || null,
//     state: p.state || null,
//     zip_code: p.zipCode || null,
//     country: p.country || null,
//     image_url: p.imageUrl || "",
//     status: p.status || "Pending",
//     beds: p.beds ?? 1,
//     baths: p.baths ?? 1,
//     guests: p.guests ?? null,
//     sqft: p.sqft ?? null,
//     rating: p.rating ?? 0,
//     price: p.price ?? 0,
//     bookings: p.bookings ?? 0,
//     amenities: p.amenities ? JSON.stringify(p.amenities) : null,
//     photos: p.photos ? JSON.stringify(p.photos) : null,
//   };
// }

// export const api = {
//   register(payload: RegisterPayload): Promise<{ message: string }> {
//     return request("/api/register", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     });
//   },

//   login(payload: LoginPayload): Promise<LoginResponse> {
//     return request<LoginResponse>("/api/login", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     });
//   },

//   adminLogin(payload: { username: string; password: string }): Promise<LoginResponse> {
//     return request<LoginResponse>("/api/admin/login", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     });
//   },

//   getUsers(token: string): Promise<User[]> {
//     return request<User[]>("/api/users", {
//       headers: authHeaders(token),
//     });
//   },

//   getMessages(token: string, otherUserId: number): Promise<Message[]> {
//     return request<Message[]>(`/api/messages/${otherUserId}`, {
//       headers: authHeaders(token),
//     });
//   },

//   async getMyProperties(token: string): Promise<Property[]> {
//     const rows = await request<PropertyRow[]>("/api/properties", {
//       headers: authHeaders(token),
//     });
//     return rows.map(toProperty);
//   },

//   async createProperty(token: string, property: Property): Promise<Property> {
//     const landlord_id = 0;
//     const row = await request<PropertyRow>("/api/properties", {
//       method: "POST",
//       headers: authHeaders(token),
//       body: JSON.stringify(toPropertyRow({ ...property, landlord_id })),
//     });
//     return toProperty(row);
//   },

//   async updateProperty(token: string, id: string, property: Partial<Property>): Promise<Property> {
//     const landlord_id = 0;
//     const row = await request<PropertyRow>(`/api/properties/${id}`, {
//       method: "PUT",
//       headers: authHeaders(token),
//       body: JSON.stringify(toPropertyRow({ ...property, landlord_id })),
//     });
//     return toProperty(row);
//   },

//   async deleteProperty(token: string, id: string): Promise<void> {
//     await request(`/api/properties/${id}`, {
//       method: "DELETE",
//       headers: authHeaders(token),
//     });
//   },
// };


// Thin, typed wrapper around the backend REST API.
// Keeps all fetch logic + error handling in one place so components stay clean.

import type {
  LoginPayload,
  LoginResponse,
  Message,
  Property,
  PropertyStatus,
  RegisterPayload,
  User,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Error thrown when the API responds with a non-2xx status. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Core request helper: sends JSON, parses JSON, throws ApiError on failure. */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    throw new ApiError(
      `Network error: ${err instanceof Error ? err.message : "Unknown"}`,
      0
    );
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? (data as { message?: string }).message
        : null) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  if (!data) {
    throw new ApiError("Empty response from server", res.status);
  }

  return data as T;
}

/** Attach the Bearer token header for authenticated requests. */
function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** Shape of a property row returned by the backend (snake_case). */
interface PropertyRow {
  id: string;
  landlord_id: number;
  title: string;
  description: string | null;
  location: string;
  category: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  image_url: string;
  status: string;
  beds: number;
  baths: number;
  guests: number | null;
  sqft: number | null;
  rating: number;
  price: number;
  bookings: number;
  amenities: string | null;
  photos: string | null;
  created_at: string;
  // Only present on admin-facing endpoints (e.g. GET /api/admin/properties)
  // where the backend joins the landlord's user row in.
  landlord_name?: string;
  landlord_email?: string;
}

/** Convert a snake_case DB row to a camelCase Property. */
function toProperty(row: PropertyRow): Property {
  let amenities: string[] | undefined;
  try { amenities = row.amenities ? JSON.parse(row.amenities) : undefined; } catch { amenities = undefined; }
  let photos: string[] | undefined;
  try { photos = row.photos ? JSON.parse(row.photos) : undefined; } catch { photos = undefined; }

  return {
    id: row.id,
    title: row.title,
    location: row.location,
    imageUrl: row.image_url || "",
    status: row.status as Property["status"],
    beds: row.beds,
    baths: row.baths,
    rating: Number(row.rating),
    price: Number(row.price),
    bookings: row.bookings,
    description: row.description || undefined,
    category: (row.category as Property["category"]) || undefined,
    address: row.address || undefined,
    city: row.city || undefined,
    state: row.state || undefined,
    zipCode: row.zip_code || undefined,
    country: row.country || undefined,
    guests: row.guests ?? undefined,
    sqft: row.sqft ?? undefined,
    amenities,
    photos,
    landlordId: row.landlord_id,
    landlordName: row.landlord_name || undefined,
    landlordEmail: row.landlord_email || undefined,
    createdAt: row.created_at || undefined,
  };
}

/** Convert a camelCase Property (or partial) to snake_case for the API. */
function toPropertyRow(p: Partial<Property> & { landlord_id: number }) {
  return {
    id: p.id,
    landlord_id: p.landlord_id,
    title: p.title,
    description: p.description || null,
    location: p.location,
    category: p.category || null,
    address: p.address || null,
    city: p.city || null,
    state: p.state || null,
    zip_code: p.zipCode || null,
    country: p.country || null,
    image_url: p.imageUrl || "",
    status: p.status || "Pending",
    beds: p.beds ?? 1,
    baths: p.baths ?? 1,
    guests: p.guests ?? null,
    sqft: p.sqft ?? null,
    rating: p.rating ?? 0,
    price: p.price ?? 0,
    bookings: p.bookings ?? 0,
    amenities: p.amenities ? JSON.stringify(p.amenities) : null,
    photos: p.photos ? JSON.stringify(p.photos) : null,
  };
}

export const api = {
  register(payload: RegisterPayload): Promise<{ message: string }> {
    return request("/api/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload): Promise<LoginResponse> {
    return request<LoginResponse>("/api/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  adminLogin(payload: { username: string; password: string }): Promise<LoginResponse> {
    return request<LoginResponse>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getUsers(token: string): Promise<User[]> {
    return request<User[]>("/api/users", {
      headers: authHeaders(token),
    });
  },

  getMessages(token: string, otherUserId: number): Promise<Message[]> {
    return request<Message[]>(`/api/messages/${otherUserId}`, {
      headers: authHeaders(token),
    });
  },

  async getMyProperties(token: string): Promise<Property[]> {
    const rows = await request<PropertyRow[]>("/api/properties", {
      headers: authHeaders(token),
    });
    return rows.map(toProperty);
  },

  /**
   * Admin-only: fetch every property across all landlords, for the
   * property-approval queue. Expects the backend to expose this route
   * (not built yet at time of writing) returning the same row shape as
   * GET /api/properties, plus landlord_name / landlord_email so the
   * admin UI can show who submitted each listing.
   */
  async getAllProperties(token: string): Promise<Property[]> {
    const rows = await request<PropertyRow[]>("/api/admin/properties", {
      headers: authHeaders(token),
    });
    return rows.map(toProperty);
  },

  async createProperty(token: string, property: Property): Promise<Property> {
    const landlord_id = property.landlordId ?? 0;
    const row = await request<PropertyRow>("/api/properties", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(toPropertyRow({ ...property, landlord_id })),
    });
    return toProperty(row);
  },

  async updateProperty(token: string, id: string, property: Partial<Property>): Promise<Property> {
    // NOTE: this hits a PUT endpoint, which (per toPropertyRow's defaults)
    // expects the *full* property. Always pass a complete Property object
    // in `property` — a partial like { status: "Active" } will silently
    // reset beds/baths/price/etc. back to defaults on the backend.
    const landlord_id = property.landlordId ?? 0;
    const row = await request<PropertyRow>(`/api/properties/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(toPropertyRow({ ...property, landlord_id })),
    });
    return toProperty(row);
  },

  /**
   * Admin-only: flips a property's status without the landlord_id
   * ownership check that guards the landlord-facing PUT endpoint.
   * Only the `status` field is sent to the backend.
   */
  async setPropertyStatus(
    token: string,
    property: Property,
    status: PropertyStatus
  ): Promise<Property> {
    const row = await request<PropertyRow>(`/api/admin/properties/${property.id}/status`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    });
    return toProperty(row);
  },

  async deleteProperty(token: string, id: string): Promise<void> {
    await request(`/api/properties/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  },
};
