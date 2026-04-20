import { PrismaClient, Role } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// Simple hash for seeding — replace with bcrypt in production
function hashPassword(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

async function main() {
  console.log("Seeding database...");

  // ─── Seed admin users ───────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@tutiolms.lk" },
    update: {},
    create: {
      email: "admin@tutiolms.lk",
      password: hashPassword("Admin@1234"),
      name: "Mr. Kamal Perera",
      phone: "+94 77 123 4567",
      role: Role.SUPER_ADMIN,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@tutiolms.lk" },
    update: {},
    create: {
      email: "teacher@tutiolms.lk",
      password: hashPassword("Teacher@1234"),
      name: "Ms. Niluka Fernando",
      phone: "+94 76 987 6543",
      role: Role.TEACHER,
    },
  });

  console.log(`Created users: ${superAdmin.email}, ${teacher.email}`);

  // ─── Seed banners ────────────────────────────────────────────
  await prisma.banner.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "2025 A/L Hall Classes Now Open",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "New Gampaha Branch — Enrolling Now",
        imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80",
        isActive: true,
        sortOrder: 2,
      },
      {
        title: "Online Classes via Zoom — All Levels",
        imageUrl: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=1200&q=80",
        isActive: false,
        sortOrder: 3,
      },
    ],
  });

  console.log("Created banners");

  // ─── Seed institutions ───────────────────────────────────────
  const colombo = await prisma.institution.upsert({
    where: { id: "inst-colombo" },
    update: {},
    create: {
      id: "inst-colombo",
      name: "Colombo Learning Hub",
      address: "45/B, Galle Road, Colombo 03",
      phone: "+94 11 234 5678",
      mapUrl: "https://maps.google.com/?q=Colombo+03",
      timetable: {
        create: [
          { day: "Monday",    time: "4:00 PM – 6:00 PM",   subject: "Combined Maths", level: "A/L" },
          { day: "Tuesday",   time: "4:00 PM – 6:00 PM",   subject: "Physics",        level: "A/L" },
          { day: "Wednesday", time: "4:00 PM – 6:00 PM",   subject: "Combined Maths", level: "A/L" },
          { day: "Thursday",  time: "4:00 PM – 6:00 PM",   subject: "Chemistry",      level: "A/L" },
          { day: "Saturday",  time: "8:00 AM – 11:00 AM",  subject: "Hall Class – Maths", level: "A/L" },
          { day: "Sunday",    time: "9:00 AM – 11:30 AM",  subject: "Paper Class",    level: "A/L" },
        ],
      },
    },
  });

  const kandy = await prisma.institution.upsert({
    where: { id: "inst-kandy" },
    update: {},
    create: {
      id: "inst-kandy",
      name: "Kandy Education Centre",
      address: "12, Peradeniya Road, Kandy",
      phone: "+94 81 222 3456",
      mapUrl: "https://maps.google.com/?q=Peradeniya+Road+Kandy",
      timetable: {
        create: [
          { day: "Monday",    time: "3:30 PM – 5:30 PM",  subject: "Mathematics", level: "O/L" },
          { day: "Wednesday", time: "3:30 PM – 5:30 PM",  subject: "Science",     level: "O/L" },
          { day: "Friday",    time: "3:30 PM – 5:30 PM",  subject: "Mathematics", level: "O/L" },
          { day: "Saturday",  time: "7:30 AM – 10:30 AM", subject: "Hall Class – Maths", level: "O/L" },
          { day: "Sunday",    time: "10:00 AM – 12:00 PM",subject: "Revision Class", level: "O/L" },
        ],
      },
    },
  });

  const gampaha = await prisma.institution.upsert({
    where: { id: "inst-gampaha" },
    update: {},
    create: {
      id: "inst-gampaha",
      name: "Gampaha Study Circle",
      address: "78, Yakkala Road, Gampaha",
      phone: "+94 33 222 7890",
      mapUrl: "https://maps.google.com/?q=Yakkala+Road+Gampaha",
      timetable: {
        create: [
          { day: "Tuesday",  time: "4:30 PM – 6:30 PM", subject: "Combined Maths",   level: "A/L" },
          { day: "Thursday", time: "4:30 PM – 6:30 PM", subject: "Physics",          level: "A/L" },
          { day: "Saturday", time: "9:00 AM – 12:00 PM",subject: "Hall Class – Physics", level: "A/L" },
          { day: "Sunday",   time: "8:00 AM – 10:00 AM",subject: "Group Class",      level: "A/L" },
          { day: "Sunday",   time: "10:30 AM – 12:00 PM",subject: "Paper Class",     level: "A/L" },
        ],
      },
    },
  });

  console.log(`Created institutions: ${colombo.name}, ${kandy.name}, ${gampaha.name}`);

  // ─── Seed site settings ──────────────────────────────────────
  await prisma.siteSetting.upsert({
    where: { key: "primaryHSL" },
    update: {},
    create: { key: "primaryHSL", value: { h: 215, s: 70, l: 25 } },
  });

  await prisma.siteSetting.upsert({
    where: { key: "accentHSL" },
    update: {},
    create: { key: "accentHSL", value: { h: 38, s: 95, l: 53 } },
  });

  await prisma.siteSetting.upsert({
    where: { key: "navItems" },
    update: {},
    create: {
      key: "navItems",
      value: [
        { href: "/",                label: "Home",            visible: true },
        { href: "/institutions",    label: "Institutions",    visible: true },
        { href: "/classes",         label: "Classes",         visible: true },
        { href: "/learning-centre", label: "Learning Centre", visible: true },
        { href: "/contact",         label: "Contact",         visible: true },
      ],
    },
  });

  console.log("Created site settings");

  // ─── Seed learning materials ─────────────────────────────────
  await prisma.learningMaterial.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "2023 A/L Combined Maths Past Paper",
        type: "PDF",
        content: "Full past paper for 2023 A/L Combined Mathematics examination.",
        fileUrl: "/files/2023-al-combined-maths.pdf",
        subject: "Combined Mathematics",
        level: "A/L",
        uploaderId: superAdmin.id,
      },
      {
        title: "2022 A/L Combined Maths Past Paper",
        type: "PDF",
        content: "Full past paper for 2022 A/L Combined Mathematics examination.",
        fileUrl: "/files/2022-al-combined-maths.pdf",
        subject: "Combined Mathematics",
        level: "A/L",
        uploaderId: superAdmin.id,
      },
      {
        title: "2023 A/L Physics Past Paper",
        type: "PDF",
        content: "Full past paper for 2023 A/L Physics examination.",
        fileUrl: "/files/2023-al-physics.pdf",
        subject: "Physics",
        level: "A/L",
        uploaderId: teacher.id,
      },
      {
        title: "Calculus Model Answers — Chapter 1–5",
        type: "NOTE",
        content: "Detailed model answers covering integration, differentiation, and limits.",
        fileUrl: "/files/calculus-model-answers.pdf",
        subject: "Combined Mathematics",
        level: "A/L",
        uploaderId: superAdmin.id,
      },
      {
        title: "Mechanics Quick Reference Notes",
        type: "NOTE",
        content: "Concise reference sheet for mechanics — forces, motion, energy and momentum.",
        fileUrl: "/files/mechanics-reference.pdf",
        subject: "Physics",
        level: "A/L",
        uploaderId: teacher.id,
      },
    ],
  });

  console.log("Created learning materials");
  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
