"use client";

import { useState, FormEvent, useRef } from "react";
import { Bold, Italic, Underline, Link } from "lucide-react";
import type { LearningMaterial, MaterialType } from "@/types/admin";

interface MaterialFormProps {
  initialData?: LearningMaterial;
  uploadedBy: string;
  onSave: (data: Omit<LearningMaterial, "id" | "createdAt">) => void;
  onCancel: () => void;
}

function wrapSelected(textarea: HTMLTextAreaElement, before: string, after: string) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const replacement = before + selected + after;
  const newValue = textarea.value.slice(0, start) + replacement + textarea.value.slice(end);
  return { newValue, cursor: start + before.length + selected.length + after.length };
}

export default function MaterialForm({ initialData, uploadedBy, onSave, onCancel }: MaterialFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [subject, setSubject] = useState(initialData?.subject ?? "");
  const [level, setLevel] = useState<"O/L" | "A/L">(initialData?.level ?? "A/L");
  const [type, setType] = useState<MaterialType>(initialData?.type ?? "NOTE");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [fileUrl, setFileUrl] = useState(initialData?.fileUrl ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (before: string, after: string) => {
    if (!textareaRef.current) return;
    const { newValue, cursor } = wrapSelected(textareaRef.current, before, after);
    setContent(newValue);
    setTimeout(() => {
      textareaRef.current?.setSelectionRange(cursor, cursor);
      textareaRef.current?.focus();
    }, 0);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ title, subject, level, type, content, fileUrl, uploadedBy });
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. 2023 A/L Combined Maths Past Paper" className={inputCls} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Subject</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Combined Mathematics" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value as "O/L" | "A/L")} className={inputCls}>
            <option value="A/L">A/L</option>
            <option value="O/L">O/L</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as MaterialType)} className={inputCls}>
            <option value="NOTE">Note</option>
            <option value="PDF">PDF</option>
            <option value="VIDEO">Video</option>
          </select>
        </div>
      </div>

      {/* Mock Rich Text Editor */}
      <div>
        <label className={labelCls}>Content</label>
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
            <button
              type="button"
              title="Bold"
              onClick={() => applyFormat("**", "**")}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              title="Italic"
              onClick={() => applyFormat("_", "_")}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              title="Underline"
              onClick={() => applyFormat("<u>", "</u>")}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Underline size={14} />
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <button
              type="button"
              title="Link"
              onClick={() => applyFormat("[", "](url)")}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Link size={14} />
            </button>
            <span className="ml-auto text-xs text-gray-400 pr-1">Markdown supported</span>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Write the content or description for this material..."
            className="w-full px-3 py-2 text-sm outline-none resize-none"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>File URL / PDF Link (optional)</label>
        <input type="url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://example.com/document.pdf" className={inputCls} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors">
          {initialData ? "Save Changes" : "Add Material"}
        </button>
      </div>
    </form>
  );
}
