import type { Metadata } from "next";
import HeroCarousel from "@/components/home/HeroCarousel";
import AboutSection from "@/components/home/AboutSection";
import type { ApiBanner } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { AboutContent } from "@/types/admin";
import { DEFAULT_ABOUT } from "@/types/admin";

export const dynamic = "force-dynamic";

// Always use the internal (localhost) URL so server-side fetches reach
// NestJS reliably regardless of how NEXT_PUBLIC_API_URL is configured.
const INTERNAL_API = (process.env.API_INTERNAL_URL ?? "http://localhost:4000") + "/api";

async function getActiveBanners(): Promise<ApiBanner[]> {
  try {
    const res = await fetch(`${INTERNAL_API}/banners-public`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json() as Promise<ApiBanner[]>;
  } catch {
    return [];
  }
}

async function getAboutContent(): Promise<AboutContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "aboutContent" } });
    if (row?.value) return row.value as unknown as AboutContent;
  } catch {
    // DB unavailable
  }
  return DEFAULT_ABOUT;
}

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutContent();
  return {
    title: `TutioLMS — Expert O/L & A/L Tuition by ${about.teacherName}`,
    description: `Professional ${about.subject} tuition classes for O/L and A/L students. Hall, Group, Paper, Revision and Online classes available.`,
  };
}

export default async function HomePage() {
  const [activebanners, aboutContent] = await Promise.all([
    getActiveBanners(),
    getAboutContent(),
  ]);

  return (
    <>
      <HeroCarousel banners={activebanners} />
      <AboutSection content={aboutContent} />
    </>
  );
}
