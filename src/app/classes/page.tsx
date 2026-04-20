import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import AccordionList from "@/components/classes/AccordionList";

export const metadata: Metadata = {
  title: "Classes",
  description:
    "Explore all class types offered — Hall, Group, Paper, Revision, and Online classes. Click each category to view the full schedule, fees, and venue details.",
};

export default function ClassesPage() {
  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Classes Offered"
          subtitle="Select a class type below to see the full schedule, fees, venue, and additional information. Classes are available for O/L and A/L students."
        />

        <AccordionList />

        {/* CTA banner */}
        <div className="mt-12 bg-primary rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Ready to enrol?</h3>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Contact us today to register your seat. Limited seats available for
            group classes.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-accent text-white px-7 py-3 rounded-lg font-semibold hover:bg-amber-500 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
