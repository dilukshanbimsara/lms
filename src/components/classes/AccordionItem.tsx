"use client";

import { ChevronDown } from "lucide-react";
import { iconMap } from "@/lib/icons";
import { FileText } from "lucide-react";
import type { ClassCategory } from "@/types";

interface AccordionItemProps {
  category: ClassCategory;
  isOpen: boolean;
  onToggle: () => void;
}

export default function AccordionItem({
  category,
  isOpen,
  onToggle,
}: AccordionItemProps) {
  const IconComponent = iconMap[category.icon] ?? FileText;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-5 text-left transition-colors duration-200 ${
          isOpen ? "bg-primary text-white" : "bg-white hover:bg-primary/5"
        }`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isOpen ? "bg-white/20" : "bg-primary/10"
            }`}
          >
            <IconComponent
              className={`w-5 h-5 ${isOpen ? "text-white" : "text-primary"}`}
            />
          </div>
          <div className="text-left">
            <p
              className={`font-semibold text-base ${
                isOpen ? "text-white" : "text-gray-800"
              }`}
            >
              {category.label}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                isOpen ? "text-white/75" : "text-gray-500"
              }`}
            >
              {category.items.length} class
              {category.items.length !== 1 ? "es" : ""} available
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-white" : "text-gray-400"
          }`}
        />
      </button>

      {/* Collapsible content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-100 p-5 bg-white">
          <p className="text-gray-600 text-sm mb-5">{category.description}</p>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-primary bg-primary/8">
                  <th className="text-left px-3 py-2.5 font-semibold rounded-l">Subject</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Level</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Day</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Time</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Fee</th>
                  <th className="text-left px-3 py-2.5 font-semibold rounded-r">Venue</th>
                </tr>
              </thead>
              <tbody>
                {category.items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 even:bg-gray-50/70 hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-3 py-3 font-medium text-gray-800">
                      {item.subject}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {item.level}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{item.day}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {item.time}
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-800 whitespace-nowrap">
                      {item.fee}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs">
                      {item.venue ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {category.items.some((i) => i.notes) && (
            <div className="mt-4 space-y-1">
              {category.items
                .filter((i) => i.notes)
                .map((item, i) => (
                  <p key={i} className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    <strong>{item.subject}:</strong> {item.notes}
                  </p>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
