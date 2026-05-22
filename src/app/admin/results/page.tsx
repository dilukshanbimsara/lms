"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList, Plus, Pencil, Trash2, Calendar, Users, Building2,
  BarChart2, X, ArrowUpDown, SortAsc, SortDesc, Search, Filter,
} from "lucide-react";
import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import PageHeader from "@/components/admin/shared/PageHeader";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import Pagination from "@/components/admin/shared/Pagination";
import * as api from "@/lib/api";
import type { ResultSheetSummary, ResultSheet, StudentResultEntry } from "@/types/admin";

const GRADES = ["A", "B", "C", "S", "W"] as const;
type Grade = typeof GRADES[number];

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-yellow-100 text-yellow-700",
  S: "bg-orange-100 text-orange-700",
  W: "bg-red-100 text-red-700",
};

const GRADE_BAR_COLORS: Record<string, string> = {
  A: "bg-green-400",
  B: "bg-blue-400",
  C: "bg-yellow-400",
  S: "bg-orange-400",
  W: "bg-red-400",
};

const SHEET_PAGE_SIZE = 10;
const MARKS_PAGE_SIZE = 50;

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span className={`inline-block text-xs font-bold px-1.5 py-0.5 rounded ${GRADE_COLORS[grade] ?? "bg-gray-100 text-gray-600"}`}>
      {grade}
    </span>
  );
}

