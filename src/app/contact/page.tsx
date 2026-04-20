import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import PersonalContactCard from "@/components/contact/PersonalContactCard";
import InstitutionContactCard from "@/components/contact/InstitutionContactCard";
import { personalContact, institutionContacts } from "@/data/contact";
import { prisma } from "@/lib/prisma";
import type { ContactPerson } from "@/types";
import type { AboutContent } from "@/types/admin";
import { DEFAULT_ABOUT } from "@/types/admin";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with our teacher for class enrolments, enquiries, and institution contact details.",
};

async function getTeacherContact(): Promise<ContactPerson> {
  try {
    const [teacher, aboutRow] = await Promise.all([
      prisma.user.findFirst({
        where: { role: "TEACHER" },
        select: { name: true, email: true, phone: true, imageUrl: true },
      }),
      prisma.siteSetting.findUnique({ where: { key: "aboutContent" } }),
    ]);

    const about = (aboutRow?.value as unknown as AboutContent) ?? DEFAULT_ABOUT;
    const qualifications = about.qualifications
      ? about.qualifications.split("\n").filter(Boolean)
      : personalContact.qualifications;

    if (!teacher) return personalContact;

    return {
      name: teacher.name,
      role: about.subject ? `${about.subject} Teacher` : personalContact.role,
      qualifications,
      phone: teacher.phone ? [teacher.phone] : personalContact.phone,
      email: teacher.email,
      address: about.address || personalContact.address,
      imageUrl: teacher.imageUrl ?? about.imageUrl ?? undefined,
      socials: personalContact.socials,
    };
  } catch {
    return personalContact;
  }
}

export default async function ContactPage() {
  const [teacherContact] = await Promise.all([getTeacherContact()]);

  const primaryPhone =
    teacherContact.phone[0] ?? personalContact.phone[0];

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Contact Us"
          subtitle={`Reach out directly to ${teacherContact.name} or contact your nearest institution for class bookings and enquiries.`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left — teacher personal contact */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              Teacher Contact
            </h2>
            <PersonalContactCard contact={teacherContact} />
          </div>

          {/* Right — institution contacts */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              Institution Contacts
            </h2>
            <div className="space-y-4">
              {institutionContacts.map((inst, i) => (
                <InstitutionContactCard key={inst.name} institution={inst} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Enquiry note */}
        <div className="mt-14 bg-primary rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Have a question?</h3>
          <p className="text-white/80 max-w-lg mx-auto">
            For class registrations, fee enquiries, or any other questions,
            please call or WhatsApp{" "}
            <strong className="text-accent">{primaryPhone}</strong> directly.
            We typically respond within a few hours.
          </p>
        </div>
      </div>
    </div>
  );
}
