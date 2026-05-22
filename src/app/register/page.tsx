"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff, CheckCircle, X } from "lucide-react";
import { students, publicClasses, publicInstitutions } from "@/lib/api";
import type { AdminClassCategory, AdminInstitution } from "@/types/admin";

const EXAM_YEARS = ["2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032"];
const EXAM_LEVELS = [
  { value: "AL", label: "A/L" },
  { value: "OL", label: "O/L" },
];

function getPasswordStrength(pw: string): { label: string; color: string; score: number } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[a-zA-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[!@#$%^&*()\-_=+,.?":{}|<>]/.test(pw)) score++;
  if (score <= 2) return { label: "Weak", color: "bg-red-400", score };
  if (score <= 3) return { label: "Fair", color: "bg-yellow-400", score };
  return { label: "Strong", color: "bg-green-500", score };
}

interface SubjectOption {
  subject: string;
  subjectCode: string;
  classItemId: string;
}

export default function RegisterPage() {
  const [categories, setCategories] = useState<AdminClassCategory[]>([]);
  const [institutions, setInstitutions] = useState<AdminInstitution[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // subject selection
  const [selectedSubject, setSelectedSubject] = useState<SubjectOption | null>(null);
  const [subjectLocked, setSubjectLocked] = useState(false);

  // form fields
  const [examYear, setExamYear] = useState("2027");
  const [examLevel, setExamLevel] = useState("AL");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([publicClasses.list(), publicInstitutions.list()]).then(([cats, insts]) => {
      setCategories(cats);
      setInstitutions(insts);
      setLoadingData(false);
    });
  }, []);

  // Deduplicate subjects from all class items
  const subjectOptions: SubjectOption[] = [];
  const seen = new Set<string>();
  for (const cat of categories) {
    for (const item of cat.items) {
      const key = item.subject.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        subjectOptions.push({
          subject: item.subject,
          subjectCode: item.subjectCode ?? item.subject.replace(/\s+/g, "").substring(0, 6).toUpperCase(),
          classItemId: item.id,
        });
      }
    }
  }

  const strength = getPasswordStrength(password);

  const validate = (): string | null => {
    if (!selectedSubject) return "Please select a subject.";
    if (!name.trim()) return "Name is required.";
    if (!email.trim()) return "Email is required.";
    if (!phone.trim()) return "Contact number is required.";
    if (!address.trim()) return "Address is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[a-zA-Z]/.test(password)) return "Password must contain letters.";
    if (!/\d/.test(password)) return "Password must contain numbers.";
    if (!/[!@#$%^&*()\-_=+,.?":{}|<>]/.test(password)) return "Password must contain symbols.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await students.register({
        email: email.trim(),
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        examYear,
        examLevel,
        subject: selectedSubject!.subject,
        subjectCode: selectedSubject!.subjectCode,
        classItemId: selectedSubject!.classItemId,
        institutionId: institutionId || undefined,
        password,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Your registration is pending approval. You will be notified once your account is activated.
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="w-full max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-7 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-3">
              <GraduationCap size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Student Registration</h1>
            <p className="text-white/70 text-sm mt-1">TutioLMS</p>
          </div>

          <div className="px-8 py-8">
            <p className="text-sm text-gray-500 mb-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <X size={16} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                {subjectLocked && selectedSubject ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-700 font-medium">
                      {selectedSubject.subject}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSubjectLocked(false); setSelectedSubject(null); }}
                      className="text-xs text-primary hover:underline whitespace-nowrap"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedSubject?.subject ?? ""}
                    onChange={(e) => {
                      const opt = subjectOptions.find((s) => s.subject === e.target.value) ?? null;
                      setSelectedSubject(opt);
                      if (opt) setSubjectLocked(true);
                    }}
                    required
                    disabled={loadingData}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-white"
                  >
                    <option value="">{loadingData ? "Loading subjects..." : "— Select a subject —"}</option>
                    {subjectOptions.map((s) => (
                      <option key={s.classItemId} value={s.subject}>
                        {s.subject}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Exam Year + Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Exam Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-white"
                  >
                    {EXAM_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={examLevel}
                    onChange={(e) => setExamLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-white"
                  >
                    {EXAM_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07X XXX XXXX"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your home address"
                  required
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
                />
              </div>

              {/* Institution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Institution
                </label>
                <select
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-white"
                >
                  <option value="">Online (no physical institution)</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars with letters, numbers & symbols"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${strength.color}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{strength.label}</span>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Must include letters, numbers, and symbols.</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-400 focus:border-red-400"
                        : "border-gray-300 focus:border-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Submitting..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
