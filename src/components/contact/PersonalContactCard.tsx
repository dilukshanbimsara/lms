import { Phone, Mail, MapPin, GraduationCap } from "lucide-react";
import { iconMap } from "@/lib/icons";
import { FileText } from "lucide-react";
import type { ContactPerson } from "@/types";

interface PersonalContactCardProps {
  contact: ContactPerson;
}

export default function PersonalContactCard({
  contact,
}: PersonalContactCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Teacher image */}
      {contact.imageUrl ? (
        <div className="relative w-full h-64 bg-gray-100">
          <img
            src={contact.imageUrl}
            alt={contact.name}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 px-6 py-4">
            <h3 className="text-white font-bold text-xl drop-shadow">{contact.name}</h3>
            <p className="text-white/85 text-sm drop-shadow">{contact.role}</p>
          </div>
        </div>
      ) : (
        /* Header fallback when no image */
        <div className="bg-primary px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">{contact.name}</h3>
              <p className="text-white/80 text-sm">{contact.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Primary accent bar shown below image */}
      {contact.imageUrl && (
        <div className="h-1.5 bg-primary" />
      )}

      <div className="p-6 space-y-6">
        {/* Phone numbers */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Phone
          </h4>
          <ul className="space-y-2">
            {contact.phone.map((p) => (
              <li key={p}>
                <a
                  href={`tel:${p.replace(/\s/g, "")}`}
                  className="flex items-center gap-2.5 text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  {p}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Email */}
        {contact.email && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Email
            </h4>
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2.5 text-gray-700 hover:text-primary transition-colors font-medium break-all"
            >
              <Mail className="w-4 h-4 text-primary shrink-0" />
              {contact.email}
            </a>
          </div>
        )}

        {/* Address */}
        {contact.address && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Address
            </h4>
            <div className="flex items-start gap-2.5 text-gray-700">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{contact.address}</span>
            </div>
          </div>
        )}

        {/* Social links */}
        {contact.socials && contact.socials.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Social Media
            </h4>
            <div className="flex gap-3">
              {contact.socials.map((social) => {
                const SocialIcon = iconMap[social.icon] ?? FileText;
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200 text-sm font-medium"
                    aria-label={social.platform}
                  >
                    <SocialIcon className="w-4 h-4" />
                    {social.platform}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Qualifications */}
        {contact.qualifications.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Qualifications
            </h4>
            <ul className="space-y-1.5">
              {contact.qualifications.map((q) => (
                <li
                  key={q}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
