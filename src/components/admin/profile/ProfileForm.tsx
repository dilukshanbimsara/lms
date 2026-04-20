"use client";

import { useState, FormEvent } from "react";
import { UserCircle } from "lucide-react";
import type { AdminUser } from "@/types/admin";

interface ProfileFormProps {
  user: AdminUser;
  onSave: (data: Partial<AdminUser>) => void;
}

export default function ProfileForm({ user, onSave }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [email] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [imageUrl, setImageUrl] = useState(user.imageUrl ?? "");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ name, email, phone, imageUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserCircle size={44} className="text-gray-300" />
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

      <div>
        <label className={labelCls}>Full Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Email Address</label>
        <input
          type="email"
          value={email}
          readOnly
          className={inputCls + " bg-gray-50 text-gray-500 cursor-default"}
          title="Email cannot be changed"
        />
      </div>

      <div>
        <label className={labelCls}>Phone Number</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94 77 123 4567" className={inputCls} />
      </div>

      <div className="pt-1">
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
        >
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
