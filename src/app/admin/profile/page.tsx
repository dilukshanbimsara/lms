"use client";

import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import PageHeader from "@/components/admin/shared/PageHeader";
import ProfileForm from "@/components/admin/profile/ProfileForm";
import { useAuth } from "@/contexts/AuthContext";

function ProfileContent() {
  const { user, updateProfile } = useAuth();

  if (!user) return null;

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Update your personal contact details and profile image."
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-5 pb-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            Role:{" "}
            <span className={`font-semibold ${user.role === "SUPER_ADMIN" ? "text-primary" : "text-green-600"}`}>
              {user.role === "SUPER_ADMIN" ? "Super Admin" : "Teacher"}
            </span>
          </p>
        </div>
        <ProfileForm user={user} onSave={updateProfile} />
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "TEACHER"]}>
      <ProfileContent />
    </ProtectedRoute>
  );
}
