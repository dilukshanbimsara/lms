import Link from "next/link";
import { GraduationCap, Phone, Mail, MapPin, BookOpen } from "lucide-react";
import type { NavItem } from "@/types";
import type { FooterTeacher } from "@/types/admin";
import { DEFAULT_SITE_CONFIG, DEFAULT_ABOUT } from "@/types/admin";

interface FooterProps {
  siteName?: string;
  siteTagline?: string;
  navItems?: NavItem[];
  teacher?: FooterTeacher;
}

export default function Footer({
  siteName = DEFAULT_SITE_CONFIG.siteName,
  siteTagline = DEFAULT_SITE_CONFIG.siteTagline,
  navItems = [],
  teacher,
}: FooterProps) {
  const year = new Date().getFullYear();

  const displayName = teacher?.name ?? DEFAULT_ABOUT.teacherName;
  const displaySubject = teacher?.subject ?? DEFAULT_ABOUT.subject;
  const displayPhone = teacher?.phone ?? "";
  const displayEmail = teacher?.email ?? "";
  const displayAddress = teacher?.address ?? DEFAULT_ABOUT.address;

  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <GraduationCap className="w-7 h-7 text-accent" />
              <span>{siteName}</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">{siteTagline}</p>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <BookOpen className="w-4 h-4 text-accent shrink-0" />
              <span>{displaySubject}</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-accent mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Teacher / Contact */}
          <div>
            <h3 className="font-semibold text-accent mb-1">{displayName}</h3>
            <p className="text-white/50 text-xs mb-4">{displaySubject}</p>
            <ul className="space-y-3 text-sm text-white/70">
              {displayPhone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0 text-accent" />
                  <span>{displayPhone}</span>
                </li>
              )}
              {displayEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0 text-accent" />
                  <span>{displayEmail}</span>
                </li>
              )}
              {displayAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 shrink-0 text-accent mt-0.5" />
                  <span>{displayAddress}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center text-white/50 text-sm">
          © {year} {siteName} — {displayName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
