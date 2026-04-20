"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Image,
  Building2,
  Palette,
  UserCircle,
  BookOpen,
  LogOut,
  Info,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SUPER_ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Institutions", href: "/admin/institutions", icon: Building2 },
  { label: "About", href: "/admin/about", icon: Info },
  { label: "Theme", href: "/admin/theme", icon: Palette },
  { label: "Teacher", href: "/admin/teachers", icon: User },
  { label: "Profile", href: "/admin/profile", icon: UserCircle },
];

const TEACHER_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Learning Centre", href: "/admin/learning-centre", icon: BookOpen },
  { label: "Profile", href: "/admin/profile", icon: UserCircle },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = user?.role === "SUPER_ADMIN" ? SUPER_ADMIN_NAV : TEACHER_NAV;

  return (
    <div className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 bg-primary">
        <GraduationCap size={22} className="text-white" />
        <div>
          <p className="text-white font-bold text-sm leading-tight">TutioLMS</p>
          <p className="text-white/60 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
            {user?.name?.charAt(0) ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role === "SUPER_ADMIN" ? "Super Admin" : "Teacher"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}
