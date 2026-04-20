"use client";

import { useState, useEffect } from "react";
import { Image, Building2, User, BookOpen, UserCircle } from "lucide-react";
import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import StatCard from "@/components/admin/shared/StatCard";
import PageHeader from "@/components/admin/shared/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";
import type { Banner, AdminInstitution, Teacher, LearningMaterial } from "@/types/admin";

function DashboardContent() {
  const { user } = useAuth();
  const [bannerList, setBannerList] = useState<Banner[]>([]);
  const [institutionList, setInstitutionList] = useState<AdminInstitution[]>([]);
  const [teacherList, setTeacherList] = useState<Teacher[]>([]);
  const [materialList, setMaterialList] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role === "SUPER_ADMIN") {
      Promise.all([
        api.banners.list(),
        api.institutions.list(),
        api.users.list(),
        api.materials.list(),
      ])
        .then(([b, i, t, m]) => {
          setBannerList(b);
          setInstitutionList(i);
          setTeacherList(t);
          setMaterialList(m);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      api.materials
        .list()
        .then((m) => setMaterialList(m))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const myMaterials = materialList.filter((m) => m.uploadedBy === user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user?.role === "SUPER_ADMIN") {
    return (
      <>
        <PageHeader title="Dashboard" subtitle={`Welcome back, ${user.name}`} />
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Banners"
            value={bannerList.length}
            icon={Image}
            href="/admin/banners"
            color="primary"
          />
          <StatCard
            title="Institutions"
            value={institutionList.length}
            icon={Building2}
            href="/admin/institutions"
            color="accent"
          />
          <StatCard
            title="Teacher"
            value={teacherList.filter((t) => t.role === "TEACHER").length ? "Set up" : "Not set up"}
            icon={User}
            href="/admin/teachers"
            color="green"
          />
          <StatCard
            title="Materials"
            value={materialList.length}
            icon={BookOpen}
            href="/admin/learning-centre"
            color="red"
          />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Banners</h3>
            <div className="space-y-2">
              {bannerList.length === 0 ? (
                <p className="text-sm text-gray-400">No banners yet.</p>
              ) : (
                bannerList.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm text-gray-700 truncate">{b.title}</span>
                    <span
                      className={`ml-3 px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${
                        b.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Institutions Overview</h3>
            <div className="space-y-2">
              {institutionList.length === 0 ? (
                <p className="text-sm text-gray-400">No institutions yet.</p>
              ) : (
                institutionList.map((inst) => (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm text-gray-700 truncate">{inst.name}</span>
                    <span className="ml-3 text-xs text-gray-400 flex-shrink-0">
                      {inst.timetable.length} classes
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // TEACHER view
  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${user?.name}`} />
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="My Materials"
          value={myMaterials.length}
          icon={BookOpen}
          href="/admin/learning-centre"
          color="primary"
        />
        <StatCard
          title="My Profile"
          value="Update"
          icon={UserCircle}
          href="/admin/profile"
          color="green"
        />
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">My Recent Materials</h3>
        {myMaterials.length === 0 ? (
          <p className="text-sm text-gray-400">No materials uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {myMaterials.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-700 truncate">{m.title}</span>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                    {m.type}
                  </span>
                  <span className="text-xs text-gray-400">{m.level}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "TEACHER"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
