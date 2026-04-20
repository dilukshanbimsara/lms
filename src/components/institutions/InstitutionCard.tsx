import { Phone, MapPin, Clock, ExternalLink } from "lucide-react";
import type { Institution } from "@/types";

interface InstitutionCardProps {
  institution: Institution;
}

export default function InstitutionCard({ institution }: InstitutionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-primary px-6 py-5">
        <h3 className="text-white font-bold text-lg">{institution.name}</h3>
        <div className="flex items-start gap-1.5 mt-2 text-white/80 text-sm">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{institution.address}</span>
        </div>
      </div>

      {/* Contact details */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-primary" />
          <span>{institution.phone}</span>
        </div>
        {institution.mapUrl && (
          <a
            href={institution.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-light font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on Map</span>
          </a>
        )}
      </div>

      {/* Timetable */}
      <div className="px-6 py-5 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-gray-800 text-sm">Class Schedule</h4>
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="bg-primary/8 text-primary text-xs uppercase tracking-wide">
                <th className="text-left px-3 py-2 font-semibold rounded-l">Day</th>
                <th className="text-left px-3 py-2 font-semibold">Time</th>
                <th className="text-left px-3 py-2 font-semibold">Subject</th>
                <th className="text-left px-3 py-2 font-semibold rounded-r">Level</th>
              </tr>
            </thead>
            <tbody>
              {institution.timetable.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 even:bg-gray-50/60 hover:bg-primary/5 transition-colors"
                >
                  <td className="px-3 py-2.5 font-medium text-gray-700">{row.day}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.time}</td>
                  <td className="px-3 py-2.5 text-gray-700">{row.subject}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {row.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
