"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/admin/shared/ProtectedRoute";
import PageHeader from "@/components/admin/shared/PageHeader";
import DataTable from "@/components/admin/shared/DataTable";
import Modal from "@/components/admin/shared/Modal";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import BannerForm from "@/components/admin/banners/BannerForm";
import * as api from "@/lib/api";
import type { Banner, ModalMode, Column } from "@/types/admin";

function BannersContent() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  useEffect(() => {
    api.banners
      .list()
      .then(setBanners)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Banner>[] = [
    {
      key: "imageUrl",
      header: "Preview",
      width: "80px",
      render: (val) => (
        <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={val as string} alt="" className="w-full h-full object-cover" />
        </div>
      ),
    },
    { key: "title", header: "Title" },
    {
      key: "isActive",
      header: "Status",
      width: "100px",
      render: (val) => (
        <span
          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
            val ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {val ? "Active" : "Inactive"}
        </span>
      ),
    },
    { key: "createdAt", header: "Created", width: "120px" },
  ];

  const openAdd = () => {
    setSelected(null);
    setModalMode("add");
  };
  const openEdit = (b: Banner) => {
    setSelected(b);
    setModalMode("edit");
  };
  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
  };

  const handleSave = async (data: Omit<Banner, "id" | "createdAt">) => {
    setError(null);
    try {
      if (modalMode === "add") {
        const created = await api.banners.create(data);
        setBanners((prev) => [created, ...prev]);
      } else if (selected) {
        const updated = await api.banners.update(selected.id, data);
        setBanners((prev) => prev.map((b) => (b.id === selected.id ? updated : b)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save banner");
    }
    closeModal();
  };

  const handleDelete = (b: Banner) => setDeleteTarget(b);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await api.banners.delete(deleteTarget.id);
      setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete banner");
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Banner Management"
        subtitle="Manage carousel banners shown on the homepage."
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
          >
            <Plus size={16} /> Add Banner
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
        <DataTable<Banner>
          columns={columns}
          data={banners}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyMessage="No banners found. Add your first banner."
        />
      )}

      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "add" ? "Add Banner" : "Edit Banner"}
      >
        <BannerForm
          initialData={selected ?? undefined}
          onSave={handleSave}
          onCancel={closeModal}
        />
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

export default function BannersPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <BannersContent />
    </ProtectedRoute>
  );
}
