"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Users, Building2, CheckCircle,
  AlertCircle, Hash, BookOpen, Loader2, RefreshCw,
} from "lucide-react";
import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import * as api from "@/lib/api";
import type {
  AdminInstitution, ResultSheetGradeRanges, StudentResultEntry,
} from "@/types/admin";

const GRADES = ["A", "B", "C", "S", "W"] as const;
type Grade = typeof GRADES[number];

const DEFAULT_RANGES: ResultSheetGradeRanges = {
  A: { min: 75, max: 100 },
  B: { min: 65, max: 75 },
  C: { min: 55, max: 65 },
  S: { min: 45, max: 55 },
  W: { min: 0,  max: 45  },
};

const GRADE_COLORS: Record<Grade, string> = {
  A: "bg-green-100 text-green-700 border-green-200",
  B: "bg-blue-100 text-blue-700 border-blue-200",
  C: "bg-yellow-100 text-yellow-700 border-yellow-200",
  S: "bg-orange-100 text-orange-700 border-orange-200",
  W: "bg-red-100 text-red-700 border-red-200",
};

const EXAM_YEARS = Array.from({ length: 8 }, (_, i) => String(2025 + i));

function computeGrade(mark: number | null | "", ranges: ResultSheetGradeRanges): string {
  if (mark === "" || mark === null || mark === undefined) return "";
  const m = Number(mark);
  for (const grade of GRADES) {
    const { min, max } = ranges[grade];
    if (m >= min && m <= max) return grade;
  }
  return "W";
}

function GradePill({ grade }: { grade: string }) {
  if (!grade) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${GRADE_COLORS[grade as Grade] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {grade}
    </span>
  );
}

