"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser, toggleUserActive } from "../actions";

interface Organization {
  id: string;
  name: string;
}

interface UserRow {
  id: string;
  full_name: string | null;
  role: "admin" | "client";
  organization_id: string | null;
  organizationName: string;
  is_active: boolean;
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
        <h3 className="text-[18px] font-semibold text-foreground mb-4">{title}</h3>
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

// ─── Create User button + modal ───────────────────────────────────────────────

export function CreateUserButton({ organizations }: { organizations: Organization[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createUser(formData);
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
        Create User
      </button>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setError(""); }} title="Invite User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name">
            <input name="full_name" required placeholder="Jane Doe" className={inputCls} />
          </Field>

          <Field label="Email">
            <input
              name="email"
              type="email"
              required
              placeholder="jane@company.com"
              className={inputCls}
            />
          </Field>

          <Field label="Organization">
            <select name="organization_id" className={selectCls}>
              <option value="">— No organization —</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Role">
            <select name="role" defaultValue="client" className={selectCls}>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
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
              {loading ? "Sending invite…" : "Send Invite"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ─── Per-row Edit + Deactivate ────────────────────────────────────────────────

export function UserRowActions({
  user,
  organizations,
}: {
  user: UserRow;
  organizations: Organization[];
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await updateUser(user.id, formData);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setIsEditOpen(false);
      setLoading(false);
      router.refresh();
    }
  };

  const handleToggleActive = async () => {
    const res = await toggleUserActive(user.id, user.is_active);
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setIsEditOpen(true)}
          className="text-[13px] font-medium text-text-secondary hover:text-accent transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleToggleActive}
          className={`text-[13px] font-medium transition-colors ${
            user.is_active
              ? "text-text-secondary hover:text-red-400"
              : "text-text-secondary hover:text-emerald-400"
          }`}
        >
          {user.is_active ? "Deactivate" : "Activate"}
        </button>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setError(""); }}
        title="Edit User"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Field label="Full Name">
            <input
              name="full_name"
              defaultValue={user.full_name || ""}
              required
              className={inputCls}
            />
          </Field>

          <Field label="Organization">
            <select
              name="organization_id"
              defaultValue={user.organization_id || ""}
              className={selectCls}
            >
              <option value="">— No organization —</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Role">
            <select name="role" defaultValue={user.role} className={selectCls}>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
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
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
