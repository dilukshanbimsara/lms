import type { Metadata } from "next";
import HeroCarousel from "@/components/home/HeroCarousel";
import AboutSection from "@/components/home/AboutSection";
import type { ApiBanner } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { AboutContent } from "@/types/admin";
import { DEFAULT_ABOUT } from "@/types/admin";

export const dynamic = "force-dynamic";

async function getActiveBanners(): Promise<ApiBanner[]> {
  try {
    const rows = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((b) => ({
      id: b.id,
      title: b.title,
      imageUrl: b.imageUrl,
      isActive: b.isActive,
      sortOrder: b.sortOrder,
      createdAt: b.createdAt.toISOString(),
    }));
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
