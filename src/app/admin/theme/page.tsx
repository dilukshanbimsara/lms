"use client";

import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import PageHeader from "@/components/admin/shared/PageHeader";
import ThemeEditor from "@/components/admin/theme/ThemeEditor";

function ThemeContent() {
  return (
    <>
      <PageHeader
        title="Theme Settings"
        subtitle="Customise the website's colours and navigation visibility."
      />
      <ThemeEditor />
    </>
  );
}

export default function ThemePage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <ThemeContent />
    </ProtectedRoute>
  );
}
