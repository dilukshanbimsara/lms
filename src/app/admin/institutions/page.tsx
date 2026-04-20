"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import PageHeader from "@/components/admin/shared/PageHeader";
import DataTable from "@/components/admin/shared/DataTable";
import Modal from "@/components/admin/shared/Modal";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import InstitutionForm from "@/components/admin/institutions/InstitutionForm";
import * as api from "@/lib/api";
import type { AdminInstitution, ModalMode, Column } from "@/types/admin";

function InstitutionsContent() {
  const [institutionList, setInstitutionList] = useState<AdminInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<AdminInstitution | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminInstitution | null>(null);

  useEffect(() => {
    api.institutions
      .list()
      .then(setInstitutionList)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<AdminInstitution>[] = [
    { key: "name", header: "Institution" },
    { key: "address", header: "Address" },
    { key: "phone", header: "Phone", width: "160px" },
    {
      key: "timetable",
      header: "Classes",
      width: "80px",
      render: (val) => (
        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
          {(val as AdminInstitution["timetable"]).length}
        </span>
      ),
    },
  ];

  const openAdd = () => {
    setSelected(null);
    setModalMode("add");
  };
  const openEdit = (i: AdminInstitution) => {
    setSelected(i);
    setModalMode("edit");
  };
  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
  };

  const handleSave = async (data: Omit<AdminInstitution, "id">) => {
    setError(null);
    try {
      if (modalMode === "add") {
        const created = await api.institutions.create(data);
        setInstitutionList((prev) => [...prev, created]);
      } else if (selected) {
        const updated = await api.institutions.update(selected.id, data);
        setInstitutionList((prev) =>
          prev.map((i) => (i.id === selected.id ? updated : i))
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save institution");
    }
    closeModal();
  };

  const handleDelete = (i: AdminInstitution) => setDeleteTarget(i);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await api.institutions.delete(deleteTarget.id);
      setInstitutionList((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete institution");
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Institution Management"
        subtitle="Manage learning centre locations and their timetables."
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
          >
            <Plus size={16} /> Add Institution
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
        <DataTable<AdminInstitution>
          columns={columns}
          data={institutionList}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyMessage="No institutions found."
        />
      )}

      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "add" ? "Add Institution" : "Edit Institution"}
        size="lg"
      >
        <InstitutionForm
          initialData={selected ?? undefined}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.name}
      />
    </>
  );
}

export default function InstitutionsPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <InstitutionsContent />
    </ProtectedRoute>
  );
}
