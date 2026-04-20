import type { Metadata } from "next";
import HeroCarousel from "@/components/home/HeroCarousel";
import AboutSection from "@/components/home/AboutSection";
import { publicBanners } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { AboutContent, HeroBackground } from "@/types/admin";
import { DEFAULT_ABOUT, DEFAULT_HERO_BG } from "@/types/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TutioLMS — Expert O/L & A/L Tuition by Mr. Kamal Perera",
  description:
    "Professional Mathematics and Physics tuition classes for O/L and A/L students. Hall, Group, Paper, Revision and Online classes available across Colombo, Kandy, and Gampaha.",
};

async function getAboutContent(): Promise<AboutContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "aboutContent" } });
    if (row?.value) return row.value as unknown as AboutContent;
  } catch {
    // DB unavailable
  }
  return DEFAULT_ABOUT;
}

async function getHeroBackground(): Promise<HeroBackground> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "heroBackground" } });
    if (row?.value) return row.value as unknown as HeroBackground;
  } catch {
    // DB unavailable
  }
  return DEFAULT_HERO_BG;
}

export default async function HomePage() {
  const [activebanners, aboutContent, heroBackground] = await Promise.all([
    publicBanners.list(),
    getAboutContent(),
    getHeroBackground(),
  ]);

  return (
    <>
      <HeroCarousel banners={activebanners} heroBackground={heroBackground} />
      <AboutSection content={aboutContent} />
    </>
  );
}
