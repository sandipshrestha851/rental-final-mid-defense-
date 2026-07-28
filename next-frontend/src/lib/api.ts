import type {
  Booking,
  BookingPayload,
  BookingStats,
  BookingTrend,
  DashboardSummary,
  LoginPayload,
  Message,
  Notification,
  OccupancyData,
  Property,
  PropertyAnalytics,
  PropertyImage,
  PropertyStatus,
  RegisterPayload,
  Review,
  SearchResults,
  ShareInfo,
  User,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isStateChanging = options.method && !["GET", "HEAD", "OPTIONS"].includes(options.method);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (isStateChanging) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers["X-CSRF-Token"] = csrf;
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
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

interface PropertyRow {
  id: string;
  landlord_id: number;
  title: string;
  description: string | null;
  location: string;
  category: string | null;
  property_type: string | null;
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
  review_count: number;
  amenities: string | null;
  photos: string | null;
  created_at: string;
  landlord_name?: string;
  landlord_email?: string;
  images?: PropertyImage[];
}

function toProperty(row: PropertyRow): Property {
  let amenities: string[] | undefined;
  try { amenities = row.amenities ? JSON.parse(row.amenities) : undefined; } catch { amenities = undefined; }
  let photos: string[] | undefined;
  try { photos = row.photos ? JSON.parse(row.photos) : undefined; } catch { photos = undefined; }

  return {
    id: row.id,
    title: row.title,
    location: row.location,
    imageUrl: row.image_url && !row.image_url.startsWith('blob:')
      ? (row.image_url.startsWith('/') ? `${API_URL}${row.image_url}` : row.image_url)
      : "",
    status: row.status as Property["status"],
    beds: row.beds,
    baths: row.baths,
    rating: Number(row.rating),
    price: Number(row.price),
    bookings: row.bookings,
    reviewCount: row.review_count,
    description: row.description || undefined,
    category: (row.category as Property["category"]) || undefined,
    propertyType: (row.property_type as Property["propertyType"]) || undefined,
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
    images: row.images || undefined,
  };
}

function toPropertyRow(p: Partial<Property> & { landlord_id: number }) {
  const sanitizeUrl = (u: string) => u && !u.startsWith('blob:') ? u : null;
  const sanitizePhotos = (photos: string[]) => {
    if (!photos || photos.length === 0) return null;
    const clean = photos.filter(p => p && !p.startsWith('blob:'));
    return clean.length > 0 ? JSON.stringify(clean) : null;
  };
  return {
    id: p.id,
    landlord_id: p.landlord_id,
    title: p.title,
    description: p.description || null,
    location: p.location,
    category: p.category || null,
    property_type: p.propertyType || null,
    address: p.address || null,
    city: p.city || null,
    state: p.state || null,
    zip_code: p.zipCode || null,
    country: p.country || null,
    image_url: sanitizeUrl(p.imageUrl || ""),
    status: p.status || "Pending",
    beds: p.beds ?? 1,
    baths: p.baths ?? 1,
    guests: p.guests ?? null,
    sqft: p.sqft ?? null,
    rating: p.rating ?? 0,
    price: p.price ?? 0,
    bookings: p.bookings ?? 0,
    amenities: p.amenities ? JSON.stringify(p.amenities) : null,
    photos: sanitizePhotos(p.photos || []),
  };
}

export const api = {
  register(payload: RegisterPayload): Promise<{ message: string }> {
    return request("/api/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload): Promise<{ user: { id: number; full_name: string; email: string; role?: string | null } }> {
    return request("/api/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  adminLogin(payload: { username: string; password: string }): Promise<{ user: { id: number; full_name: string; email: string; role?: string | null } }> {
    return request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getUsers(): Promise<User[]> {
    return request<User[]>("/api/users");
  },

  getMessages(otherUserId: number): Promise<Message[]> {
    return request<Message[]>(`/api/messages/${otherUserId}`);
  },

  async getMyProperties(): Promise<Property[]> {
    const rows = await request<PropertyRow[]>("/api/properties");
    return rows.map(toProperty);
  },

  async getAllProperties(): Promise<Property[]> {
    const rows = await request<PropertyRow[]>("/api/admin/properties");
    return rows.map(toProperty);
  },

  async getActiveProperties(): Promise<Property[]> {
    const rows = await request<PropertyRow[]>("/api/properties/active");
    return rows.map(toProperty);
  },

  async getPropertyById(id: string): Promise<Property> {
    const row = await request<PropertyRow>(`/api/properties/active/${id}`);
    return toProperty(row);
  },

  async getLandlordPropertyById(id: string): Promise<Property> {
    const row = await request<PropertyRow>(`/api/properties/${id}`);
    return toProperty(row);
  },

  async createProperty(property: Property): Promise<Property> {
    const landlord_id = property.landlordId ?? 0;
    const row = await request<PropertyRow>("/api/properties", {
      method: "POST",
      body: JSON.stringify(toPropertyRow({ ...property, landlord_id })),
    });
    return toProperty(row);
  },

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const landlord_id = property.landlordId ?? 0;
    const row = await request<PropertyRow>(`/api/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(toPropertyRow({ ...property, landlord_id })),
    });
    return toProperty(row);
  },

  async setPropertyStatus(
    property: Property,
    status: PropertyStatus
  ): Promise<Property> {
    const row = await request<PropertyRow>(`/api/admin/properties/${property.id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return toProperty(row);
  },

  async deleteProperty(id: string): Promise<void> {
    await request(`/api/properties/${id}`, {
      method: "DELETE",
    });
  },

  async createBooking(payload: BookingPayload): Promise<{ message: string; bookingId: number; booking: Booking }> {
    return request<{ message: string; bookingId: number; booking: Booking }>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getBookingById(id: string | number): Promise<Booking> {
    return request<Booking>(`/api/bookings/${id}`);
  },

  getBookingsByGuest(guestId: number, status?: string): Promise<Booking[]> {
    const params = status ? `?status=${status}` : '';
    return request<Booking[]>(`/api/bookings/guest/${guestId}${params}`);
  },

  getLandlordBookings(status?: string): Promise<Booking[]> {
    const params = status ? `?status=${status}` : '';
    return request<Booking[]>(`/api/bookings/landlord${params}`);
  },

  approveBooking(id: number): Promise<{ message: string; booking: Booking }> {
    return request<{ message: string; booking: Booking }>(`/api/bookings/${id}/approve`, { method: 'PUT' });
  },

  rejectBooking(id: number, reason?: string): Promise<{ message: string; booking: Booking }> {
    return request<{ message: string; booking: Booking }>(`/api/bookings/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  cancelBooking(id: number, reason?: string): Promise<{ message: string; booking: Booking }> {
    return request<{ message: string; booking: Booking }>(`/api/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  completeBooking(id: number): Promise<{ message: string; booking: Booking }> {
    return request<{ message: string; booking: Booking }>(`/api/bookings/${id}/complete`, { method: 'PUT' });
  },

  checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<{ available: boolean }> {
    return request<{ available: boolean }>(`/api/bookings/check-availability?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}`);
  },

  getUnavailableDates(propertyId: string): Promise<{ start: string; end: string }[]> {
    return request<{ start: string; end: string }[]>(`/api/bookings/unavailable-dates/${propertyId}`);
  },

  getBookingHistory(id: number): Promise<{ id: number; status: string; changedBy: number; note: string; createdAt: string }[]> {
    return request(`/api/bookings/${id}/history`);
  },

  getBookingStats(): Promise<BookingStats> {
    return request<BookingStats>('/api/bookings/stats');
  },

  getTodayCheckIns(): Promise<Booking[]> {
    return request<Booking[]>('/api/bookings/today-checkins');
  },

  getTodayCheckOuts(): Promise<Booking[]> {
    return request<Booking[]>('/api/bookings/today-checkouts');
  },

  getCurrentGuests(): Promise<Booking[]> {
    return request<Booking[]>('/api/bookings/current-guests');
  },

  getRecentActivity(): Promise<Booking[]> {
    return request<Booking[]>('/api/bookings/recent-activity');
  },

  getBookingReceiptUrl(id: number): string {
    return `${API_URL}/api/bookings/${id}/receipt`;
  },

  getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return request<{ notifications: Notification[]; unreadCount: number }>('/api/notifications');
  },

  markNotificationRead(id: number): Promise<void> {
    return request(`/api/notifications/${id}/read`, { method: 'PUT' });
  },

  markAllNotificationsRead(): Promise<void> {
    return request('/api/notifications/read-all', { method: 'PUT' });
  },

  getMe(): Promise<{ user: { id: number; full_name: string; email: string; role?: string | null; created_at?: string } }> {
    return request("/api/auth/me");
  },

  async refreshToken(): Promise<void> {
    await request("/api/auth/refresh", { method: "POST" });
  },

  async logout(): Promise<void> {
    await request("/api/auth/logout", { method: "POST" });
  },

  async searchProperties(params: Record<string, string | number | string[] | undefined>): Promise<SearchResults> {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        if (Array.isArray(v)) {
          v.forEach(item => q.append(k, String(item)));
        } else {
          q.set(k, String(v));
        }
      }
    }
    const qs = q.toString();
    const data = await request<{ properties: PropertyRow[]; total: number; page: number; pageSize: number; totalPages: number }>(
      `/api/properties/search${qs ? '?' + qs : ''}`
    );
    return { ...data, properties: data.properties.map(toProperty) };
  },

  async getSimilarProperties(id: string, limit?: number): Promise<Property[]> {
    const rows = await request<PropertyRow[]>(`/api/properties/active/${id}/similar${limit ? `?limit=${limit}` : ''}`);
    return rows.map(toProperty);
  },

  async getShareInfo(id: string): Promise<ShareInfo> {
    return request<ShareInfo>(`/api/properties/active/${id}/share`);
  },

  async getPropertyImages(id: string): Promise<PropertyImage[]> {
    return request<PropertyImage[]>(`/api/properties/active/${id}/images`);
  },

  async uploadPropertyImages(id: string, files: File[]): Promise<{ message: string; images: PropertyImage[] }> {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    const res = await fetch(`${API_URL}/api/properties/${id}/images`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': getCsrfToken() },
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text();
      let msg = `Upload failed with status ${res.status}`;
      try { const d = JSON.parse(text); if (d.message) msg = d.message; } catch { if (text) msg = text; }
      console.error('Image upload error:', msg);
      throw new ApiError(msg, res.status);
    }
    return res.json();
  },

  async deletePropertyImage(imageId: number): Promise<void> {
    await request(`/api/properties/images/${imageId}`, { method: 'DELETE' });
  },

  async reorderPropertyImages(propertyId: string, imageIds: number[]): Promise<{ message: string; images: PropertyImage[] }> {
    return request(`/api/properties/${propertyId}/images/order`, {
      method: 'PUT',
      body: JSON.stringify({ imageIds }),
    });
  },

  async updatePropertyStatus(id: string, status: PropertyStatus): Promise<Property> {
    const row = await request<PropertyRow>(`/api/properties/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return toProperty(row);
  },

  async getWishlist(): Promise<Property[]> {
    const rows = await request<PropertyRow[]>('/api/wishlist');
    return rows.map(toProperty);
  },

  async getWishlistIds(): Promise<string[]> {
    const data = await request<{ wishlistedIds: string[] }>('/api/wishlist/ids');
    return data.wishlistedIds;
  },

  async addToWishlist(propertyId: string): Promise<void> {
    await request('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  },

  async removeFromWishlist(propertyId: string): Promise<void> {
    await request(`/api/wishlist/${propertyId}`, { method: 'DELETE' });
  },

  async getRecentlyViewed(): Promise<Property[]> {
    const rows = await request<PropertyRow[]>('/api/recently-viewed');
    return rows.map(toProperty);
  },

  async trackRecentlyViewed(propertyId: string): Promise<void> {
    await request(`/api/recently-viewed/${propertyId}`, { method: 'POST' });
  },

  async trackPropertyView(propertyId: string): Promise<void> {
    await request(`/api/properties/${propertyId}/view`, { method: 'POST' });
  },

  getDashboardSummary(): Promise<DashboardSummary> {
    return request<DashboardSummary>('/api/landlord/dashboard');
  },

  getLandlordRevenue(): Promise<{ totalRevenue: number; ytdRevenue: number; averageBookingValue: number; monthly: { month: string; revenue: number; bookings: number }[] }> {
    return request('/api/landlord/revenue');
  },

  getLandlordOccupancy(): Promise<OccupancyData> {
    return request<OccupancyData>('/api/landlord/occupancy');
  },

  getLandlordBookingStats(): Promise<{ total: number; pending: number; confirmed: number; completed: number; cancelled: number; rejected: number }> {
    return request('/api/landlord/booking-stats');
  },

  getPropertyAnalytics(): Promise<PropertyAnalytics> {
    return request<PropertyAnalytics>('/api/landlord/property-analytics');
  },

  getBookingTrends(period?: string, startDate?: string, endDate?: string): Promise<BookingTrend[]> {
    const params = new URLSearchParams();
    if (period) params.set('period', period);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const qs = params.toString();
    return request<BookingTrend[]>(`/api/landlord/booking-trends${qs ? '?' + qs : ''}`);
  },

  getIncomeCharts(): Promise<{ monthlyRevenue: { month: string; revenue: number; bookings: number }[]; occupancyTrend: OccupancyData }> {
    return request('/api/landlord/income-charts');
  },

  getLandlordReviews(params?: { sortBy?: string; sortOrder?: string; search?: string; rating?: number }): Promise<Review[]> {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return request<Review[]>(`/api/reviews/landlord${qs}`);
  },

  getPropertyReviews(propertyId: string): Promise<Review[]> {
    return request<Review[]>(`/api/reviews/property/${propertyId}`);
  },

  createReview(propertyId: string, rating: number, comment: string): Promise<{ id: number; message: string }> {
    return request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ propertyId, rating, comment }),
    });
  },

  updateReview(reviewId: number, rating: number, comment: string): Promise<{ message: string }> {
    return request(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, comment }),
    });
  },

  deleteReview(reviewId: number): Promise<{ message: string }> {
    return request(`/api/reviews/${reviewId}`, { method: 'DELETE' });
  },

  createReviewReply(reviewId: number, reply: string): Promise<{ id: number; message: string }> {
    return request(`/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    });
  },

  updateReviewReply(replyId: number, reply: string): Promise<{ message: string }> {
    return request(`/api/reviews/reply/${replyId}`, {
      method: 'PUT',
      body: JSON.stringify({ reply }),
    });
  },

  deleteReviewReply(replyId: number): Promise<{ message: string }> {
    return request(`/api/reviews/reply/${replyId}`, { method: 'DELETE' });
  },
};
