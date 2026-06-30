"use client";

import { useState } from "react";
import { createOrganization, updateOrganization, toggleOrganizationActive } from "../actions";
import { useRouter } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  is_active: boolean;
  logo_url?: string;
}

// A generic Modal component with shadcn-like styling
function Modal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-foreground">
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

export function CreateOrgButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createOrganization(formData);
    
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
        Create Organization
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Organization">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Name</label>
            <input 
              name="name" 
              required 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-secondary/50" 
              placeholder="E.g. Locara AI"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Logo URL (Optional)</label>
            <input 
              name="logo_url" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-secondary/50" 
              placeholder="https://example.com/logo.png"
            />
          </div>
          {error && <p className="text-[13px] font-medium text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
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

export function OrgRowActions({ org }: { org: Organization }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await updateOrganization(org.id, formData);
    
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
    const res = await toggleOrganizationActive(org.id, org.is_active);
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
          className={`w-[72px] text-left text-[13px] font-medium transition-colors ${
            org.is_active ? "text-text-secondary hover:text-red-400" : "text-text-secondary hover:text-emerald-400"
          }`}
        >
          {org.is_active ? "Deactivate" : "Activate"}
        </button>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Organization">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Name</label>
            <input 
              name="name" 
              defaultValue={org.name} 
              required 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all" 
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Logo URL (Optional)</label>
            <input 
              name="logo_url" 
              defaultValue={org.logo_url || ""} 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all" 
            />
          </div>
          {error && <p className="text-[13px] font-medium text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
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
