import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import InstitutionCard from "@/components/institutions/InstitutionCard";
import type { Institution } from "@/types";
import { checkNavVisible } from "@/lib/nav-guard";

export const metadata: Metadata = {
  title: "Institutions",
  description:
    "Find tuition class schedules and contact details for all institutions where classes are held — Colombo, Kandy, and Gampaha.",
};

const INTERNAL_API = (process.env.API_INTERNAL_URL ?? "http://localhost:4000") + "/api";

interface ApiTimetableRow {
  id: string;
  day: string;
  time: string;
  subject: string;
  level: string;
}

interface ApiInstitution {
  id: string;
  name: string;
  address: string;
  phone: string;
  mapUrl?: string | null;
  timetable: ApiTimetableRow[];
}

async function getInstitutions(): Promise<Institution[]> {
  try {
    const res = await fetch(`${INTERNAL_API}/institutions-public`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as ApiInstitution[];
    return rows.map((inst) => ({
      id: inst.id,
      name: inst.name,
      address: inst.address,
      phone: inst.phone,
      mapUrl: inst.mapUrl ?? undefined,
      timetable: inst.timetable.map((row) => ({
        day: row.day,
        time: row.time,
        subject: row.subject,
        level: row.level,
      })),
    }));
  } catch {
    return [];
  }
}

export default async function InstitutionsPage() {
  await checkNavVisible("/institutions");
  const institutions = await getInstitutions();

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Our Institutions"
          subtitle="Classes are conducted at the following locations. Each institution has its own dedicated schedule tailored to student availability in that region."
        />

        {institutions.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">
            No institutions listed yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {institutions.map((institution) => (
              <InstitutionCard key={institution.id} institution={institution} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
