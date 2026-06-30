"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCollection, updateCollection, toggleCollectionPublish } from "../actions";

interface Organization {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  title: string;
  is_published: boolean;
  organization_id: string;
  organizations?: { name: string } | { name: string }[];
  description?: string | null;
  cover_image_url?: string | null;
}

// ─── Shared modal shell ───────────────────────────────────────────────────────

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-[18px] font-semibold text-foreground mb-4 pr-8">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ─── Shared form fields ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-foreground " +
  "focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all " +
  "placeholder:text-text-secondary/50";

const selectCls =
  "w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-foreground " +
  "focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all";

// ─── Create Collection button + modal ───────────────────────────────────────────────

export function CreateCollectionButton({ organizations }: { organizations: Organization[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createCollection(formData);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setIsOpen(false);
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-accent text-white text-[13px] font-medium rounded-lg hover:bg-accent/90 transition-colors shadow-sm"
      >
        Create Collection
      </button>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setError(""); }} title="Create Collection">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title">
            <input name="title" required placeholder="E.g. Household Tasks Q1" className={inputCls} />
          </Field>

          <Field label="Description (Optional)">
            <textarea
              name="description"
              placeholder="Short description of this dataset..."
              className={inputCls}
              rows={3}
            />
          </Field>

          <Field label="Cover Image URL (Optional)">
            <input
              name="cover_image_url"
              type="url"
              placeholder="https://example.com/cover.jpg"
              className={inputCls}
            />
          </Field>

          <Field label="Organization">
            <select name="organization_id" required className={selectCls}>
              <option value="">— Select organization —</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </Field>

          {error && <p className="text-[13px] font-medium text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
            <button
              type="button"
              onClick={() => { setIsOpen(false); setError(""); }}
              className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent text-white text-[13px] font-medium rounded-md hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ─── Row Actions (Edit / Publish Toggle) ──────────────────────────────────────────

export function CollectionRowActions({
  collection,
  organizations,
}: {
  collection: Collection;
  organizations: Organization[];
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await updateCollection(collection.id, formData);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setIsEditOpen(false);
      setLoading(false);
      router.refresh();
    }
  };

  const handleTogglePublish = async () => {
    // if (confirm(`Are you sure you want to ${collection.is_published ? "unpublish" : "publish"} this collection?`)) {
    //   await toggleCollectionPublish(collection.id, collection.is_published);
    // }
    await toggleCollectionPublish(collection.id, collection.is_published);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setIsEditOpen(true)}
          className="text-[12px] font-medium text-accent hover:underline"
        >
          Edit
        </button>
        <button
          onClick={handleTogglePublish}
          className="w-[72px] text-left text-[12px] font-medium text-text-secondary hover:text-foreground transition-colors"
        >
          {collection.is_published ? "Unpublish" : "Publish"}
        </button>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setError(""); }} title="Edit Collection">
        <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
          <Field label="Title">
            <input
              name="title"
              required
              defaultValue={collection.title}
              className={inputCls}
            />
          </Field>

          <Field label="Description (Optional)">
            <textarea
              name="description"
              defaultValue={collection.description || ""}
              className={inputCls}
              rows={3}
            />
          </Field>

          <Field label="Cover Image URL (Optional)">
            <input
              name="cover_image_url"
              type="url"
              defaultValue={collection.cover_image_url || ""}
              className={inputCls}
            />
          </Field>

          <Field label="Organization">
            <select name="organization_id" required defaultValue={collection.organization_id} className={selectCls}>
              <option value="">— Select organization —</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </Field>

          {error && <p className="text-[13px] font-medium text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
            <button
              type="button"
              onClick={() => { setIsEditOpen(false); setError(""); }}
              className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent text-white text-[13px] font-medium rounded-md hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
