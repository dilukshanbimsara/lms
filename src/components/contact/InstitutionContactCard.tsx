import { Phone, MapPin, Clock } from "lucide-react";
import type { ContactInstitution } from "@/types";

interface InstitutionContactCardProps {
  institution: ContactInstitution;
  index: number;
}

export default function InstitutionContactCard({
  institution,
  index,
}: InstitutionContactCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
          {index + 1}
        </div>
        <h3 className="font-bold text-gray-800">{institution.name}</h3>
      </div>

      <ul className="space-y-3 text-sm">
        <li className="flex items-start gap-2.5 text-gray-600">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>{institution.address}</span>
        </li>
        {institution.phone.map((p) => (
          <li key={p}>
            <a
              href={`tel:${p.replace(/\s/g, "")}`}
              className="flex items-center gap-2.5 text-gray-600 hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4 text-primary shrink-0" />
              {p}
            </a>
          </li>
        ))}
        {institution.hours && (
          <li className="flex items-start gap-2.5 text-gray-600">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{institution.hours}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
