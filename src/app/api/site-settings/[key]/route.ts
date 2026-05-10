import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Use internal URL so the auth check always hits NestJS via localhost,
// not the public IP (which may be unreachable from inside the EC2 server).
const API_BASE = (process.env.API_INTERNAL_URL ?? "http://localhost:4000") + "/api";

async function isSuperAdmin(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: auth },
    });
    if (!res.ok) return false;
    const user = (await res.json()) as { role?: string };
    return user.role === "SUPER_ADMIN";
  } catch {
    return false;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await isSuperAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key } = await params;
  const body = (await req.json()) as { value: unknown };
  try {
    const row = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: body.value as never },
      create: { key, value: body.value as never },
    });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
