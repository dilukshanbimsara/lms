"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { NavItem } from "@/types";
import type { FooterTeacher } from "@/types/admin";

interface PublicChromeProps {
  children: React.ReactNode;
  navItems: NavItem[];
  siteName: string;
  siteTagline: string;
  footerTeacher: FooterTeacher;
}

export default function PublicChrome({
  children,
  navItems,
  siteName,
  siteTagline,
  footerTeacher,
}: PublicChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar navItems={navItems} siteName={siteName} />
      <main className="flex-1">{children}</main>
      <Footer
        siteName={siteName}
        siteTagline={siteTagline}
        navItems={navItems}
        teacher={footerTeacher}
      />
    </>
  );
}
