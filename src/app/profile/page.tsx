"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  User, Phone, Mail, MapPin, BookOpen, Calendar, Building2,
  Hash, Pencil, X, CheckCircle,
} from "lucide-react";
import { students } from "@/lib/api";
import type { Student } from "@/types/admin";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:   "bg-green-100 text-green-700",
  PENDING:  "bg-yellow-100 text-yellow-700",
  DISABLED: "bg-gray-100 text-gray-600",
  REJECTED: "bg-red-100 text-red-700",
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-primary" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editError, setEditError] = useState("");

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("student_auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    students
      .me()
      .then((s) => { setProfile(s); setLoading(false); })
      .catch(() => { router.replace("/login"); });
  }, [router]);

  const openEdit = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditPhone(profile.phone);
    setEditAddress(profile.address);
    setEditImageUrl(profile.profileImageUrl ?? "");
    setEditError("");
    setSaveSuccess(false);
    setEditing(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setEditError("");
    try {
      const updated = await students.updateProfile({
        name: editName,
        phone: editPhone,
        address: editAddress,
        profileImageUrl: editImageUrl || undefined,
      });
      setProfile(updated);
      // Sync name in localStorage so navbar updates
      const raw = localStorage.getItem("student_user");
      if (raw) {
        try {
          const s = JSON.parse(raw);
          localStorage.setItem("student_user", JSON.stringify({ ...s, name: updated.name }));
        } catch {}
      }
      setSaveSuccess(true);
      setTimeout(() => { setEditing(false); setSaveSuccess(false); }, 1200);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const institutionName =
    profile.institution?.name ?? (profile.institutionId ? "—" : "Online");

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4 space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Your student registration details.</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Avatar + banner */}
          <div className="bg-primary px-6 py-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={36} className="text-white/80" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white truncate">{profile.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Hash size={13} className="text-white/60" />
                <span className="text-white font-mono text-sm font-semibold">{profile.studentNumber}</span>
              </div>
              <span
                className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  STATUS_STYLES[profile.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {profile.status}
              </span>
            </div>
            <button
              onClick={openEdit}
              className="flex-shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          {/* Details */}
          <div className="px-6 py-2">
            <InfoRow icon={Mail}      label="Email"             value={profile.email} />
            <InfoRow icon={Phone}     label="Contact Number"    value={profile.phone} />
            <InfoRow icon={MapPin}    label="Address"           value={profile.address} />
            <InfoRow icon={BookOpen}  label="Subject"           value={profile.subject} />
            <InfoRow icon={Calendar}  label="Exam Year & Level" value={`${profile.examYear} ${profile.examLevel === "AL" ? "A/L" : "O/L"}`} />
            <InfoRow icon={Building2} label="Institution"       value={institutionName} />
          </div>
        </div>

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-700">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                {editError && (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                    {editError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg">
                    <CheckCircle size={15} /> Saved!
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    rows={2}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex-1 bg-primary text-white text-sm font-semibold py-2 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-60"
                  >
                    {saveLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
