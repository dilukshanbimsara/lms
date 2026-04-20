"use client";

import { useState, FormEvent } from "react";
import { UserCircle, Eye, EyeOff } from "lucide-react";
import type { Teacher } from "@/types/admin";

interface TeacherFormProps {
  initialData?: Teacher;
  onSave: (data: Omit<Teacher, "id"> & { password?: string }) => void;
  onCancel: () => void;
}

export default function TeacherForm({ initialData, onSave, onCancel }: TeacherFormProps) {
  const isNew = !initialData;
  const [name, setName] = useState(initialData?.name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ name, email, phone, imageUrl, role: "TEACHER", ...(isNew ? { password } : {}) });
  };

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Preview */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <UserCircle size={36} className="text-gray-300" />
          )}
        </div>
        <div className="flex-1">
          <label className={labelCls}>Profile Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Mr. Kamal Perera"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Role</label>
          <div className={inputCls + " bg-gray-50 text-gray-500 cursor-not-allowed"}>Teacher</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="teacher@tutiolms.lk"
            className={inputCls}
            readOnly={!isNew}
          />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+94 77 123 4567"
            className={inputCls}
          />
        </div>
      </div>

      {isNew && (
        <div>
          <label className={labelCls}>Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min. 8 characters"
              className={inputCls + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
        >
          {initialData ? "Save Changes" : "Setup Teacher"}
        </button>
      </div>
    </form>
  );
}