function ResultEditorContent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [examDate, setExamDate] = useState("");
  const [description, setDescription] = useState("");
  const [gradeRanges, setGradeRanges] = useState<ResultSheetGradeRanges>(DEFAULT_RANGES);
  const [institutions, setInstitutions] = useState<AdminInstitution[]>([]);
  const [selectedInstitutionIds, setSelectedInstitutionIds] = useState<string[]>([]);
  const [includeOnline, setIncludeOnline] = useState(false);
  const [students, setStudents] = useState<StudentResultEntry[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    api.institutions.list().then(setInstitutions).catch(() => {});
  }, []);

  const toggleInstitution = (id: string) => {
    setSelectedInstitutionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleLoadStudents = async () => {
    if (!year) return;
    setLoadingStudents(true);
    setLoadError("");
    try {
      const ids = [
        ...selectedInstitutionIds,
        ...(includeOnline ? ["online"] : []),
      ];
      const data = await api.results.loadStudents(ids, year);
      setStudents(data.map((s) => ({ ...s, mark: "", grade: "", note: "" })));
      setStudentsLoaded(true);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const updateMark = (idx: number, raw: string) => {
    const mark = raw === "" ? "" : Number(raw);
    const grade = mark === "" ? "" : computeGrade(mark as number, gradeRanges);
    setStudents((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, mark: mark as number | "", grade } : s))
    );
  };

  const updateNote = (idx: number, note: string) => {
    setStudents((prev) => prev.map((s, i) => (i === idx ? { ...s, note } : s)));
  };

  const updateGradeRange = (grade: Grade, field: "min" | "max", val: string) => {
    const num = Number(val);
    setGradeRanges((prev) => ({
      ...prev,
      [grade]: { ...prev[grade], [field]: num },
    }));
    // Recompute grades for all entered marks
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        grade: s.mark !== "" && s.mark !== null
          ? computeGrade(s.mark, { ...gradeRanges, [grade]: { ...gradeRanges[grade], [field]: num } })
          : "",
      }))
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !year || !examDate) {
      setSaveError("Please fill in the title, year, and exam date.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const institutionIds = [
        ...selectedInstitutionIds,
        ...(includeOnline ? ["online"] : []),
      ];
      await api.results.create({
        title: title.trim(),
        year,
        examDate,
        description: description.trim() || undefined,
        gradeRanges,
        institutionIds,
        results: students.map((s) => ({
          studentId: s.studentId,
          mark: s.mark !== "" && s.mark !== null ? Number(s.mark) : undefined,
          grade: s.grade || undefined,
          note: s.note || undefined,
        })),
      });
      router.push("/admin/results");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  };

  const markedCount = students.filter((s) => s.mark !== "" && s.mark !== null).length;
  const passedCount = students.filter((s) => s.grade && s.grade !== "W").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/results")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-base font-semibold text-gray-900">Create Result Sheet</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveError && (
            <span className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle size={14} />
              {saveError}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving…" : "Save Result Sheet"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Card 1: Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
            Basic Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Result Sheet Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mid-Year Mock Test 2027"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-white"
              >
                <option value="">Select year…</option>
                {EXAM_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Exam Held Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional notes about this exam for future teacher reference…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Grade Ranges */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
            Grade Ranges
          </h2>
          <p className="text-xs text-gray-400 mb-4 ml-8">Define the mark range for each grade. Grades are fixed as A, B, C, S, W.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 w-20">Grade</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Min Mark</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Max Mark</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Range Preview</th>
                </tr>
              </thead>
              <tbody>
                {GRADES.map((g) => (
                  <tr key={g} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 px-3">
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${GRADE_COLORS[g]}`}>
                        {g}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={gradeRanges[g].min}
                        onChange={(e) => updateGradeRange(g, "min", e.target.value)}
                        className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={gradeRanges[g].max}
                        onChange={(e) => updateGradeRange(g, "max", e.target.value)}
                        className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-xs">
                      {gradeRanges[g].min} – {gradeRanges[g].max} marks
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 3: Filter & Load Students */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</span>
            Filter & Load Students
          </h2>
          <p className="text-xs text-gray-400 mb-4 ml-8">Select institutions to filter ACTIVE students by exam year.</p>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
              <Building2 size={13} /> Institutions
            </p>
            <div className="flex flex-wrap gap-2">
              {institutions.map((inst) => (
                <label
                  key={inst.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                    selectedInstitutionIds.includes(inst.id)
                      ? "bg-primary/10 border-primary text-primary font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedInstitutionIds.includes(inst.id)}
                    onChange={() => toggleInstitution(inst.id)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    selectedInstitutionIds.includes(inst.id) ? "bg-primary border-primary" : "border-gray-300"
                  }`}>
                    {selectedInstitutionIds.includes(inst.id) && (
                      <CheckCircle size={12} className="text-white" />
                    )}
                  </div>
                  {inst.name}
                </label>
              ))}
              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                includeOnline
                  ? "bg-primary/10 border-primary text-primary font-medium"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}>
                <input
                  type="checkbox"
                  checked={includeOnline}
                  onChange={(e) => setIncludeOnline(e.target.checked)}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  includeOnline ? "bg-primary border-primary" : "border-gray-300"
                }`}>
                  {includeOnline && <CheckCircle size={12} className="text-white" />}
                </div>
                Online Students
              </label>
            </div>
          </div>

          {loadError && (
            <p className="text-sm text-red-600 mb-3 flex items-center gap-1.5">
              <AlertCircle size={14} /> {loadError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadStudents}
              disabled={!year || loadingStudents}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loadingStudents
                ? <Loader2 size={15} className="animate-spin" />
                : <Users size={15} />}
              {loadingStudents ? "Loading…" : studentsLoaded ? "Re-load Students" : "Load Students"}
            </button>
            {!year && (
              <span className="text-xs text-gray-400">Select an exam year first</span>
            )}
            {studentsLoaded && !loadingStudents && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle size={14} />
                {students.length} student{students.length !== 1 ? "s" : ""} loaded
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Student Marks */}
        {studentsLoaded && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">4</span>
                Student Marks
                <span className="text-xs font-normal text-gray-400 ml-1">— Enter marks for each student. Grade updates automatically.</span>
              </h2>
              {students.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span><span className="font-semibold text-gray-700">{markedCount}</span> / {students.length} marked</span>
                  <span className="text-green-600 font-semibold">{passedCount} passed</span>
                </div>
              )}
            </div>

            {students.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No active students found for the selected filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 w-10">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Student No.</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Subject</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 w-28">Mark (/100)</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 w-20">Grade</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Note (optional)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr
                        key={s.studentId}
                        className={`border-b border-gray-100 last:border-0 ${
                          s.grade === "W" && s.mark !== "" ? "bg-red-50/30" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Hash size={12} className="text-gray-300" />
                            <span className="font-mono text-xs text-gray-600">{s.studentNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{s.studentName}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <BookOpen size={12} />
                            {s.subject}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={s.mark === null ? "" : s.mark}
                            onChange={(e) => updateMark(idx, e.target.value)}
                            placeholder="—"
                            className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-center"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <GradePill grade={s.grade} />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={s.note}
                            onChange={(e) => updateNote(idx, e.target.value)}
                            placeholder="Add a note…"
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-gray-600 bg-gray-50"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary footer */}
            {students.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-6 text-xs text-gray-500">
                <span>Total: <strong className="text-gray-700">{students.length}</strong></span>
                <span>Marked: <strong className="text-gray-700">{markedCount}</strong></span>
                <span>Passed: <strong className="text-green-600">{passedCount}</strong></span>
                <span>Failed (W): <strong className="text-red-500">{students.filter(s => s.grade === "W").length}</strong></span>
                {markedCount > 0 && (
                  <span>Pass rate: <strong className="text-primary">{Math.round((passedCount / markedCount) * 100)}%</strong></span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewResultPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "TEACHER"]}>
      <ResultEditorContent />
    </ProtectedRoute>
  );
}
