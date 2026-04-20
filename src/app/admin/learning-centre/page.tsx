"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import PageHeader from "@/components/admin/shared/PageHeader";
import DataTable from "@/components/admin/shared/DataTable";
import Modal from "@/components/admin/shared/Modal";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import MaterialForm from "@/components/admin/learning-centre/MaterialForm";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { LearningMaterial, ModalMode, Column } from "@/types/admin";

const TYPE_COLORS: Record<string, string> = {
  PDF: "bg-red-100 text-red-700",
  NOTE: "bg-blue-100 text-blue-700",
  VIDEO: "bg-purple-100 text-purple-700",
};

function LearningCentreContent() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<LearningMaterial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LearningMaterial | null>(null);

  useEffect(() => {
    api.materials
      .list()
      .then(setMaterials)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<LearningMaterial>[] = [
    { key: "title", header: "Title" },
    { key: "subject", header: "Subject" },
    {
      key: "level",
      header: "Level",
      width: "80px",
      render: (val) => (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
          {val as string}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "80px",
      render: (val) => (
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            TYPE_COLORS[val as string] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {val as string}
        </span>
      ),
    },
    { key: "createdAt", header: "Date", width: "120px" },
  ];

  const openAdd = () => {
    setSelected(null);
    setModalMode("add");
  };
  const openEdit = (m: LearningMaterial) => {
    setSelected(m);
    setModalMode("edit");
  };
  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
  };

  const handleSave = async (data: Omit<LearningMaterial, "id" | "createdAt">) => {
    setError(null);
    try {
      if (modalMode === "add") {
        const created = await api.materials.create(data);
        setMaterials((prev) => [created, ...prev]);
      } else if (selected) {
        const updated = await api.materials.update(selected.id, data);
        setMaterials((prev) =>
          prev.map((m) => (m.id === selected.id ? updated : m))
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save material");
    }
    closeModal();
  };

  const handleDelete = (m: LearningMaterial) => setDeleteTarget(m);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await api.materials.delete(deleteTarget.id);
      setMaterials((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete material");
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Learning Centre"
        subtitle="Add and manage educational materials, notes, and past papers."
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
          >
            <Plus size={16} /> Add Material
          </button>
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
      ) : (
        <DataTable<LearningMaterial>
          columns={columns}
          data={materials}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyMessage="No materials uploaded yet. Add your first material."
        />
      )}

      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "add" ? "Add Material" : "Edit Material"}
        size="lg"
      >
        {user && (
          <MaterialForm
            initialData={selected ?? undefined}
            uploadedBy={user.id}
            onSave={handleSave}
            onCancel={closeModal}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.title}
      />
    </>
  );
}

export default function LearningCentrePage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "TEACHER"]}>
      <LearningCentreContent />
    </ProtectedRoute>
  );
}