function GradeScale({ gradeRanges }: { gradeRanges: ResultSheetSummary["gradeRanges"] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {GRADES.map((g) => (
        <span key={g} className="flex items-center gap-0.5">
          <GradeBadge grade={g} />
          <span className="text-xs text-gray-400">{gradeRanges[g].min}–{gradeRanges[g].max}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Grade Distribution Chart ─────────────────────────────────────────────────

function GradeChart({ results }: { results: StudentResultEntry[] }) {
  const counts = GRADES.map((g) => results.filter((r) => r.grade === g).length);
  const total = results.length;
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="flex items-end gap-3 h-40 px-2">
      {GRADES.map((grade, i) => {
        const pct = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
        const barH = Math.round((counts[i] / maxCount) * 100);
        return (
          <div key={grade} className="flex flex-col items-center flex-1 gap-1">
            <span className="text-xs font-semibold text-gray-700">{counts[i]}</span>
            <div className="w-full flex items-end" style={{ height: "100px" }}>
              <div
                className={`w-full rounded-t transition-all ${GRADE_BAR_COLORS[grade]}`}
                style={{ height: `${barH}%`, minHeight: counts[i] > 0 ? "4px" : "0" }}
              />
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${GRADE_COLORS[grade]}`}>{grade}</span>
            <span className="text-xs text-gray-400">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────

type SortKey = "studentNumber" | "markDesc" | "markAsc" | "gradeAsc" | "gradeDesc";

const GRADE_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, S: 3, W: 4, "": 5 };

function sortResults(results: StudentResultEntry[], key: SortKey): StudentResultEntry[] {
  return [...results].sort((a, b) => {
    switch (key) {
      case "studentNumber": return a.studentNumber.localeCompare(b.studentNumber);
      case "markDesc": return (b.mark as number ?? -1) - (a.mark as number ?? -1);
      case "markAsc": return (a.mark as number ?? -1) - (b.mark as number ?? -1);
      case "gradeAsc": return (GRADE_ORDER[a.grade] ?? 5) - (GRADE_ORDER[b.grade] ?? 5);
      case "gradeDesc": return (GRADE_ORDER[b.grade] ?? 5) - (GRADE_ORDER[a.grade] ?? 5);
      default: return 0;
    }
  });
}

function AnalyticsPanel({
  summary,
  data,
  loading,
  onClose,
}: {
  summary: ResultSheetSummary;
  data: ResultSheet | null;
  loading: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("studentNumber");
  const [marksPage, setMarksPage] = useState(1);

  const results = data?.results ?? [];
  const total = results.length;
  const passed = results.filter((r) => r.grade && r.grade !== "W").length;
  const failed = results.filter((r) => r.grade === "W").length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const filtered = useMemo(() => {
    let list = results;
    if (gradeFilter !== "all") {
      list = gradeFilter === "unmarked"
        ? list.filter((r) => !r.grade)
        : list.filter((r) => r.grade === gradeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.studentNumber.toLowerCase().includes(q)
      );
    }
    return sortResults(list, sortKey);
  }, [results, gradeFilter, search, sortKey]);

  // Reset marks page when filters change
  useMemo(() => { setMarksPage(1); }, [gradeFilter, search, sortKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalMarksPages = Math.ceil(filtered.length / MARKS_PAGE_SIZE);
  const pagedMarks = filtered.slice((marksPage - 1) * MARKS_PAGE_SIZE, marksPage * MARKS_PAGE_SIZE);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900 leading-tight">{summary.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Analytics</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Section A: Exam Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Exam Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Year", value: summary.year },
                { label: "Exam Date", value: summary.examDate ? new Date(summary.examDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                { label: "Institutions", value: summary.institutionCount > 0 ? `${summary.institutionCount} selected` : "All" },
                { label: "Total Students", value: total > 0 ? total : summary.studentCount },
                { label: "Passed", value: loading ? "…" : passed },
                { label: "Failed (W)", value: loading ? "…" : failed },
                { label: "Pass Rate", value: loading ? "…" : `${passRate}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{String(value)}</p>
                </div>
              ))}
            </div>
            {summary.description && (
              <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                <p className="text-xs font-medium text-indigo-600 mb-1">Exam Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary.description}</p>
              </div>
            )}
          </div>

          {/* Section B: Grade Distribution */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Grade Distribution</h3>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <GradeChart results={results} />
              </div>
            )}
          </div>

          {/* Section C: Student Marks */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Student Marks</h3>

            {/* Filter + Sort controls */}
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or number…"
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div className="relative">
                <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                >
                  <option value="all">All Grades</option>
                  {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                  <option value="unmarked">Unmarked</option>
                </select>
              </div>
              <div className="relative">
                <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                >
                  <option value="studentNumber">Student No ↑</option>
                  <option value="markDesc">Mark (High → Low)</option>
                  <option value="markAsc">Mark (Low → High)</option>
                  <option value="gradeAsc">Grade (A → W)</option>
                  <option value="gradeDesc">Grade (W → A)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-500 text-xs w-8">#</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-500 text-xs">Student No</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-500 text-xs">Name</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-500 text-xs">Subject</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-500 text-xs">Mark</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-500 text-xs">Grade</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-gray-500 text-xs">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedMarks.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-xs">
                            No students match the current filter.
                          </td>
                        </tr>
                      ) : pagedMarks.map((r, i) => (
                        <tr
                          key={r.studentId}
                          className={`border-b border-gray-100 last:border-0 ${r.grade === "W" ? "bg-red-50/60" : "hover:bg-gray-50"}`}
                        >
                          <td className="px-3 py-2.5 text-gray-400 text-xs">
                            {(marksPage - 1) * MARKS_PAGE_SIZE + i + 1}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{r.studentNumber}</td>
                          <td className="px-3 py-2.5 font-medium text-gray-800">{r.studentName}</td>
                          <td className="px-3 py-2.5 text-gray-500 text-xs">{r.subject}</td>
                          <td className="px-3 py-2.5 font-semibold text-gray-800">
                            {r.mark !== null && r.mark !== "" ? r.mark : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-3 py-2.5">
                            {r.grade ? (
                              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${GRADE_COLORS[r.grade] ?? "bg-gray-100 text-gray-600"}`}>
                                {r.grade}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-gray-400">{r.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filtered.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {filtered.length === total
                        ? `${total} students`
                        : `${filtered.length} of ${total} students`}
                    </span>
                    <Pagination page={marksPage} totalPages={totalMarksPages} onChange={setMarksPage} />
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ResultsContent() {
  const router = useRouter();
  const [sheets, setSheets] = useState<ResultSheetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResultSheetSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Analytics state
  const [analyticsTarget, setAnalyticsTarget] = useState<ResultSheetSummary | null>(null);
  const [analyticsData, setAnalyticsData] = useState<ResultSheet | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Filters
  const [filterTitle, setFilterTitle] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Pagination (client-side)
  const [sheetPage, setSheetPage] = useState(1);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.results.list();
      setSheets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load result sheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredSheets = useMemo(() => {
    return sheets.filter((s) => {
      if (filterTitle && !s.title.toLowerCase().includes(filterTitle.toLowerCase())) return false;
      if (filterYear && s.year !== filterYear) return false;
      if (filterDate && s.examDate && !s.examDate.startsWith(filterDate)) return false;
      return true;
    });
  }, [sheets, filterTitle, filterYear, filterDate]);

  const totalSheetPages = Math.ceil(filteredSheets.length / SHEET_PAGE_SIZE);
  const pagedSheets = filteredSheets.slice(
    (sheetPage - 1) * SHEET_PAGE_SIZE,
    sheetPage * SHEET_PAGE_SIZE
  );

  // Reset to page 1 when filters change
  useMemo(() => { setSheetPage(1); }, [filterTitle, filterYear, filterDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilters = filterTitle || filterYear || filterDate;

  const clearFilters = () => {
    setFilterTitle("");
    setFilterYear("");
    setFilterDate("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.results.remove(deleteTarget.id);
      setSheets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openAnalytics = (sheet: ResultSheetSummary) => {
    setAnalyticsTarget(sheet);
    setAnalyticsData(null);
    setAnalyticsLoading(true);
    api.results.get(sheet.id)
      .then(setAnalyticsData)
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  };

  const closeAnalytics = () => {
    setAnalyticsTarget(null);
    setAnalyticsData(null);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Result Management"
        subtitle="Create and manage student result sheets with grade scales."
        action={
          <button
            onClick={() => router.push("/admin/results/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Create Result Sheet
          </button>
        }
      />

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Filter bar */}
      {!loading && sheets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              placeholder="Search by title…"
              className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <input
            type="text"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            placeholder="Year (e.g. 2025)"
            className="w-32 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
          />
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sheets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-20 text-gray-400">
          <ClipboardList size={40} className="mb-3 opacity-30" />
          <p className="font-medium text-gray-500">No result sheets yet</p>
          <p className="text-sm mt-1">Click Create Result Sheet to get started.</p>
        </div>
      ) : filteredSheets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-20 text-gray-400">
          <ClipboardList size={40} className="mb-3 opacity-30" />
          <p className="font-medium text-gray-500">No result sheets match the filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Title</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Year</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Exam Date</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Grade Scale</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Institutions</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Students</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Created</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {pagedSheets.map((sheet) => (
                <tr key={sheet.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{sheet.title}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar size={14} className="text-primary" />
                      {sheet.year}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {sheet.examDate
                      ? new Date(sheet.examDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <GradeScale gradeRanges={sheet.gradeRanges} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Building2 size={14} className="text-primary" />
                      {sheet.institutionCount > 0 ? `${sheet.institutionCount} selected` : "All"}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users size={14} className="text-primary" />
                      {sheet.studentCount}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {new Date(sheet.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openAnalytics(sheet)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Analytics"
                      >
                        <BarChart2 size={15} />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/results/${sheet.id}/edit`)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(sheet)}
                        disabled={deleting}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination footer */}
          {filteredSheets.length > SHEET_PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-xs text-gray-400">
                Showing {(sheetPage - 1) * SHEET_PAGE_SIZE + 1}–{Math.min(sheetPage * SHEET_PAGE_SIZE, filteredSheets.length)} of {filteredSheets.length} result sheets
              </span>
              <Pagination page={sheetPage} totalPages={totalSheetPages} onChange={setSheetPage} />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.title}
      />

      {analyticsTarget && (
        <AnalyticsPanel
          summary={analyticsTarget}
          data={analyticsData}
          loading={analyticsLoading}
          onClose={closeAnalytics}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "TEACHER"]}>
      <ResultsContent />
    </ProtectedRoute>
  );
}
