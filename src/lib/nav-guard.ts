import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function checkNavVisible(href: string): Promise<void> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "navItems" } });
    if (setting) {
      const stored = setting.value as unknown as Array<{ href: string; visible: boolean }>;
      const item = stored.find((i) => i.href === href);
      if (item && item.visible === false) notFound();
    }
  } catch {
    // DB unavailable — fail open
  }
}
