"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser, AuthState } from "@/types/admin";
import * as api from "@/lib/api";

const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  updateProfile: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored) as AdminUser);
      } catch {
        localStorage.removeItem("admin_user");
      }
    }
    setMounted(true);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { access_token, user: apiUser } = await api.auth.login(email, password);
      api.setToken(access_token);
      setUser(apiUser);
      localStorage.setItem("admin_user", JSON.stringify(apiUser));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    api.clearToken();
    localStorage.removeItem("admin_user");
    router.push("/admin");
  };

  const updateProfile = async (data: Partial<AdminUser>): Promise<void> => {
    if (!user) return;
    try {
      const updated = await api.users.updateMe({
        name: data.name,
        phone: data.phone,
        imageUrl: data.imageUrl,
      });
      setUser(updated);
      localStorage.setItem("admin_user", JSON.stringify(updated));
    } catch {
      // Optimistic local update as fallback
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("admin_user", JSON.stringify(updated));
    }
  };

  if (!mounted) return null;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
