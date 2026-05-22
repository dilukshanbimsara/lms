"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User, Sparkles } from "lucide-react";
import { StudentAuthProvider, useStudentAuth } from "@/contexts/StudentAuthContext";

function NavTab({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function StudentShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useStudentAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Student portal sub-nav — sits below the public Navbar (rendered by PublicChrome) */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
          <NavTab href="/student/better-me" label="Better Me" icon={<Sparkles size={14} />} />
          <NavTab href="/student/profile"   label="Profile"   icon={<User size={14} />} />
        </div>
      </nav>

      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentAuthProvider>
      <StudentShell>{children}</StudentShell>
    </StudentAuthProvider>
  );
}
