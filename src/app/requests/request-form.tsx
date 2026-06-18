"use client";

import { useState } from "react";
import { submitDatasetRequest } from "@/app/actions";

export default function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitDatasetRequest(formData);

    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error || "An unexpected error occurred.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-6">
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded text-[14px] font-medium">
          Request submitted successfully! Our team will review it shortly.
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-[14px] font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="taskType" className="text-[14px] font-medium text-text-secondary block">
            Task Type <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="taskType"
            name="taskType"
            required
            placeholder="e.g., Pedestrian Tracking"
            className="w-full bg-background border border-border rounded px-4 py-2 text-[14px] text-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="environment" className="text-[14px] font-medium text-text-secondary block">
            Environment <span className="text-red-400">*</span>
          </label>
          <select
            id="environment"
            name="environment"
            required
            className="w-full bg-background border border-border rounded px-4 py-2 text-[14px] text-foreground focus:outline-none focus:border-accent transition-colors appearance-none"
          >
            <option value="">Select Environment</option>
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
            <option value="In-car">In-car</option>
            <option value="Studio">Studio</option>
            <option value="Virtual">Virtual</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="hoursNeeded" className="text-[14px] font-medium text-text-secondary block">
            Hours Needed <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            id="hoursNeeded"
            name="hoursNeeded"
            required
            min="1"
            placeholder="e.g., 50"
            className="w-full bg-background border border-border rounded px-4 py-2 text-[14px] text-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="deadline" className="text-[14px] font-medium text-text-secondary block">
            Deadline <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            required
            className="w-full bg-background border border-border rounded px-4 py-2 text-[14px] text-foreground focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-[14px] font-medium text-text-secondary block">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Provide any additional context or requirements..."
          className="w-full bg-background border border-border rounded px-4 py-2 text-[14px] text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
        ></textarea>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent/90 text-white font-medium text-[14px] px-6 py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
