import { Download } from "lucide-react";
import { FileText } from "lucide-react";
import { iconMap } from "@/lib/icons";
import type { LearningDocument } from "@/types";

interface DocumentCardProps {
  doc: LearningDocument;
}

const BUTTON_LABELS: Record<string, string> = {
  PDF: "Download PDF",
  VIDEO: "Watch Video",
  NOTE: "Read Notes",
};

export default function DocumentCard({ doc }: DocumentCardProps) {
  const IconComponent = iconMap[doc.icon ?? "FileText"] ?? FileText;
  const buttonLabel = BUTTON_LABELS[doc.type ?? "PDF"] ?? "Download";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
      {/* Icon + title */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10 shrink-0 group-hover:bg-primary/15 transition-colors">
          <IconComponent className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-primary transition-colors">
            {doc.title}
          </h3>
          {doc.year && (
            <p className="text-xs text-gray-400 mt-0.5">{doc.year}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          {doc.subject}
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          {doc.level}
        </span>
        {doc.fileSize && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-500">
            {doc.fileSize}
          </span>
        )}
      </div>

      {/* Action button */}
      {doc.downloadUrl ? (
        <a
          href={doc.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          {buttonLabel}
        </a>
      ) : (
        <span className="mt-auto flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-gray-400 font-semibold text-sm cursor-default select-none">
          <Download className="w-4 h-4" />
          Link coming soon
        </span>
      )}
    </div>
  );
}
