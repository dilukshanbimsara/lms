"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types/admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }
    if (user && !allowedRoles.includes(user.role)) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated) return null;
  if (user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
