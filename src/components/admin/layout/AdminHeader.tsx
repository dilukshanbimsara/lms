"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const ROUTE_LABELS: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/banners": "Banner Management",
  "/admin/institutions": "Institution Management",
  "/admin/about": "About Section",
  "/admin/theme": "Theme Settings",
  "/admin/teachers": "Teacher",
  "/admin/learning-centre": "Learning Centre",
  "/admin/profile": "My Profile",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const pageTitle = ROUTE_LABELS[pathname] ?? "Admin";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <p className="text-sm text-gray-400">Admin Panel</p>
        <h2 className="text-base font-semibold text-gray-900 leading-tight">{pageTitle}</h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.name}</span>
        <span
          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
            user?.role === "SUPER_ADMIN"
              ? "bg-primary/10 text-primary"
              : "bg-green-100 text-green-700"
          }`}
        >
          {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Teacher"}
        </span>
      </div>
    </header>
  );
}
