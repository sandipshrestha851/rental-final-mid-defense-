// Thin, typed wrapper around the backend REST API.
// Keeps all fetch logic + error handling in one place so components stay clean.

import type {
  LoginPayload,
  LoginResponse,
  Message,
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
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // Some endpoints (or errors) may not return JSON — guard against that.
  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      (data as { message?: string })?.message ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

/** Attach the Bearer token header for authenticated requests. */
function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
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
};
