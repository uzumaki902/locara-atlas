"use client";

import { useState } from "react";
import { submitDatasetRequest } from "@/app/actions";
import { toast } from "react-hot-toast";

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
      toast.success("Request submitted successfully!");
      (e.target as HTMLFormElement).reset();
    } else {
      const errorMessage = result.error || "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border/60 rounded-xl shadow-sm p-6 md:p-8 space-y-7">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="taskType" className="text-[13px] font-medium text-foreground block">
            Task Type <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="taskType"
            name="taskType"
            required
            placeholder="e.g., Pedestrian Tracking"
            className="w-full bg-transparent border border-border/80 rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-text-secondary/50 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="environment" className="text-[13px] font-medium text-foreground block">
            Environment <span className="text-red-400">*</span>
          </label>
          <select
            id="environment"
            name="environment"
            required
            className="w-full bg-transparent border border-border/80 rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all appearance-none shadow-sm cursor-pointer"
          >
            <option value="" className="bg-surface">Select Environment</option>
            <option value="Urban 1RK" className="bg-surface">Urban 1RK</option>
            <option value="Urban 2BHK" className="bg-surface">Urban 2BHK</option>
            <option value="Rural" className="bg-surface">Rural</option>
            <option value="Outdoor" className="bg-surface">Outdoor</option>
            <option value="Other" className="bg-surface">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="hoursNeeded" className="text-[13px] font-medium text-foreground block">
            Hours Needed <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            id="hoursNeeded"
            name="hoursNeeded"
            required
            min="1"
            placeholder="e.g., 50"
            className="w-full bg-transparent border border-border/80 rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-text-secondary/50 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="deadline" className="text-[13px] font-medium text-foreground block">
            Deadline <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            required
            className="w-full bg-transparent border border-border/80 rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all [color-scheme:dark] shadow-sm cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-[13px] font-medium text-foreground block">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Provide any additional context or requirements..."
          className="w-full bg-transparent border border-border/80 rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all resize-none placeholder:text-text-secondary/50 shadow-sm"
        ></textarea>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent/90 text-white font-semibold text-[14px] px-8 py-2.5 rounded-lg shadow-md hover:shadow-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
