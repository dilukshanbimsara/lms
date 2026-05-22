"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Target, CheckCircle, Circle, Trash2, Plus, BookOpen,
  Quote, TrendingUp, Hash, Sparkles, ClipboardList, BarChart2,
  Search, Calendar, ChevronDown, Loader2,
} from "lucide-react";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import * as api from "@/lib/api";
import type { StudentMyResult, StudentExamDetail } from "@/types/admin";

// ─── Constants ────────────────────────────────────────────────────────────────

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Education is the passport to the future.", author: "Malcolm X" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
];

const GRADE_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  A: { bg: "bg-green-100", text: "text-green-700", bar: "#4ade80" },
  B: { bg: "bg-blue-100", text: "text-blue-700", bar: "#60a5fa" },
  C: { bg: "bg-yellow-100", text: "text-yellow-700", bar: "#facc15" },
  S: { bg: "bg-orange-100", text: "text-orange-700", bar: "#fb923c" },
  W: { bg: "bg-red-100", text: "text-red-700", bar: "#f87171" },
};

type TabId = "goals" | "results" | "progress" | "position";

interface Goal {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

// ─── Grade Pill ───────────────────────────────────────────────────────────────

function GradePill({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-gray-300 text-xs">—</span>;
  const c = GRADE_COLORS[grade] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      {grade}
    </span>
  );
}

// ─── SVG Line Chart (Progress Tab) ───────────────────────────────────────────

function ProgressChart({ data }: { data: { title: string; examDate: string; mark: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-gray-400">
        <TrendingUp size={36} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">Not enough data yet</p>
        <p className="text-xs mt-1">You need results from at least 2 exams to see your progress.</p>
      </div>
    );
  }

  const W = 560; const H = 220; const PAD = { t: 20, r: 20, b: 40, l: 40 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const xStep = innerW / (data.length - 1);

  const toX = (i: number) => PAD.l + i * xStep;
  const toY = (mark: number) => PAD.t + innerH - (mark / 100) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.mark)}`).join(" ");

  // Y-axis grid lines at 0, 25, 50, 75, 100
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: "320px" }}>
        {/* Grid lines */}
        {yTicks.map((v) => {
          const y = toY(v);
          return (
            <g key={v}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
            </g>
          );
        })}

        {/* Polyline */}
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-primary, #6366f1)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Area fill */}
        <polygon
          points={`${PAD.l},${PAD.t + innerH} ${points} ${toX(data.length - 1)},${PAD.t + innerH}`}
          fill="var(--color-primary, #6366f1)"
          fillOpacity="0.08"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const cx = toX(i);
          const cy = toY(d.mark);
          const isHovered = hovered === i;
          return (
            <g key={i}>
              <circle
                cx={cx} cy={cy}
                r={isHovered ? 7 : 5}
                fill="var(--color-primary, #6366f1)"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "r 0.15s" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={cx - 60} y={cy - 50}
                    width={120} height={42}
                    rx="6" fill="#1f2937"
                    opacity="0.92"
                  />
                  <text x={cx} y={cy - 33} textAnchor="middle" fontSize="11" fill="white" fontWeight="600">
                    {d.mark}/100
                  </text>
                  <text x={cx} y={cy - 18} textAnchor="middle" fontSize="9.5" fill="#d1d5db">
                    {d.title.length > 18 ? d.title.slice(0, 18) + "…" : d.title}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {d.examDate ? new Date(d.examDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : `Exam ${i + 1}`}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Class Position Bar (My Position Tab) ────────────────────────────────────

function ClassPositionBar({ detail }: { detail: StudentExamDetail }) {
  const BAR_H = 340;
  const W = 120; const PAD_L = 46; const PAD_R = 36;
  const totalW = PAD_L + W + PAD_R;

  const { gradeRanges, allMarks, studentMark, studentRank, totalMarked, totalStudents } = detail;
  const grades = ["A", "B", "C", "S", "W"] as const;

  const markToY = (mark: number) => BAR_H - (mark / 100) * BAR_H;

  // Grade band zones
  const gradeBands = grades.map((g) => {
    const r = (gradeRanges as any)[g] as { min: number; max: number };
    return {
      grade: g,
      y1: markToY(r.max),
      y2: markToY(r.min),
      color: GRADE_COLORS[g]?.bar ?? "#e5e7eb",
    };
  });

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="space-y-4">
      {/* Rank summary */}
      {studentRank !== null ? (
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            #{studentRank}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              You ranked <span className="text-primary">#{studentRank}</span> out of <span className="text-primary">{totalMarked}</span> marked students
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{totalStudents} total students in this exam</p>
          </div>
          {studentMark !== null && (
            <div className="ml-auto text-right">
              <p className="text-lg font-bold text-primary">{studentMark}</p>
              <p className="text-xs text-gray-400">/ 100</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
          Your mark has not been entered for this exam yet.
        </div>
      )}

      {/* Visualization */}
      <div className="flex justify-center">
        <svg viewBox={`0 0 ${totalW} ${BAR_H + 30}`} style={{ height: "380px", width: "auto" }}>
          {/* Grade band backgrounds */}
          {gradeBands.map(({ grade, y1, y2, color }) => (
            <g key={grade}>
              <rect x={PAD_L} y={y1} width={W} height={y2 - y1} fill={color} opacity="0.18" />
              <text
                x={PAD_L + W + 6}
                y={(y1 + y2) / 2 + 4}
                fontSize="11"
                fontWeight="600"
                fill={color}
              >{grade}</text>
            </g>
          ))}

          {/* Bar border */}
          <rect x={PAD_L} y={0} width={W} height={BAR_H} fill="none" stroke="#e5e7eb" strokeWidth="1" rx="4" />

          {/* Y-axis ticks */}
          {yTicks.map((v) => {
            const y = markToY(v);
            return (
              <g key={v}>
                <line x1={PAD_L - 4} y1={y} x2={PAD_L} y2={y} stroke="#d1d5db" strokeWidth="1" />
                <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
              </g>
            );
          })}

          {/* All student dots */}
          {allMarks.map((entry, i) => {
            if (entry.mark === null || entry.isCurrentStudent) return null;
            const y = markToY(entry.mark);
            return (
              <line
                key={i}
                x1={PAD_L + 6}
                y1={y}
                x2={PAD_L + W - 6}
                y2={y}
                stroke="#94a3b8"
                strokeWidth="1.5"
                opacity="0.55"
              />
            );
          })}

          {/* Current student marker */}
          {studentMark !== null && (
            <g>
              <line
                x1={PAD_L - 2}
                y1={markToY(studentMark)}
                x2={PAD_L + W + 2}
                y2={markToY(studentMark)}
                stroke="var(--color-primary, #6366f1)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx={PAD_L + W / 2}
                cy={markToY(studentMark)}
                r="7"
                fill="var(--color-primary, #6366f1)"
                stroke="white"
                strokeWidth="2"
              />
              {/* Label */}
              <rect
                x={PAD_L - 46}
                y={markToY(studentMark) - 11}
                width={40}
                height={22}
                rx="5"
                fill="var(--color-primary, #6366f1)"
              />
              <text
                x={PAD_L - 26}
                y={markToY(studentMark) + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="white"
              >{studentMark}</text>
            </g>
          )}

          {/* Axis labels */}
          <text x={PAD_L + W / 2} y={BAR_H + 20} textAnchor="middle" fontSize="10" fill="#9ca3af">Mark (0–100)</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center flex-wrap text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-8 h-0.5 bg-slate-400 opacity-55" /> Other students
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded-full bg-primary" /> You
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BetterMePage() {
  const { student } = useStudentAuth();

  // Tab
  const [activeTab, setActiveTab] = useState<TabId>("goals");

  // Goals / Notes (localStorage, per-student)
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [notes, setNotes] = useState("");
  const [daysTracking, setDaysTracking] = useState(0);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Results
  const [myResults, setMyResults] = useState<StudentMyResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Progress
  const [progressPeriod, setProgressPeriod] = useState<"all" | "6m" | "1y">("all");

  // My Position
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [examDetail, setExamDetail] = useState<StudentExamDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const todayQuote = QUOTES[Math.floor(Date.now() / 86_400_000) % QUOTES.length];

  // Load localStorage data once student is known
  useEffect(() => {
    if (!student) return;

    const savedGoals = localStorage.getItem(`bm_goals_${student.id}`);
    if (savedGoals) setGoals(JSON.parse(savedGoals) as Goal[]);

    const savedNotes = localStorage.getItem(`bm_notes_${student.id}`);
    if (savedNotes) setNotes(savedNotes);

    const startKey = `bm_start_${student.id}`;
    let startTs = parseInt(localStorage.getItem(startKey) ?? "0", 10);
    if (!startTs) {
      startTs = Date.now();
      localStorage.setItem(startKey, String(startTs));
    }
    setDaysTracking(Math.max(1, Math.floor((Date.now() - startTs) / 86_400_000) + 1));
  }, [student]);

  // Load results once (lazy on first non-goals tab visit)
  useEffect(() => {
    if (activeTab === "goals" || myResults.length > 0 || loadingResults) return;
    setLoadingResults(true);
    setResultsError("");
    api.studentResults.list()
      .then(setMyResults)
      .catch((e) => setResultsError(e instanceof Error ? e.message : "Failed to load results"))
      .finally(() => setLoadingResults(false));
  }, [activeTab, myResults.length, loadingResults]);

  // Fetch exam detail when position tab exam changes
  useEffect(() => {
    if (!selectedSheetId) return;
    setExamDetail(null);
    setLoadingDetail(true);
    api.studentResults.getDetail(selectedSheetId)
      .then(setExamDetail)
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  }, [selectedSheetId]);

  // Goals helpers
  const saveGoals = (updated: Goal[]) => {
    if (!student) return;
    setGoals(updated);
    localStorage.setItem(`bm_goals_${student.id}`, JSON.stringify(updated));
  };
  const addGoal = () => {
    if (!newGoal.trim()) return;
    saveGoals([{ id: `${Date.now()}-${Math.random()}`, text: newGoal.trim(), done: false, createdAt: Date.now() }, ...goals]);
    setNewGoal("");
  };
  const toggleGoal = (id: string) => saveGoals(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  const deleteGoal = (id: string) => saveGoals(goals.filter((g) => g.id !== id));
  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      if (student) localStorage.setItem(`bm_notes_${student.id}`, val);
    }, 500);
  };

  // Filtered results list
  const filteredResults = useMemo(() => {
    let list = myResults;
    if (titleFilter.trim()) {
      const q = titleFilter.trim().toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    if (startDate) list = list.filter((r) => r.examDate >= startDate);
    if (endDate) list = list.filter((r) => r.examDate <= endDate);
    return list;
  }, [myResults, titleFilter, startDate, endDate]);

  // Progress chart data
  const progressData = useMemo(() => {
    const now = Date.now();
    let cutoff = 0;
    if (progressPeriod === "6m") cutoff = now - 6 * 30 * 24 * 60 * 60 * 1000;
    if (progressPeriod === "1y") cutoff = now - 365 * 24 * 60 * 60 * 1000;

    return myResults
      .filter((r) => r.mark !== null && r.examDate)
      .filter((r) => !cutoff || new Date(r.examDate).getTime() >= cutoff)
      .sort((a, b) => a.examDate.localeCompare(b.examDate))
      .map((r) => ({ title: r.title, examDate: r.examDate, mark: r.mark as number }));
  }, [myResults, progressPeriod]);

  // Overall stats
  const markedResults = myResults.filter((r) => r.mark !== null);
  const avgMark = markedResults.length
    ? Math.round(markedResults.reduce((s, r) => s + (r.mark as number), 0) / markedResults.length)
    : null;
  const bestMark = markedResults.length ? Math.max(...markedResults.map((r) => r.mark as number)) : null;

  const completed = goals.filter((g) => g.done).length;
  const totalGoals = goals.length;

  if (!student) return null;

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "goals", label: "Goals", icon: <Target size={14} /> },
    { id: "results", label: "My Results", icon: <ClipboardList size={14} /> },
    { id: "progress", label: "Progress", icon: <TrendingUp size={14} /> },
    { id: "position", label: "My Position", icon: <BarChart2 size={14} /> },
  ];

  return (
    <div className="space-y-6">

      {/* Hero header */}
      <div className="bg-primary rounded-2xl px-6 py-8 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-white/70" />
              <span className="text-white/70 text-sm font-medium">Better Me</span>
            </div>
            <h1 className="text-3xl font-bold">Hello, {student.name.split(" ")[0]}!</h1>
            <p className="text-white/70 mt-1 text-sm">Track your journey. Stay motivated. Keep improving.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg">
              <Hash size={13} />
              <span className="font-mono text-sm font-semibold">{student.studentNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg text-sm">
              <TrendingUp size={13} />
              <span>Day {daysTracking} of your journey</span>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        {markedResults.length > 0 && (
          <div className="mt-5 flex gap-3 flex-wrap">
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center min-w-[70px]">
              <p className="text-lg font-bold">{markedResults.length}</p>
              <p className="text-xs text-white/70">Exams</p>
            </div>
            {avgMark !== null && (
              <div className="bg-white/15 rounded-xl px-3 py-2 text-center min-w-[70px]">
                <p className="text-lg font-bold">{avgMark}</p>
                <p className="text-xs text-white/70">Avg Mark</p>
              </div>
            )}
            {bestMark !== null && (
              <div className="bg-white/15 rounded-xl px-3 py-2 text-center min-w-[70px]">
                <p className="text-lg font-bold">{bestMark}</p>
                <p className="text-xs text-white/70">Best Mark</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium flex-1 justify-center border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: Goals ───────────────────────────────────────────────── */}
        {activeTab === "goals" && (
          <div className="p-5 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">

              {/* Study Goals */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-primary" />
                    <h2 className="font-semibold text-gray-900">Study Goals</h2>
                  </div>
                  {totalGoals > 0 && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {completed} / {totalGoals} done
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text" value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addGoal(); }}
                    placeholder="Add a new study goal..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                  <button
                    onClick={addGoal} disabled={!newGoal.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                {totalGoals > 0 && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(completed / totalGoals) * 100}%` }} />
                    </div>
                  </div>
                )}
                {goals.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Target size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No goals yet. Add your first study goal above!</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {goals.map((goal) => (
                      <li key={goal.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${goal.done ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                        <button onClick={() => toggleGoal(goal.id)} className={`flex-shrink-0 transition-colors ${goal.done ? "text-green-600" : "text-gray-400 hover:text-primary"}`}>
                          {goal.done ? <CheckCircle size={18} /> : <Circle size={18} />}
                        </button>
                        <span className={`flex-1 text-sm ${goal.done ? "line-through text-gray-400" : "text-gray-800"}`}>{goal.text}</span>
                        <button onClick={() => deleteGoal(goal.id)} className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Study Notes */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={18} className="text-primary" />
                  <h2 className="font-semibold text-gray-900">My Study Notes</h2>
                  <span className="text-xs text-gray-400 ml-auto">Auto-saved</span>
                </div>
                <textarea
                  value={notes} onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Write your study notes, key concepts, reminders, or anything that helps you learn..."
                  rows={8}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-y bg-gray-50"
                />
              </div>
            </div>

            {/* Right column: Quote + Stats */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Quote size={15} className="text-primary" />
                  <h2 className="font-semibold text-gray-900 text-sm">Quote of the Day</h2>
                </div>
                <blockquote className="text-gray-700 text-sm leading-relaxed italic">&ldquo;{todayQuote.text}&rdquo;</blockquote>
                <p className="text-xs text-gray-400 mt-3 font-medium">— {todayQuote.author}</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={15} className="text-primary" />
                  <h2 className="font-semibold text-gray-900 text-sm">Your Progress</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{completed}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Goals Done</p>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{totalGoals}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Goals</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center col-span-2">
                    <p className="text-2xl font-bold text-green-600">{daysTracking}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Days Tracking</p>
                  </div>
                </div>
                {totalGoals > 0 && completed === totalGoals && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-sm font-semibold text-green-700">All goals complete!</p>
                    <p className="text-xs text-green-500 mt-0.5">Add more to keep the momentum going.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: My Results ──────────────────────────────────────────── */}
        {activeTab === "results" && (
          <div className="p-5 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  placeholder="Search by title…"
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div className="relative">
                <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-7 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  title="From date"
                />
              </div>
              <div className="relative">
                <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date" value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-7 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  title="To date"
                />
              </div>
              {(titleFilter || startDate || endDate) && (
                <button
                  onClick={() => { setTitleFilter(""); setStartDate(""); setEndDate(""); }}
                  className="px-3 py-2 text-xs text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {loadingResults ? (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : resultsError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{resultsError}</div>
            ) : filteredResults.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400">
                <ClipboardList size={36} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">{myResults.length === 0 ? "No results yet" : "No results match your filter"}</p>
                <p className="text-xs mt-1">{myResults.length === 0 ? "Your results will appear here once your teacher enters them." : "Try adjusting the filters above."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResults.map((r) => (
                  <div key={r.sheetId} className="border border-gray-200 rounded-xl p-4 hover:border-primary/40 hover:bg-primary/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{r.title}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={11} />
                            {r.examDate ? new Date(r.examDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : r.year}
                          </span>
                          <span className="text-xs text-gray-400">{r.totalStudents} students</span>
                        </div>
                        {r.note && <p className="text-xs text-gray-500 mt-2 italic">"{r.note}"</p>}
                        {r.description && <p className="text-xs text-gray-400 mt-1">{r.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.mark !== null ? (
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">{r.mark}<span className="text-xs font-normal text-gray-400">/100</span></p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Not marked</span>
                        )}
                        <GradePill grade={r.grade} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Progress ────────────────────────────────────────────── */}
        {activeTab === "progress" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-gray-700">Mark Progress Over Time</h3>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(["all", "1y", "6m"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProgressPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${progressPeriod === p ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    {p === "all" ? "All Time" : p === "1y" ? "Last Year" : "Last 6 Mo"}
                  </button>
                ))}
              </div>
            </div>

            {loadingResults ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <ProgressChart data={progressData} />
              </div>
            )}

            {progressData.length >= 2 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Exams Plotted", value: progressData.length },
                  { label: "Highest Mark", value: Math.max(...progressData.map((d) => d.mark)) },
                  { label: "Latest Mark", value: progressData[progressData.length - 1].mark },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center">
                    <p className="text-lg font-bold text-gray-800">{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: My Position ─────────────────────────────────────────── */}
        {activeTab === "position" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-semibold text-gray-700">Your Class Position</h3>
              <div className="relative">
                <select
                  value={selectedSheetId}
                  onChange={(e) => setSelectedSheetId(e.target.value)}
                  className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white appearance-none"
                >
                  <option value="">Select an exam…</option>
                  {myResults.map((r) => (
                    <option key={r.sheetId} value={r.sheetId}>
                      {r.title} {r.examDate ? `(${new Date(r.examDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {!selectedSheetId ? (
              <div className="flex flex-col items-center py-12 text-gray-400">
                <BarChart2 size={36} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">Select an exam to see your position</p>
                <p className="text-xs mt-1">Compare yourself against all students in the class.</p>
              </div>
            ) : loadingDetail ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
            ) : examDetail ? (
              <ClassPositionBar detail={examDetail} />
            ) : null}

            {/* Overall stats across all exams */}
            {markedResults.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Overall Stats (All Exams)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center">
                    <p className="text-lg font-bold text-gray-800">{markedResults.length}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Exams Taken</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center">
                    <p className="text-lg font-bold text-primary">{avgMark ?? "—"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Avg Mark</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center">
                    <p className="text-lg font-bold text-green-600">{bestMark ?? "—"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Best Mark</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
