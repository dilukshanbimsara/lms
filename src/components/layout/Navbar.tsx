"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, GraduationCap, LogOut, User } from "lucide-react";
import type { NavItem } from "@/types";

interface NavbarProps {
  navItems: NavItem[];
  siteName?: string;
}

export default function Navbar({ navItems, siteName = "TutioLMS" }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [studentLoggedIn, setStudentLoggedIn] = useState(false);
  const [studentFirstName, setStudentFirstName] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const raw = localStorage.getItem("student_user");
    const token = localStorage.getItem("student_auth_token");
    if (raw && token) {
      try {
        const s = JSON.parse(raw) as { name?: string };
        setStudentLoggedIn(true);
        setStudentFirstName(s.name?.split(" ")[0] ?? "Student");
      } catch {
        setStudentLoggedIn(false);
      }
    } else {
      setStudentLoggedIn(false);
    }
  }, [pathname]);

  const handleStudentLogout = () => {
    localStorage.removeItem("student_user");
    localStorage.removeItem("student_auth_token");
    setStudentLoggedIn(false);
    window.location.href = "/login";
  };

  // For logged-in students: Home → Better Me → Profile → remaining nav items
  const displayItems: NavItem[] = studentLoggedIn
    ? [
        ...(navItems.length > 0 ? [navItems[0]] : []),   // Home first
        { label: "Better Me", href: "/student/better-me" },
        { label: "Profile", href: "/student/profile" },
        ...navItems.slice(1),                             // About, Classes, Results, Contact…
      ]
    : navItems.filter((item) => item.href !== "/learning-centre");

  const linkCls = (href: string) => {
    const isActive = pathname === href;
    return `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-primary text-white"
        : "text-gray-700 hover:bg-primary/10 hover:text-primary"
    }`;
  };

  const mobileLinkCls = (href: string) => {
    const isActive = pathname === href;
    return `block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-primary text-white"
        : "text-gray-700 hover:bg-primary/10 hover:text-primary"
    }`;
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-xl shrink-0"
          >
            <GraduationCap className="w-7 h-7" />
            <span>{siteName}</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {displayItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkCls(item.href)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop right: Login / Student chip + Logout */}
          <div className="hidden md:flex items-center gap-2">
            {studentLoggedIn ? (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-lg">
                  <User size={14} className="text-primary" />
                  <span className="text-sm font-medium text-primary">{studentFirstName}</span>
                </div>
                <button
                  onClick={handleStudentLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
                style={{ backgroundColor: "hsl(var(--color-accent))", color: "#fff" }}
              >
                Student Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col gap-1 pt-2 border-t border-gray-100">
            {displayItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={mobileLinkCls(item.href)}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-gray-100 mt-1">
              {studentLoggedIn ? (
                <button
                  onClick={handleStudentLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                  Logout ({studentFirstName})
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block px-4 py-2.5 text-sm font-semibold text-center text-white rounded-lg transition-colors"
                  style={{ backgroundColor: "hsl(var(--color-accent))" }}
                >
                  Student Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
