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
