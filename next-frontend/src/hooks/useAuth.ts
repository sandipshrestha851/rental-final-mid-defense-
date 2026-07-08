"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthUser, LoginResponse } from "@/lib/types";

const TOKEN_KEY = "token";
const USER_KEY = "user";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  ready: boolean; // becomes true once we've read localStorage on the client
}

/**
 * Reads the persisted auth session from localStorage and exposes
 * login / logout helpers. `ready` guards against SSR hydration flashes.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    ready: false,
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const rawUser = localStorage.getItem(USER_KEY);
      const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
      setState({ token, user, ready: true });
    } catch {
      setState({ token: null, user: null, ready: true });
    }
  }, []);

  const login = useCallback((data: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setState({ token: data.token, user: data.user, ready: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ token: null, user: null, ready: true });
  }, []);

  return { ...state, login, logout };
}
