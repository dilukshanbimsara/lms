"use client";

import { useState, FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { AdminInstitution, AdminTimetableRow } from "@/types/admin";

interface InstitutionFormProps {
  initialData?: AdminInstitution;
  onSave: (data: Omit<AdminInstitution, "id">) => void;
  onCancel: () => void;
}

const emptyRow = (): AdminTimetableRow => ({
  id: `row-${Date.now()}-${Math.random()}`,
  day: "",
  time: "",
  subject: "",
  level: "A/L",
});

export default function InstitutionForm({ initialData, onSave, onCancel }: InstitutionFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [mapUrl, setMapUrl] = useState(initialData?.mapUrl ?? "");
  const [timetable, setTimetable] = useState<AdminTimetableRow[]>(
    initialData?.timetable ?? [emptyRow()]
  );

  const addRow = () => setTimetable((prev) => [...prev, emptyRow()]);
  const removeRow = (id: string) => setTimetable((prev) => prev.filter((r) => r.id !== id));
  const updateRow = (id: string, field: keyof AdminTimetableRow, value: string) => {
    setTimetable((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ name, address, phone, mapUrl, timetable });
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Institution Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="e.g. Colombo Learning Hub" />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} placeholder="+94 11 234 5678" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Address</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className={inputCls} placeholder="45/B, Galle Road, Colombo 03" />
      </div>

      <div>
        <label className={labelCls}>Google Maps URL (optional)</label>
        <input type="url" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} className={inputCls} placeholder="https://maps.google.com/..." />
      </div>

      {/* Timetable */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls + " mb-0"}>Timetable</label>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus size={13} /> Add Row
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500 font-semibold">Day</th>
                <th className="px-3 py-2 text-left text-gray-500 font-semibold">Time</th>
                <th className="px-3 py-2 text-left text-gray-500 font-semibold">Subject</th>
                <th className="px-3 py-2 text-left text-gray-500 font-semibold">Level</th>
                <th className="px-3 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {timetable.map((row) => (
                <tr key={row.id}>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.day}
                      onChange={(e) => updateRow(row.id, "day", e.target.value)}
                      placeholder="Monday"
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.time}
                      onChange={(e) => updateRow(row.id, "time", e.target.value)}
                      placeholder="4:00 PM – 6:00 PM"
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.subject}
                      onChange={(e) => updateRow(row.id, "subject", e.target.value)}
                      placeholder="Combined Maths"
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={row.level}
                      onChange={(e) => updateRow(row.id, "level", e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none"
                    >
                      <option value="A/L">A/L</option>
                      <option value="O/L">O/L</option>
                    </select>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {timetable.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-400">
                    No timetable rows. Click &ldquo;Add Row&rdquo; to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
        >
          {initialData ? "Save Changes" : "Add Institution"}
        </button>
      </div>
    </form>
  );
}
