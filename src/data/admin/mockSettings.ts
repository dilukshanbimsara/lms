import type { SiteSettings } from "@/types/admin";

export const defaultSettings: SiteSettings = {
  primaryHSL: { h: 215, s: 70, l: 25 },
  accentHSL: { h: 38, s: 95, l: 53 },
  navItems: [
    { href: "/", label: "Home", visible: true },
    { href: "/institutions", label: "Institutions", visible: true },
    { href: "/classes", label: "Classes", visible: true },
    { href: "/learning-centre", label: "Learning Centre", visible: true },
    { href: "/contact", label: "Contact", visible: true },
  ],
};
