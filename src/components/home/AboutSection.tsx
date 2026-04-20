import Image from "next/image";
import Link from "next/link";
import { Award, GraduationCap, Users, Star } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import type { AboutContent } from "@/types/admin";
import { DEFAULT_ABOUT } from "@/types/admin";

// Icons for the 4 stats, in order — design decision kept server-side
const STAT_ICONS = [Users, GraduationCap, Star, Award];

interface AboutSectionProps {
  content?: AboutContent;
}

export default function AboutSection({ content = DEFAULT_ABOUT }: AboutSectionProps) {
  const bioParagraphs = content.bio
    .split(/\n\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const qualificationsList = content.qualifications
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image column */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/5] max-w-sm mx-auto lg:mx-0">
              {content.imageUrl && !content.imageUrl.startsWith("/") ? (
                // External URL — use regular img tag
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={content.imageUrl}
                  alt={content.teacherName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={content.imageUrl || "/images/teacher.jpg"}
                  alt={content.teacherName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 320px, 400px"
                />
              )}
              {/* Overlay placeholder shown when image is missing */}
              {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-dark/90 flex flex-col items-center justify-center text-white"> */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <GraduationCap className="w-20 h-20 mb-4 opacity-80" />
                <p className="font-semibold text-lg">{content.teacherName}</p>
                <p className="text-white/70 text-sm">{content.subject}</p>
              </div>
            </div>

            {/* Floating years badge */}
            <div className="absolute -bottom-4 -right-4 lg:right-8 bg-accent text-white rounded-xl px-5 py-3 shadow-lg text-center">
              <p className="text-2xl font-bold">{content.yearsExperience}+</p>
              <p className="text-xs font-medium opacity-90">Years Teaching</p>
            </div>
          </div>

          {/* Text column */}
          <div>
            <SectionHeading
              title={content.sectionTitle}
              subtitle={content.sectionSubtitle}
            />

            <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
              {bioParagraphs.map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
              ))}
            </div>

            {/* Qualifications list */}
            <ul className="space-y-2 mb-8">
              {qualificationsList.map((q) => (
                <li key={q} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                  {q}
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary-light transition-colors shadow-sm"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {content.stats.map(({ value, label }, i) => {
            const Icon = STAT_ICONS[i % STAT_ICONS.length];
            return (
              <div
                key={i}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100"
              >
                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-primary mb-1">{value}</p>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
