"use client";

import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import PageHeader from "@/components/admin/shared/PageHeader";
import AboutEditor from "@/components/admin/about/AboutEditor";

function AboutContent() {
  return (
    <>
      <PageHeader
        title="About Section"
        subtitle="Manage the teacher profile and biography shown on the public home page."
      />
      <AboutEditor />
    </>
  );
}

export default function AboutPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <AboutContent />
    </ProtectedRoute>
  );
}
