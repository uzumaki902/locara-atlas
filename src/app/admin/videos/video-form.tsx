"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVideo, updateVideo, deleteVideo } from "../actions";

interface Collection {
  id: string;
  title: string;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-10">
      <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-2xl p-6 relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-[18px] font-semibold text-foreground mb-6">{title}</h3>
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

// ─── Video Form Content (reused for Create and Edit) ──────────────────────────

function VideoFormFields({ collections, defaultValues = {} }: { collections: Collection[], defaultValues?: any }) {
  return (
    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 pb-2">
      <Field label="Video ID *">
        <input name="video_id" required defaultValue={defaultValues.video_id} className={inputCls} placeholder="e.g. VID_001" />
      </Field>
      <Field label="Collection *">
        <select name="collection_id" required defaultValue={defaultValues.collection_id || ""} className={selectCls}>
          <option value="" disabled>Select Collection</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </Field>
      
      <div className="col-span-2">
        <Field label="Video URL *">
          <input name="video_url" required defaultValue={defaultValues.video_url} className={inputCls} placeholder="https://..." />
        </Field>
      </div>

      <Field label="Worker ID">
        <input name="worker_id" defaultValue={defaultValues.worker_id} className={inputCls} placeholder="e.g. RANI_W622" />
      </Field>
      <Field label="Task Type">
        <input name="task_type" defaultValue={defaultValues.task_type} className={inputCls} placeholder="e.g. Making Tea" />
      </Field>

      <Field label="Duration (Video Length)">
        <input name="video_length" defaultValue={defaultValues.video_length} className={inputCls} placeholder="e.g. 0:08:20" />
      </Field>
      <Field label="Recording Date">
        <input type="date" name="recording_date" defaultValue={defaultValues.recording_date} className={inputCls} />
      </Field>

      <Field label="Environment">
        <input name="location_environment" defaultValue={defaultValues.location_environment} className={inputCls} placeholder="e.g. Urban 1RK" />
      </Field>
      <Field label="File Size">
        <input name="file_size" defaultValue={defaultValues.file_size} className={inputCls} placeholder="e.g. 3.73 GB" />
      </Field>

      <Field label="Resolution">
        <input name="resolution" defaultValue={defaultValues.resolution} className={inputCls} placeholder="e.g. 1080p" />
      </Field>
      <Field label="Frame Rate">
        <input name="frame_rate" defaultValue={defaultValues.frame_rate} className={inputCls} placeholder="e.g. 60fps" />
      </Field>

      <Field label="Audio Quality">
        <input name="audio_quality" defaultValue={defaultValues.audio_quality} className={inputCls} placeholder="e.g. Good" />
      </Field>
      <Field label="Lighting Quality">
        <input name="lighting_quality" defaultValue={defaultValues.lighting_quality} className={inputCls} placeholder="e.g. Good" />
      </Field>

      <Field label="Hands Visible">
        <select name="hands_visible" defaultValue={defaultValues.hands_visible === false ? "false" : "true"} className={selectCls}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </Field>
      <Field label="PII Check Status">
        <select name="pii_check_status" defaultValue={defaultValues.pii_check_status || "Pending"} className={selectCls}>
          <option value="Passed">Passed (No PII)</option>
          <option value="Pending">Pending</option>
          <option value="Flagged">Flagged (Blurred Req.)</option>
        </select>
      </Field>

      <Field label="QA Status">
        <select name="status" defaultValue={defaultValues.status || "Pending"} className={selectCls}>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </Field>
    </div>
  );
}

// ─── Create Video button + modal ───────────────────────────────────────────────

export function CreateVideoButton({ collections }: { collections: Collection[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createVideo(formData);
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
        className="bg-accent hover:bg-accent/90 text-white text-[13px] font-medium px-4 py-2 rounded-md transition-colors"
      >
        Add Video
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Video">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {error && <p className="text-red-400 text-[13px] mb-4">{error}</p>}
          
          <VideoFormFields collections={collections} />

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-white text-[13px] font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Video"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ─── Row Actions (Edit / Delete) ──────────────────────────────────────────────

export function VideoRowActions({
  video,
  collections,
}: {
  video: any;
  collections: Collection[];
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    // Add existing video_id to formData for the updateAction if needed, 
    // or just pass it as an argument
    const res = await updateVideo(video.video_id, formData);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setIsEditOpen(false);
      setLoading(false);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    const res = await deleteVideo(video.video_id);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setIsDeleteOpen(false);
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setIsEditOpen(true)}
          className="text-[12px] font-medium text-text-secondary hover:text-foreground transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => setIsDeleteOpen(true)}
          className="text-[12px] font-medium text-text-secondary hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Video">
        <form onSubmit={handleEditSubmit} className="flex flex-col text-left">
          {error && <p className="text-red-400 text-[13px] mb-4">{error}</p>}
          
          <VideoFormFields collections={collections} defaultValues={video} />

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-white text-[13px] font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Video">
        <div className="mb-6 text-left">
          <p className="text-[14px] text-text-secondary">
            Are you sure you want to delete <span className="text-foreground font-semibold">{video.video_id}</span>? 
            This action cannot be undone.
          </p>
          {error && <p className="text-red-400 text-[13px] mt-4">{error}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsDeleteOpen(false)}
            className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[13px] font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Video"}
          </button>
        </div>
      </Modal>
    </>
  );
}
