"use client";

import { useState, useEffect } from "react";
import { Check, Image as ImageIcon, Palette } from "lucide-react";
import type { NavToggle, HslColor, HeroBackground, SiteConfig } from "@/types/admin";
import {
  COLOR_PRESETS,
  DEFAULT_HERO_BG,
  DEFAULT_SITE_CONFIG,
} from "@/types/admin";
import { defaultSettings } from "@/data/admin/mockSettings";
import * as api from "@/lib/api";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function hsl(c: HslColor) {
  return `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
}

function matchPresetId(primary: HslColor, accent: HslColor): string | null {
  for (const p of COLOR_PRESETS) {
    if (
      p.primaryHSL.h === primary.h &&
      p.primaryHSL.s === primary.s &&
      p.primaryHSL.l === primary.l &&
      p.accentHSL.h === accent.h &&
      p.accentHSL.s === accent.s &&
      p.accentHSL.l === accent.l
    ) {
      return p.id;
    }
  }
  return null;
}

function applyToDocument(primary: HslColor, accent: HslColor) {
  const root = document.documentElement;
  const { h, s, l } = primary;
  root.style.setProperty("--color-primary", `${h} ${s}% ${l}%`);
  root.style.setProperty("--color-primary-light", `${h} ${s}% ${Math.min(l + 13, 95)}%`);
  root.style.setProperty("--color-primary-dark", `${h} ${s}% ${Math.max(l - 10, 5)}%`);
  root.style.setProperty("--color-accent", `${accent.h} ${accent.s}% ${accent.l}%`);
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ThemeEditor() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(COLOR_PRESETS[0].id);
  const [primaryHSL, setPrimaryHSL] = useState<HslColor>(COLOR_PRESETS[0].primaryHSL);
  const [accentHSL, setAccentHSL] = useState<HslColor>(COLOR_PRESETS[0].accentHSL);
  const [heroBg, setHeroBg] = useState<HeroBackground>(DEFAULT_HERO_BG);
  const [navItems, setNavItems] = useState<NavToggle[]>(defaultSettings.navItems);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load saved settings ────────────────────────────────────────────────────
  useEffect(() => {
    api.siteSettings
      .list()
      .then((rows) => {
        const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

        if (map.siteConfig) setSiteConfig(map.siteConfig as SiteConfig);

        const primary = (map.primaryHSL as HslColor) ?? COLOR_PRESETS[0].primaryHSL;
        const accent = (map.accentHSL as HslColor) ?? COLOR_PRESETS[0].accentHSL;
        setPrimaryHSL(primary);
        setAccentHSL(accent);
        setSelectedPresetId(matchPresetId(primary, accent) ?? COLOR_PRESETS[0].id);

        if (map.heroBackground) setHeroBg(map.heroBackground as HeroBackground);
        if (map.navItems) setNavItems(map.navItems as NavToggle[]);
      })
      .catch(() => {
        const stored = localStorage.getItem("admin_settings");
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as { navItems?: NavToggle[] };
            if (parsed.navItems) setNavItems(parsed.navItems);
          } catch { /* ignore */ }
        }
      });
  }, []);

  // ── Preset selection ───────────────────────────────────────────────────────
  const selectPreset = (id: string) => {
    const preset = COLOR_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setSelectedPresetId(id);
    setPrimaryHSL(preset.primaryHSL);
    setAccentHSL(preset.accentHSL);
    // Live preview on current page
    applyToDocument(preset.primaryHSL, preset.accentHSL);
  };

  const toggleNav = (href: string) =>
    setNavItems((prev) =>
      prev.map((n) => (n.href === href ? { ...n, visible: !n.visible } : n))
    );

  // ── Save all ───────────────────────────────────────────────────────────────
  const saveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      await Promise.all([
        api.siteSettings.set("siteConfig", siteConfig),
        api.siteSettings.set("primaryHSL", primaryHSL),
        api.siteSettings.set("accentHSL", accentHSL),
        api.siteSettings.set("heroBackground", heroBg),
        api.siteSettings.set("navItems", navItems),
      ]);
      applyToDocument(primaryHSL, accentHSL);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      localStorage.setItem(
        "admin_settings",
        JSON.stringify({ siteConfig, primaryHSL, accentHSL, heroBg, navItems })
      );
      setError("Could not reach the server. Settings saved locally as a fallback.");
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
        <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {error}
        </div>
      )}

      {/* ── 1. Site Identity ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900">Site Identity</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Shown in the navigation bar, footer, and browser tab.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Site Name</label>
            <input
              type="text"
              value={siteConfig.siteName}
              onChange={(e) =>
                setSiteConfig((s) => ({ ...s, siteName: e.target.value }))
              }
              placeholder="TutioLMS"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input
              type="text"
              value={siteConfig.siteTagline}
              onChange={(e) =>
                setSiteConfig((s) => ({ ...s, siteTagline: e.target.value }))
              }
              placeholder="Professional tuition classes…"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── 2. Colour Theme ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Palette size={16} className="text-primary" /> Colour Theme
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Selecting a theme applies it live as a preview. Save to make it permanent.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLOR_PRESETS.map((preset) => {
            const isActive = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset.id)}
                className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                  isActive
                    ? "border-primary shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Colour swatches */}
                <div className="flex gap-1.5 mb-2.5">
                  <div
                    className="h-7 flex-1 rounded-md shadow-sm"
                    style={{ backgroundColor: hsl(preset.primaryHSL) }}
                    title="Primary"
                  />
                  <div
                    className="h-7 flex-1 rounded-md shadow-sm"
                    style={{ backgroundColor: hsl(preset.accentHSL) }}
                    title="Accent"
                  />
                </div>
                <p className="text-xs font-medium text-gray-800 leading-tight">
                  {preset.name}
                </p>
                {isActive && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Hero Background ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <ImageIcon size={16} className="text-primary" /> Hero Background
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Controls the homepage hero section when no banners are active.
          </p>
        </div>

        <div className="flex gap-3 mb-4">
          {(["gradient", "image"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setHeroBg((h) => ({ ...h, type }))}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                heroBg.type === type
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {type === "gradient" ? "Colour Gradient" : "Custom Image"}
            </button>
          ))}
        </div>

        {heroBg.type === "image" && (
          <div>
            <label className={labelCls}>Background Image URL</label>
            <input
              type="url"
              value={heroBg.imageUrl ?? ""}
              onChange={(e) =>
                setHeroBg((h) => ({ ...h, imageUrl: e.target.value }))
              }
              placeholder="https://example.com/hero-photo.jpg"
              className={inputCls}
            />
            {heroBg.imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden h-28 relative border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroBg.imageUrl}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1.5">
              A dark overlay is applied automatically so text remains readable.
            </p>
          </div>
        )}

        {heroBg.type === "gradient" && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            The carousel will cycle through four colour slides using the current theme&apos;s primary hue.
          </p>
        )}
      </div>

      {/* ── 4. Navigation Visibility ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Navigation Visibility</h3>
        <p className="text-xs text-gray-500 mb-4">
          Toggle which items appear in the public navigation bar.
        </p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <div
              key={item.href}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.href}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleNav(item.href)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  item.visible ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    item.visible ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={saveAll}
          disabled={saving}
          className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : saved ? "Saved!" : "Save All Settings"}
        </button>
        <p className="text-xs text-gray-400">
          Saves site identity, colour theme, hero background, and navigation — applies to all visitors immediately.
        </p>
      </div>
    </div>
  );
}
