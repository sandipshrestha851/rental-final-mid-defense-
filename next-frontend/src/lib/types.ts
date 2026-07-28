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

/** The minimal user object returned after login. */
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
  user: AuthUser;
  token?: string;
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

export interface PropertyImage {
  id: number;
  property_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

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
  reviewCount: number;
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
  landlordId?: number;
  landlordName?: string;
  landlordEmail?: string;
  createdAt?: string;
  images?: PropertyImage[];
}

export interface SearchResults {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ShareInfo {
  url: string;
  title: string;
  description: string;
  image: string;
  price: number;
  location: string;
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
  photoFiles: File[]; // actual File objects for upload
}

export interface BookingPayload {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  specialRequests?: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected"
  | "cancelled_by_tenant"
  | "cancelled_by_landlord"
  | "expired";

export interface BookingHistoryEntry {
  id: number;
  status: string;
  changedBy: number | null;
  note: string | null;
  createdAt: string;
}

export interface Booking {
  id: number;
  property_id: string;
  guest_id: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  specialRequests: string | null;
  created_at: string;
  propertyName: string;
  imageUrl: string | null;
  location: string;
  price: number | null;
  rating: number | null;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  landlordId?: number | null;
  history?: BookingHistoryEntry[];
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  currentGuests: number;
  revenue: number;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  related_id: number | null;
  is_read: number;
  created_at: string;
}

export interface Review {
  id: number;
  propertyId: string;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  guestName: string;
  propertyTitle: string;
  reply: ReviewReply | null;
}

export interface ReviewReply {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rejectedBookings: number;
  totalRevenue: number;
  ytdRevenue: number;
  monthlyEarnings: { month: string; revenue: number; bookings: number }[];
  averageBookingValue: number;
  overallOccupancyRate: number;
  activeListings: number;
  totalViews: number;
}

export interface PropertyAnalytics {
  totalViews: number;
  mostViewed: { id: string; title: string; views: number } | null;
  leastViewed: { id: string; title: string; views: number } | null;
  properties: { id: string; title: string; views: number; bookings: number }[];
}

export interface BookingTrend {
  label: string;
  bookings: number;
  revenue: number;
}

export interface OccupancyData {
  overallOccupancyRate: number;
  totalOccupiedDays: number;
  totalAvailableDays: number;
  perProperty: { propertyId: string; title: string; occupiedDays: number; availableDays: number; occupancyRate: number }[];
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
  photoFiles: [],
};
