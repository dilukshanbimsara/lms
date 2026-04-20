"use client";

import { useState, useEffect } from "react";
import { UserCircle, Pencil, Trash2, UserPlus } from "lucide-react";
import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import PageHeader from "@/components/admin/shared/PageHeader";
import Modal from "@/components/admin/shared/Modal";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import TeacherForm from "@/components/admin/teachers/TeacherForm";
import * as api from "@/lib/api";
import type { Teacher } from "@/types/admin";

function TeachersContent() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    api.users
      .list()
      .then((users) => {
        const found = users.find((u) => u.role === "TEACHER") ?? null;
        setTeacher(found);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data: Omit<Teacher, "id"> & { password?: string }) => {
    setError(null);
    try {
      if (modalMode === "add") {
        const created = await api.users.create({
          name: data.name,
          email: data.email,
          password: data.password!,
          phone: data.phone || undefined,
          imageUrl: data.imageUrl || undefined,
          role: "TEACHER",
        });
        setTeacher(created);
      } else if (teacher) {
        const updated = await api.users.update(teacher.id, {
          name: data.name,
          phone: data.phone || undefined,
          imageUrl: data.imageUrl || undefined,
        });
        setTeacher(updated);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save teacher");
    }
    setModalMode(null);
  };

  const handleDelete = async () => {
    if (!teacher) return;
    setError(null);
    try {
      await api.users.delete(teacher.id);
      setTeacher(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove teacher");
    }
    setShowDelete(false);
  };

  return (
    <>
      <PageHeader
        title="Teacher"
        subtitle="Only one teacher account is permitted. This account can upload and manage learning materials."
        action={
          !teacher && !loading ? (
            <button
              onClick={() => setModalMode("add")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
            >
              <UserPlus size={16} /> Setup Teacher
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : teacher ? (
        /* Teacher profile card */
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
              {teacher.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={teacher.imageUrl} alt={teacher.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={36} className="text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{teacher.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{teacher.email}</p>
                  {teacher.phone && (
                    <p className="text-sm text-gray-500">{teacher.phone}</p>
                  )}
                  <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    Teacher
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setModalMode("edit")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setShowDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <UserCircle size={40} className="text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-700">No teacher account yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Set up a teacher account to allow material uploads.</p>
          <button
            onClick={() => setModalMode("add")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
          >
            <UserPlus size={15} /> Setup Teacher
          </button>
        </div>
      )}

      <Modal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode === "add" ? "Setup Teacher Account" : "Edit Teacher"}
      >
        <TeacherForm
          initialData={modalMode === "edit" ? teacher ?? undefined : undefined}
          onSave={handleSave}
          onCancel={() => setModalMode(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        itemName={teacher?.name}
      />
    </>
  );
}

export default function TeachersPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <TeachersContent />
    </ProtectedRoute>
  );
}
