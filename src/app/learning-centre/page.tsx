import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import DocumentCard from "@/components/learning-centre/DocumentCard";
import type { LearningDocument } from "@/types";
import { checkNavVisible } from "@/lib/nav-guard";

export const metadata: Metadata = {
  title: "Learning Centre",
  description:
    "Download free past papers, model answers, and revision notes for O/L and A/L Mathematics and Physics.",
};

const INTERNAL_API = (process.env.API_INTERNAL_URL ?? "http://localhost:4000") + "/api";

const iconByType: Record<string, string> = {
  PDF: "FileText",
  NOTE: "BookOpen",
  VIDEO: "Monitor",
};

interface PublicMaterial {
  id: string;
  title: string;
  type: string;
  subject: string;
  level: string;
  fileUrl: string | null;
  content: string;
  createdAt: string;
}

function resolveUrl(m: PublicMaterial): string | undefined {
  if (m.fileUrl) return m.fileUrl;
  const c = m.content?.trim() ?? "";
  if (c.startsWith("http://") || c.startsWith("https://")) return c;
  return undefined;
}

async function getPublicMaterials(): Promise<LearningDocument[]> {
  try {
    const res = await fetch(`${INTERNAL_API}/learning-materials-public`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const materials = (await res.json()) as PublicMaterial[];
    return materials.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      subject: m.subject,
      level: m.level,
      year: new Date(m.createdAt).getFullYear().toString(),
      downloadUrl: resolveUrl(m),
      icon: iconByType[m.type] ?? "FileText",
    }));
  } catch {
    return [];
  }
}

export default async function LearningCentrePage() {
  await checkNavVisible("/learning-centre");
  const documents = await getPublicMaterials();

  const aLevelDocs = documents.filter((d) => d.level === "A/L");
  const oLevelDocs = documents.filter((d) => d.level === "O/L");

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Learning Centre"
          subtitle="Download past papers, model answers, and revision notes — all free of charge. New materials are added regularly."
        />

        {/* Notice banner */}
        <div className="mb-10 flex items-start gap-3 bg-primary/8 border border-primary/20 rounded-xl p-4">
          <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            All documents are provided for <strong>educational purposes</strong>{" "}
            only. Please do not redistribute without permission. More materials
            are added before each exam season.
          </p>
        </div>

        {documents.length === 0 ? (
          <p className="text-center text-gray-400 mt-4">
            No materials available yet. Check back soon.
          </p>
        ) : (
          <>
            {aLevelDocs.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  Advanced Level (A/L)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {aLevelDocs.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>
              </section>
            )}

            {oLevelDocs.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  Ordinary Level (O/L)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {oLevelDocs.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
