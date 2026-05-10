import type { Metadata } from "next";
import "./globals.css";
import PublicChrome from "@/components/layout/PublicChrome";
import { navItems as staticNavItems } from "@/data/navigation";
import { personalContact } from "@/data/contact";
import type { NavItem } from "@/types";
import type { NavToggle, HslColor, FooterTeacher, SiteConfig, AboutContent } from "@/types/admin";
import { DEFAULT_SITE_CONFIG, DEFAULT_ABOUT } from "@/types/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: {
    default: "TutioLMS",
    template: "%s | TutioLMS",
  },
  description:
    "Professional O/L and A/L tuition classes. Hall, Group, Paper, Revision and Online classes available.",
  keywords: [
    "tuition",
    "mathematics",
    "physics",
    "O/L",
    "A/L",
    "Sri Lanka",
    "online classes",
  ],
};

// ─── Default theme colours ─────────────────────────────────────────────────────
const DEFAULT_PRIMARY: HslColor = { h: 215, s: 70, l: 25 };
const DEFAULT_ACCENT: HslColor = { h: 38, s: 95, l: 53 };

// ─── Server-side data fetchers ─────────────────────────────────────────────────

async function getVisibleNavItems(): Promise<NavItem[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "navItems" },
    });
    if (setting) {
      const stored = setting.value as unknown as NavToggle[];
      return stored
        .filter((item) => item.visible)
        .map(({ label, href }) => ({ label, href }));
    }
  } catch {
    // DB unavailable — fall back to static list
  }
  return staticNavItems;
}

async function getThemeColors(): Promise<{ primaryHSL: HslColor; accentHSL: HslColor }> {
  try {
    const [primaryRow, accentRow] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "primaryHSL" } }),
      prisma.siteSetting.findUnique({ where: { key: "accentHSL" } }),
    ]);
    return {
      primaryHSL: (primaryRow?.value as unknown as HslColor) ?? DEFAULT_PRIMARY,
      accentHSL: (accentRow?.value as unknown as HslColor) ?? DEFAULT_ACCENT,
    };
  } catch {
    return { primaryHSL: DEFAULT_PRIMARY, accentHSL: DEFAULT_ACCENT };
  }
}

async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "siteConfig" } });
    if (row?.value) return row.value as unknown as SiteConfig;
  } catch {
    // DB unavailable
  }
  return DEFAULT_SITE_CONFIG;
}

async function getFooterTeacher(): Promise<FooterTeacher> {
  const dummy: FooterTeacher = {
    name: DEFAULT_ABOUT.teacherName,
    subject: DEFAULT_ABOUT.subject,
    phone: personalContact.phone[0],
    email: personalContact.email || "info@tutiolms.lk",
    address: DEFAULT_ABOUT.address,
  };

  try {
    const teacher = await prisma.user.findFirst({
      where: { role: "TEACHER" },
      select: { name: true, phone: true, email: true },
    });

    const aboutRow = await prisma.siteSetting.findUnique({ where: { key: "aboutContent" } });
    const about = (aboutRow?.value as unknown as AboutContent) ?? DEFAULT_ABOUT;

    if (!teacher) {
      return { ...dummy, subject: about.subject ?? dummy.subject, address: about.address ?? dummy.address };
    }

    return {
      name: teacher.name,
      subject: about.subject ?? DEFAULT_ABOUT.subject,
      phone: teacher.phone ?? dummy.phone,
      email: teacher.email,
      address: about.address ?? DEFAULT_ABOUT.address,
    };
  } catch {
    return dummy;
  }
}

function buildThemeCSS(primaryHSL: HslColor, accentHSL: HslColor): string {
  const { h, s, l } = primaryHSL;
  const lightL = Math.min(l + 13, 95);
  const darkL = Math.max(l - 10, 5);
  return (
    `:root{` +
    `--color-primary:${h} ${s}% ${l}%;` +
    `--color-primary-light:${h} ${s}% ${lightL}%;` +
    `--color-primary-dark:${h} ${s}% ${darkL}%;` +
    `--color-accent:${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%;` +
    `}`
  );
}

// ─── Root layout ───────────────────────────────────────────────────────────────

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navItems, { primaryHSL, accentHSL }, siteConfig, footerTeacher] =
    await Promise.all([
      getVisibleNavItems(),
      getThemeColors(),
      getSiteConfig(),
      getFooterTeacher(),
    ]);

  const themeCSS = buildThemeCSS(primaryHSL, accentHSL);

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <PublicChrome
          navItems={navItems}
          siteName={siteConfig.siteName}
          siteTagline={siteConfig.siteTagline}
          footerTeacher={footerTeacher}
        >
          {children}
        </PublicChrome>
      </body>
    </html>
  );
}
