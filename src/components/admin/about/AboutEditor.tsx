"use client";

import { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";
import type { AboutContent, AboutStat } from "@/types/admin";
import { DEFAULT_ABOUT } from "@/types/admin";
import * as api from "@/lib/api";

export default function AboutEditor() {
  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.siteSettings
      .list()
      .then((rows) => {
        const row = rows.find((r) => r.key === "aboutContent");
        if (row?.value) {
          setContent(row.value as unknown as AboutContent);
        }
      })
      .catch(() => {
        // fallback to defaults already in state
      });
  }, []);

  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) =>
    setContent((prev) => ({ ...prev, [key]: value }));

  const setStat = (index: number, field: keyof AboutStat, value: string) =>
    setContent((prev) => {
      const stats = [...prev.stats];
      stats[index] = { ...stats[index], [field]: value };
      return { ...prev, stats };
    });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.siteSettings.set("aboutContent", content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Teacher Identity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Teacher Identity</h3>

        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
            {content.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={content.imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <UserCircle size={36} className="text-primary/40" />
            )}
          </div>
          <div className="flex-1">
            <label className={labelCls}>Profile Image URL</label>
            <input
              type="url"
              value={content.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Teacher Name</label>
            <input
              type="text"
              value={content.teacherName}
              onChange={(e) => set("teacherName", e.target.value)}
              placeholder="Mr. Kamal Perera"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Subject Line</label>
            <input
              type="text"
              value={content.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Mathematics & Physics"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Section Title</label>
            <input
              type="text"
              value={content.sectionTitle}
              onChange={(e) => set("sectionTitle", e.target.value)}
              placeholder="About Mr. Kamal Perera"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Years of Experience</label>
            <input
              type="number"
              min={0}
              value={content.yearsExperience}
              onChange={(e) => set("yearsExperience", parseInt(e.target.value) || 0)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Section Subtitle</label>
          <input
            type="text"
            value={content.sectionSubtitle}
            onChange={(e) => set("sectionSubtitle", e.target.value)}
            placeholder="A dedicated educator..."
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Contact Address</label>
          <input
            type="text"
            value={content.address ?? ""}
            onChange={(e) => set("address", e.target.value)}
            placeholder="No. 22, Temple Road, Nugegoda, Colombo"
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1">Shown in the site footer.</p>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Biography</h3>
        <p className="text-xs text-gray-500 mb-3">
          Separate paragraphs with a blank line (press Enter twice).
        </p>
        <textarea
          value={content.bio}
          onChange={(e) => set("bio", e.target.value)}
          rows={8}
          className={inputCls + " resize-y"}
          placeholder="Write the teacher's biography here..."
        />
      </div>

      {/* Qualifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Qualifications</h3>
        <p className="text-xs text-gray-500 mb-3">One qualification per line.</p>
        <textarea
          value={content.qualifications}
          onChange={(e) => set("qualifications", e.target.value)}
          rows={5}
          className={inputCls + " resize-y"}
          placeholder="B.Sc. (Hons) Mathematics — University of Colombo&#10;Postgraduate Diploma in Education"
        />
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Stats</h3>
        <p className="text-xs text-gray-500 mb-4">Displayed in the four-column statistics row.</p>
        <div className="grid grid-cols-2 gap-4">
          {content.stats.map((stat, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-1">
                <label className={labelCls}>Value</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => setStat(i, "value", e.target.value)}
                  placeholder="800+"
                  className={inputCls}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Label</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => setStat(i, "label", e.target.value)}
                  placeholder="Students Annually"
                  className={inputCls}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : saved ? "Saved!" : "Save About Section"}
        </button>
        <p className="text-xs text-gray-400">
          Changes are reflected on the public home page immediately after saving.
        </p>
      </div>
    </div>
  );
}
