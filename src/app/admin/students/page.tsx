"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users, CheckCircle, XCircle, Ban, Trash2, RefreshCw, Eye, X,
  User, Phone, Mail, MapPin, BookOpen, Calendar, Building2, Hash, Search,
} from "lucide-react";
import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import PageHeader from "@/components/admin/shared/PageHeader";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import Pagination from "@/components/admin/shared/Pagination";
import * as api from "@/lib/api";
import type { Student, StudentStatus } from "@/types/admin";

const STATUS_STYLES: Record<StudentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  DISABLED: "bg-gray-100 text-gray-600",
  REJECTED: "bg-red-100 text-red-700",
};

const TABS: { label: string; value: StudentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Disabled", value: "DISABLED" },
  { label: "Rejected", value: "REJECTED" },
];

const LIMIT = 10;

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-primary" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

function StudentsContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StudentStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce ref for search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (opts?: {
    tab?: StudentStatus | "ALL";
    pg?: number;
    srch?: string;
    year?: string;
    level?: string;
  }) => {
    const tab = opts?.tab ?? activeTab;
    const pg = opts?.pg ?? page;
    const srch = opts?.srch !== undefined ? opts.srch : search;
    const year = opts?.year !== undefined ? opts.year : yearFilter;
    const level = opts?.level !== undefined ? opts.level : levelFilter;

    setLoading(true);
    api.students
      .list({
        status: tab !== "ALL" ? tab : undefined,
        page: pg,
        limit: LIMIT,
        search: srch.trim() || undefined,
        examYear: year || undefined,
        examLevel: level || undefined,
      })
      .then(({ data, total: t, totalPages: tp }) => {
        setStudents(data);
        setTotal(t);
        setTotalPages(tp);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: StudentStatus | "ALL") => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setYearFilter("");
    setLevelFilter("");
    load({ tab, pg: 1, srch: "", year: "", level: "" });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      load({ pg: 1, srch: val });
    }, 300);
  };

  const handleYearChange = (val: string) => {
    setYearFilter(val);
    setPage(1);
    load({ pg: 1, year: val });
  };

  const handleLevelChange = (val: string) => {
    setLevelFilter(val);
    setPage(1);
    load({ pg: 1, level: val });
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    load({ pg: p });
  };

  const clearFilters = () => {
    setSearch("");
    setYearFilter("");
    setLevelFilter("");
    setPage(1);
    load({ pg: 1, srch: "", year: "", level: "" });
  };

  const hasFilters = search || yearFilter || levelFilter;

  const handleAction = async (action: () => Promise<Student | void>, id: string) => {
    setActionLoading(id);
    setError(null);
    try {
      const result = await action();
      if (result) {
        setStudents((prev) => prev.map((s) => (s.id === result.id ? result : s)));
        if (selected?.id === result.id) setSelected(result);
      } else {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        if (selected?.id === id) setSelected(null);
        setTotal((t) => Math.max(0, t - 1));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (s: Student) =>
    handleAction(() => api.students.approve(s.id), s.id);

  const handleReject = (s: Student) =>
    handleAction(() => api.students.reject(s.id), s.id);

  const handleToggle = (s: Student) =>
    handleAction(() => api.students.toggleStatus(s.id), s.id);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await handleAction(() => api.students.delete(deleteTarget.id), deleteTarget.id);
    setDeleteTarget(null);
  };

  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  return (
    <>
      <PageHeader
        title="Student Management"
        subtitle="Review, approve, and manage student registrations."
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.value
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or student no…"
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <input
          type="text"
          value={yearFilter}
          onChange={(e) => handleYearChange(e.target.value)}
          placeholder="Year (e.g. 2025)"
          className="w-32 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
        <select
          value={levelFilter}
          onChange={(e) => handleLevelChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
        >
          <option value="">All Levels</option>
          <option value="AL">A/L</option>
          <option value="OL">O/L</option>
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <Users size={36} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No students found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student No.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Year / Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                  const busy = actionLoading === student.id;
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{student.studentNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">{student.subject}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                        {student.examYear} {student.examLevel === "AL" ? "A/L" : "O/L"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[student.status]}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelected(student)}
                            title="View details"
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Eye size={15} />
                          </button>

                          {student.status === "PENDING" && (
                            <button
                              onClick={() => handleApprove(student)}
                              disabled={busy}
                              title="Approve"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}

                          {student.status === "PENDING" && (
                            <button
                              onClick={() => handleReject(student)}
                              disabled={busy}
                              title="Reject"
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            >
                              <XCircle size={15} />
                            </button>
                          )}

                          {student.status === "ACTIVE" && (
                            <button
                              onClick={() => handleToggle(student)}
                              disabled={busy}
                              title="Disable"
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-40"
                            >
                              <Ban size={15} />
                            </button>
                          )}

                          {student.status === "DISABLED" && (
                            <button
                              onClick={() => handleToggle(student)}
                              disabled={busy}
                              title="Enable"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                            >
                              <RefreshCw size={15} />
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteTarget(student)}
                            disabled={busy}
                            title="Delete"
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                {total === 0 ? "No students" : `Showing ${start}–${end} of ${total} students`}
              </p>
              <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-900">{selected.name}</h3>
                <p className="text-xs font-mono text-gray-400">{selected.studentNumber}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {selected.profileImageUrl ? (
                  <img src={selected.profileImageUrl} alt={selected.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={20} className="text-primary" />
                )}
              </div>
              <div>
                <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[selected.status]}`}>
                  {selected.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  Registered {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="px-6 py-2">
              <DetailRow icon={Hash} label="Student Number" value={selected.studentNumber} />
              <DetailRow icon={Mail} label="Email" value={selected.email} />
              <DetailRow icon={Phone} label="Contact Number" value={selected.phone} />
              <DetailRow icon={MapPin} label="Address" value={selected.address} />
              <DetailRow icon={BookOpen} label="Subject" value={selected.subject} />
              <DetailRow icon={Calendar} label="Exam Year & Level" value={`${selected.examYear} ${selected.examLevel === "AL" ? "A/L" : "O/L"}`} />
              <DetailRow icon={Building2} label="Institution" value={selected.institution?.name ?? (selected.institutionId ? "—" : "Online")} />
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap gap-2">
              {selected.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleApprove(selected)}
                    disabled={actionLoading === selected.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(selected)}
                    disabled={actionLoading === selected.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </>
              )}
              {selected.status === "ACTIVE" && (
                <button
                  onClick={() => handleToggle(selected)}
                  disabled={actionLoading === selected.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  <Ban size={14} /> Disable
                </button>
              )}
              {selected.status === "DISABLED" && (
                <button
                  onClick={() => handleToggle(selected)}
                  disabled={actionLoading === selected.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} /> Enable
                </button>
              )}
              <button
                onClick={() => { setSelected(null); setDeleteTarget(selected); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
              <button
                onClick={() => setSelected(null)}
                className="ml-auto px-3 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name}
      />
    </>
  );
}

export default function StudentsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "TEACHER"]}>
      <StudentsContent />
    </ProtectedRoute>
  );
}
