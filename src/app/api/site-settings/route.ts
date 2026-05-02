import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
