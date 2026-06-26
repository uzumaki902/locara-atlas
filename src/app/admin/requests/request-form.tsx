"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDatasetRequest } from "../actions";

interface DatasetRequest {
  id: string;
  task_type: string;
  environment: string;
  hours_needed: number;
  deadline: string;
  notes: string | null;
  status: string;
  created_at: string;
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
      <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-lg p-6 relative">
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

export function RequestRowActions({ req }: { req: DatasetRequest }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await updateDatasetRequest(req.id, formData);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setIsEditOpen(false);
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsEditOpen(true)}
        className="text-[13px] font-medium text-accent hover:underline"
      >
        Edit
      </button>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Dataset Request">
        <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
          {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4 bg-background/50 p-4 rounded-md border border-border mb-4">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">Task Type</span>
              <span className="text-[13px] font-medium text-foreground">{req.task_type}</span>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">Environment</span>
              <span className="text-[13px] font-medium text-foreground">{req.environment}</span>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">Hours Needed</span>
              <span className="text-[13px] font-medium text-foreground">{req.hours_needed}</span>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-text-secondary mb-1">Deadline</span>
              <span className="text-[13px] font-medium text-foreground">{req.deadline ? new Date(req.deadline).toLocaleDateString() : "-"}</span>
            </div>
          </div>

          <Field label="Status *">
            <select name="status" required defaultValue={req.status} className={selectCls}>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Delivered">Delivered</option>
              <option value="Closed">Closed</option>
            </select>
          </Field>

          <Field label="Internal Notes (Shared with Client Notes)">
            <textarea
              name="notes"
              rows={4}
              defaultValue={req.notes || ""}
              placeholder="Add internal notes here..."
              className={inputCls}
            />
          </Field>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-[14px] font-medium text-text-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent text-background text-[14px] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
