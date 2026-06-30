"use client";

import { useState } from "react";

export function ImageUploadField({ 
  name, 
  defaultUrl, 
  label = "Upload Image" 
}: { 
  name: string; 
  defaultUrl?: string | null; 
  label?: string; 
}) {
  const [preview, setPreview] = useState<string | null>(defaultUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(defaultUrl || null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="w-14 h-14 rounded-md border border-border overflow-hidden bg-background/50 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-md border border-border border-dashed flex items-center justify-center bg-background/30 flex-shrink-0 text-text-secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 bg-background border border-border rounded text-[13px] font-medium text-foreground hover:bg-surface hover:border-border/80 transition-all shadow-sm">
            <span>{label}</span>
            <input 
              type="file" 
              name={name} 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
          <p className="text-[12px] text-text-secondary mt-1">
            Choose a file from your computer
          </p>
        </div>
      </div>
      {/* We keep the original URL input hidden so if they don't upload a new file, the old URL is preserved. */}
      {defaultUrl && <input type="hidden" name={name.replace("_file", "_url")} value={defaultUrl} />}
    </div>
  );
}
