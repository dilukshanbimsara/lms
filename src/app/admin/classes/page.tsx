"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import PageHeader from "@/components/admin/shared/PageHeader";
import DataTable from "@/components/admin/shared/DataTable";
import Modal from "@/components/admin/shared/Modal";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import ClassCategoryForm from "@/components/admin/classes/ClassCategoryForm";
import * as api from "@/lib/api";
import type { AdminClassCategory, ModalMode, Column } from "@/types/admin";

function ClassesContent() {
  const [categories, setCategories] = useState<AdminClassCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<AdminClassCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminClassCategory | null>(null);

  useEffect(() => {
    api.classes
      .list()
      .then(setCategories)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<AdminClassCategory>[] = [
    { key: "label", header: "Category" },
    { key: "icon", header: "Icon", width: "100px" },
    { key: "description", header: "Description" },
    {
      key: "items",
      header: "Classes",
      width: "80px",
      render: (val) => (
        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
          {(val as AdminClassCategory["items"]).length}
        </span>
      ),
    },
  ];

  const openAdd = () => {
    setSelected(null);
    setModalMode("add");
  };
  const openEdit = (c: AdminClassCategory) => {
    setSelected(c);
    setModalMode("edit");
  };
  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
  };

  const handleSave = async (data: Omit<AdminClassCategory, "id">) => {
    setError(null);
    try {
      if (modalMode === "add") {
        const created = await api.classes.create(data);
        setCategories((prev) => [...prev, created]);
      } else if (selected) {
        const updated = await api.classes.update(selected.id, data);
        setCategories((prev) =>
          prev.map((c) => (c.id === selected.id ? updated : c))
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save category");
    }
    closeModal();
  };

  const handleDelete = (c: AdminClassCategory) => setDeleteTarget(c);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await api.classes.delete(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete category");
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Classes Offered"
        subtitle="Manage class categories and their schedules shown on the public classes page."
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
          >
            <Plus size={16} /> Add Category
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
        <DataTable<AdminClassCategory>
          columns={columns}
          data={categories}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyMessage="No class categories yet. Add your first category."
        />
      )}

      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "add" ? "Add Class Category" : "Edit Class Category"}
        size="lg"
      >
        <ClassCategoryForm
          initialData={selected ?? undefined}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.label}
      />
    </>
  );
}

export default function ClassesPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "TEACHER"]}>
      <ClassesContent />
    </ProtectedRoute>
  );
}
