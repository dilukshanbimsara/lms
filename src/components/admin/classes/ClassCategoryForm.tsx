"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { AdminClassCategory, AdminClassItem } from "@/types/admin";
import * as api from "@/lib/api";

interface ClassCategoryFormProps {
  initialData?: AdminClassCategory;
  onSave: (data: Omit<AdminClassCategory, "id">) => void;
  onCancel: () => void;
}

const ICON_OPTIONS = [
  "School", "Users", "FileCheck", "BookOpen", "Monitor", "GraduationCap",
  "FileText", "Award", "Star", "Clock",
];

const CATEGORY_LABEL_OPTIONS = [
  "Theory Class",
  "Group Class",
  "Paper Class",
  "Revision Class",
  "Online Class",
  "Seminar",
  "Other",
];

const WEEKDAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

const TIME_OPTIONS: string[] = (() => {
  const times: string[] = [];
  for (let h = 6; h <= 21; h++) {
    for (const m of [0, 30]) {
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${hour12}:${m === 0 ? "00" : "30"} ${ampm}`;
      times.push(label);
    }
  }
  return times;
})();

const emptyItem = (): AdminClassItem & { _key: string; timeStart: string; timeEnd: string } => ({
  _key: `item-${Date.now()}-${Math.random()}`,
  id: "",
  subject: "",
  level: "A/L",
  day: "",
  time: "",
  timeStart: "",
  timeEnd: "",
  fee: "",
  venue: "",
  seats: undefined,
  notes: "",
});

function buildTimeString(start: string, end: string) {
  if (!start && !end) return "";
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

export default function ClassCategoryForm({ initialData, onSave, onCancel }: ClassCategoryFormProps) {
  const initLabel = initialData?.label ?? "";
  const isPredefined = CATEGORY_LABEL_OPTIONS.includes(initLabel);
  const [labelSelect, setLabelSelect] = useState(isPredefined ? initLabel : (initLabel ? "Other" : ""));
  const [labelCustom, setLabelCustom] = useState(isPredefined ? "" : initLabel);
  const [icon, setIcon] = useState(initialData?.icon ?? "BookOpen");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [items, setItems] = useState<(AdminClassItem & { _key: string; timeStart: string; timeEnd: string })[]>(
    initialData?.items.map((it) => {
      const parts = it.time ? it.time.split(" – ") : ["", ""];
      return { ...it, _key: it.id || `item-${Math.random()}`, timeStart: parts[0] ?? "", timeEnd: parts[1] ?? "" };
    }) ?? [emptyItem()]
  );
  const [institutionNames, setInstitutionNames] = useState<string[]>([]);

  const label = labelSelect === "Other" ? labelCustom : labelSelect;

  useEffect(() => {
    api.institutions.list().then((list) => setInstitutionNames(list.map((i) => i.name))).catch(() => {});
  }, []);

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (key: string) => setItems((prev) => prev.filter((it) => it._key !== key));
  const updateItem = (key: string, field: keyof AdminClassItem | "timeStart" | "timeEnd", value: string | number | undefined) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it._key !== key) return it;
        if (field === "timeStart") {
          const updated = { ...it, timeStart: value as string };
          return { ...updated, time: buildTimeString(updated.timeStart, updated.timeEnd) };
        }
        if (field === "timeEnd") {
          const updated = { ...it, timeEnd: value as string };
          return { ...updated, time: buildTimeString(updated.timeStart, updated.timeEnd) };
        }
        return { ...it, [field]: value };
      })
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      label,
      icon,
      description,
      sortOrder,
      items: items.map(({ _key: _k, timeStart: _ts, timeEnd: _te, ...rest }) => rest),
    });
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
  const cellInput = "w-full border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category Label</label>
          <select
            value={labelSelect}
            onChange={(e) => { setLabelSelect(e.target.value); if (e.target.value !== "Other") setLabelCustom(""); }}
            required={labelSelect !== "Other"}
            className={inputCls}
          >
            <option value="" disabled>Select a category…</option>
            {CATEGORY_LABEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {labelSelect === "Other" && (
            <input
              type="text"
              value={labelCustom}
              onChange={(e) => setLabelCustom(e.target.value)}
              required
              className={inputCls + " mt-2"}
              placeholder="Enter custom label…"
            />
          )}
        </div>
        <div>
          <label className={labelCls}>Icon</label>
          <select value={icon} onChange={(e) => setIcon(e.target.value)} className={inputCls}>
            {ICON_OPTIONS.map((ic) => (
              <option key={ic} value={ic}>{ic}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={2}
          className={inputCls + " resize-none"}
          placeholder="Short description of this class type..."
        />
      </div>

      <div className="w-32">
        <label className={labelCls}>Sort Order</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          min={0}
          className={inputCls}
        />
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls + " mb-0"}>Class Items</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus size={13} /> Add Item
          </button>
        </div>

        {/* Venue datalist */}
        <datalist id="venue-suggestions">
          {institutionNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-xs min-w-[780px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Subject</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold w-20">Level</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Day</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Time</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Fee</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Venue</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold w-16">Seats</th>
                <th className="px-2 py-2 text-left text-gray-500 font-semibold">Notes</th>
                <th className="px-2 py-2 w-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item._key}>
                  <td className="px-1 py-1.5">
                    <input
                      type="text"
                      value={item.subject}
                      onChange={(e) => updateItem(item._key, "subject", e.target.value)}
                      placeholder="Combined Maths"
                      className={cellInput}
                    />
                  </td>
                  <td className="px-1 py-1.5">
                    <select
                      value={item.level}
                      onChange={(e) => updateItem(item._key, "level", e.target.value)}
                      className={cellInput}
                    >
                      <option value="A/L">A/L</option>
                      <option value="O/L">O/L</option>
                    </select>
                  </td>
                  <td className="px-1 py-1.5">
                    <select
                      value={item.day}
                      onChange={(e) => updateItem(item._key, "day", e.target.value)}
                      className={cellInput}
                    >
                      <option value="">— Day —</option>
                      {WEEKDAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-1 py-1.5">
                    <div className="flex items-center gap-1">
                      <select
                        value={item.timeStart}
                        onChange={(e) => updateItem(item._key, "timeStart", e.target.value)}
                        className={cellInput}
                      >
                        <option value="">Start</option>
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span className="text-gray-400 text-xs shrink-0">–</span>
                      <select
                        value={item.timeEnd}
                        onChange={(e) => updateItem(item._key, "timeEnd", e.target.value)}
                        className={cellInput}
                      >
                        <option value="">End</option>
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-1 py-1.5">
                    <input
                      type="text"
                      value={item.fee}
                      onChange={(e) => updateItem(item._key, "fee", e.target.value)}
                      placeholder="LKR 2,500 / month"
                      className={cellInput}
                    />
                  </td>
                  <td className="px-1 py-1.5">
                    <input
                      type="text"
                      value={item.venue ?? ""}
                      onChange={(e) => updateItem(item._key, "venue", e.target.value)}
                      placeholder="Select or type venue"
                      list="venue-suggestions"
                      className={cellInput}
                    />
                  </td>
                  <td className="px-1 py-1.5">
                    <input
                      type="number"
                      value={item.seats ?? ""}
                      onChange={(e) =>
                        updateItem(item._key, "seats", e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="—"
                      min={1}
                      className={cellInput}
                    />
                  </td>
                  <td className="px-1 py-1.5">
                    <input
                      type="text"
                      value={item.notes ?? ""}
                      onChange={(e) => updateItem(item._key, "notes", e.target.value)}
                      placeholder="Optional note"
                      className={cellInput}
                    />
                  </td>
                  <td className="px-1 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item._key)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-center text-gray-400">
                    No items. Click &ldquo;Add Item&rdquo; to begin.
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
          {initialData ? "Save Changes" : "Add Category"}
        </button>
      </div>
    </form>
  );
}
