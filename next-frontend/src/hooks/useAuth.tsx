"use client";

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { AuthUser, LoginResponse } from "@/lib/types";
import { api } from "@/lib/api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    ready: false,
  });

  useEffect(() => {
    let cancelled = false;
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    api.getMe()
      .then((data) => {
        if (!cancelled) {
          setState({
            user: data.user as AuthUser,
            token: storedToken,
            ready: true,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ user: null, token: null, ready: true });
        }
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback((data: LoginResponse) => {
    if (typeof window !== "undefined" && data.token) {
      localStorage.setItem("token", data.token);
    }
    setState({ user: data.user, token: data.token || null, ready: true });
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    api.logout().catch(() => {});
    setState({ user: null, token: null, ready: true });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
