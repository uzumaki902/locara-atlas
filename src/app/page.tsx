"use client";

import { useState, useRef, useEffect, useMemo } from "react";

/* ──────────────────────────── Types ──────────────────────────── */

interface Video {
  videoId: string;
  workerId: string;
  workerName: string;
  videoLength: string;
  mainCategory: string;
  taskType: string;
  status: "Completed" | "In Review" | "Processing" | "Pending";
  locationEnvironment: string;
  recordingDate: string;
  videoUrl: string;
  fileSize: string;
  resolution: string;
  frameRate: string;
  audioQuality: string;
  handsVisible: boolean;
  lightingQuality: string;
  piiCheckStatus: "Passed" | "Pending" | "Flagged";
}

/* ──────────────────────────── Dataset ──────────────────────────── */

const videos: Video[] = [
  {
    videoId: "VID-001",
    workerId: "WKR-001",
    workerName: "Kausar Fatima Sayyed",
    videoLength: "00:05:11",
    mainCategory: "Household Cleaning",
    taskType: "Mopping",
    status: "Completed",
    locationEnvironment: "Indoor — Residential Kitchen",
    recordingDate: "2026-05-15",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Sayyed_Kausar_fatima_ff975fb6_20251765548326102nxpq.mp4",
    fileSize: "245 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-002",
    workerId: "WKR-002",
    workerName: "Khushbunnisa Malik",
    videoLength: "00:08:48",
    mainCategory: "Other/General",
    taskType: "Weaving cloth",
    status: "Completed",
    locationEnvironment: "Indoor — Workshop",
    recordingDate: "2026-05-16",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/9e8795efaaa648a1b3368a8c3dd901be_f22cd7f2_20251766135479440b248.mp4",
    fileSize: "410 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-003",
    workerId: "WKR-003",
    workerName: "Madhuri Kamble",
    videoLength: "00:13:01",
    mainCategory: "Clothing & Laundry",
    taskType: "Washing Cloths",
    status: "Completed",
    locationEnvironment: "Indoor — Residential Bathroom",
    recordingDate: "2026-05-17",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/03cfcee9c8a2408bb6384011cc8dfa72_f6b43e25_202517656374184119frl.mp4",
    fileSize: "612 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Moderate",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-004",
    workerId: "WKR-004",
    workerName: "Mala Shukla",
    videoLength: "00:02:39",
    mainCategory: "Utensils & Kitchenware",
    taskType: "Wash Dishes",
    status: "Completed",
    locationEnvironment: "Indoor — Residential Kitchen",
    recordingDate: "2026-05-18",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/aca1baa92ca5469bba4db56ce287cdd1_e8840379_20251766150224225got4.mp4",
    fileSize: "125 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-005",
    workerId: "WKR-004",
    workerName: "Mala Shukla",
    videoLength: "00:11:40",
    mainCategory: "Cooking & Food Prep",
    taskType: "Cutting Vegetables",
    status: "In Review",
    locationEnvironment: "Indoor — Residential Kitchen",
    recordingDate: "2026-05-18",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Shukla_Mala_e5cda61e_20251765900388221jv2p.mp4",
    fileSize: "548 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-006",
    workerId: "WKR-005",
    workerName: "Rajeshree Salte",
    videoLength: "00:01:39",
    mainCategory: "Clothing & Laundry",
    taskType: "Press Clothes",
    status: "Completed",
    locationEnvironment: "Indoor — Residential Bedroom",
    recordingDate: "2026-05-19",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/7c1192bbb5584764920ec428491b0db0_fcb8cae4_2025176611825759894i3.mp4",
    fileSize: "78 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-007",
    workerId: "WKR-005",
    workerName: "Rajeshree Salte",
    videoLength: "00:02:49",
    mainCategory: "Clothing & Laundry",
    taskType: "Arranging Clothes",
    status: "Completed",
    locationEnvironment: "Indoor — Residential Bedroom",
    recordingDate: "2026-05-19",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Salte_Rajeshree_fd80be62_202517660473259355rhi.mp4",
    fileSize: "132 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-008",
    workerId: "WKR-005",
    workerName: "Rajeshree Salte",
    videoLength: "00:12:47",
    mainCategory: "Utensils & Kitchenware",
    taskType: "Wash Dishes",
    status: "In Review",
    locationEnvironment: "Indoor — Residential Kitchen",
    recordingDate: "2026-05-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Salte_Rajeshree_fdb2a0f8_20251766045356222n3kj.mp4",
    fileSize: "598 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Moderate",
    piiCheckStatus: "Pending",
  },
  {
    videoId: "VID-009",
    workerId: "WKR-006",
    workerName: "Sabinakhatun Siddique",
    videoLength: "00:12:13",
    mainCategory: "Household Cleaning",
    taskType: "Wash Dishes, Cleaning Kitchen, Arranging the Utensils, Hanging Clothes, Multi Tasking",
    status: "Completed",
    locationEnvironment: "Indoor — Residential Kitchen & Yard",
    recordingDate: "2026-05-21",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Siddique_Sabinakhatun_fc143db1_202517655412302220n7y.mp4",
    fileSize: "572 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-010",
    workerId: "WKR-007",
    workerName: "Shahista Shaikh",
    videoLength: "00:02:45",
    mainCategory: "Household Cleaning",
    taskType: "Sweep Floor",
    status: "Completed",
    locationEnvironment: "Indoor — Residential Living Area",
    recordingDate: "2026-05-22",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/e1b1709a7e544e2f921521cfbcada1a0_f4ba594f_20251765647350894tj9a.mp4",
    fileSize: "129 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-011",
    workerId: "WKR-008",
    workerName: "Umera Shahji",
    videoLength: "00:12:06",
    mainCategory: "Cooking & Food Prep",
    taskType: "Cooking Meal",
    status: "Completed",
    locationEnvironment: "Indoor — Residential Kitchen",
    recordingDate: "2026-05-23",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/db63899de13d4b43b0fe964aa5795caf_ffee655f_20251765958394696p4gr.mp4",
    fileSize: "567 MB",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
];

/* ──────────────────────────── Helpers ──────────────────────────── */

function statusColor(status: Video["status"]): string {
  switch (status) {
    case "Completed":
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    case "In Review":
      return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    case "Processing":
      return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Pending":
      return "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30";
  }
}

function piiColor(pii: Video["piiCheckStatus"]): string {
  switch (pii) {
    case "Passed":
      return "text-emerald-400";
    case "Pending":
      return "text-amber-400";
    case "Flagged":
      return "text-red-400";
  }
}



/* ──────────────────────────── Component ──────────────────────────── */

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>(videos[0].videoId);
  const [search, setSearch] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const selected = useMemo(
    () => videos.find((v) => v.videoId === selectedId) ?? videos[0],
    [selectedId]
  );

  const filtered = useMemo(
    () =>
      videos.filter((v) => {
        const q = search.toLowerCase();
        return (
          v.workerName.toLowerCase().includes(q) ||
          v.taskType.toLowerCase().includes(q) ||
          v.mainCategory.toLowerCase().includes(q) ||
          v.videoId.toLowerCase().includes(q)
        );
      }),
    [search]
  );

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F0F14]">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="w-[340px] min-w-[340px] flex flex-col border-r border-border bg-[#0F0F14]">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm font-bold">
              L
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-foreground tracking-tight">
                Dataset Explorer
              </h1>
              <p className="text-[11px] text-text-secondary">
                Locara Atlas · {videos.length} videos
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              id="search-videos"
              type="text"
              placeholder="Search videos, workers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg bg-surface border border-border text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Video List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-secondary text-sm">
              No videos match your search.
            </div>
          )}
          {filtered.map((v) => {
            const isActive = v.videoId === selectedId;
            return (
              <button
                key={v.videoId}
                id={`video-card-${v.videoId}`}
                onClick={() => handleSelect(v.videoId)}
                className={`
                  w-full text-left rounded-xl px-3.5 py-3 transition-all duration-200 group cursor-pointer
                  ${
                    isActive
                      ? "bg-accent/10 border border-accent/30 shadow-[0_0_20px_rgba(46,134,171,0.08)]"
                      : "bg-transparent border border-transparent hover:bg-surface hover:border-border"
                  }
                `}
              >
                {/* Top row: icon + task + duration */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[13px] font-medium truncate ${
                        isActive ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {v.taskType}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-text-secondary flex-shrink-0">
                    {v.videoLength}
                  </span>
                </div>

                {/* Worker name */}
                <p className="text-[12px] text-text-secondary truncate pl-6 mb-1.5">
                  {v.workerName}
                </p>

                {/* Status pill */}
                <div className="pl-6">
                  <span
                    className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor(
                      v.status
                    )}`}
                  >
                    {v.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 min-h-[56px] flex items-center justify-between px-6 border-b border-border bg-[#0F0F14]/80 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h2 className="text-[14px] font-semibold text-foreground truncate">
                {selected.taskType}
              </h2>
              <p className="text-[11px] text-text-secondary">
                {selected.workerName} · {selected.videoId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColor(
                selected.status
              )}`}
            >
              {selected.status}
            </span>
          </div>
        </header>

        {/* Player + Metadata */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Player Area */}
          <div className="flex-1 flex flex-col min-w-0 p-5">
            <div className="relative w-full rounded-xl overflow-hidden bg-black/40 border border-border shadow-[0_0_40px_rgba(0,0,0,0.4)] flex-1 flex items-center justify-center">
              {selected.videoUrl ? (
                <video
                  ref={videoRef}
                  id="main-video-player"
                  key={selected.videoId}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  <source src={selected.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-text-secondary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      No Video URL Configured
                    </p>
                    <p className="text-xs text-text-secondary max-w-xs">
                      Paste a Supabase Storage URL into the{" "}
                      <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-[11px] font-mono">
                        videoUrl
                      </code>{" "}
                      field for <strong>{selected.videoId}</strong> to enable playback.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats bar below video */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {[
                { label: "Duration", value: selected.videoLength },
                { label: "Resolution", value: selected.resolution },
                { label: "Frame Rate", value: selected.frameRate },
                { label: "File Size", value: selected.fileSize },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 bg-surface/60 border border-border rounded-lg px-3 py-1.5"
                >
                  <span className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                    {s.label}
                  </span>
                  <span className="text-[12px] font-mono text-foreground">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── METADATA PANEL ─── */}
          <aside className="w-[340px] min-w-[340px] border-l border-border overflow-y-auto bg-[#0F0F14]">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-[13px] font-semibold text-foreground tracking-tight">
                Metadata
              </h3>
              <p className="text-[11px] text-text-secondary mt-0.5">
                All fields for {selected.videoId}
              </p>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Identity Section */}
              <MetadataSection title="Identity">
                <MetadataRow label="Video ID" value={selected.videoId} mono />
                <MetadataRow label="Worker ID" value={selected.workerId} mono />
                <MetadataRow label="Worker Name" value={selected.workerName} />
              </MetadataSection>

              {/* Classification Section */}
              <MetadataSection title="Classification">
                <MetadataRow label="Main Category" value={selected.mainCategory} />
                <MetadataRow label="Task Type" value={selected.taskType} />
                <MetadataRow
                  label="Status"
                  value={
                    <span
                      className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColor(
                        selected.status
                      )}`}
                    >
                      {selected.status}
                    </span>
                  }
                />
              </MetadataSection>

              {/* Recording Section */}
              <MetadataSection title="Recording">
                <MetadataRow label="Video Length" value={selected.videoLength} mono />
                <MetadataRow label="Recording Date" value={selected.recordingDate} />
                <MetadataRow
                  label="Location / Environment"
                  value={selected.locationEnvironment}
                />
              </MetadataSection>

              {/* Technical Section */}
              <MetadataSection title="Technical">
                <MetadataRow label="Resolution" value={selected.resolution} mono />
                <MetadataRow label="Frame Rate" value={selected.frameRate} mono />
                <MetadataRow label="File Size" value={selected.fileSize} mono />
                <MetadataRow label="Audio Quality" value={selected.audioQuality} />
              </MetadataSection>

              {/* Quality & Compliance Section */}
              <MetadataSection title="Quality & Compliance">
                <MetadataRow
                  label="Hands Visible"
                  value={
                    <span
                      className={
                        selected.handsVisible
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {selected.handsVisible ? "Yes" : "No"}
                    </span>
                  }
                />
                <MetadataRow
                  label="Lighting Quality"
                  value={selected.lightingQuality}
                />
                <MetadataRow
                  label="PII Check Status"
                  value={
                    <span className={`font-medium ${piiColor(selected.piiCheckStatus)}`}>
                      {selected.piiCheckStatus}
                    </span>
                  }
                />
              </MetadataSection>

              {/* Storage Section */}
              <MetadataSection title="Storage">
                <MetadataRow
                  label="Video URL"
                  value={
                    selected.videoUrl ? (
                      <a
                        href={selected.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-[11px] break-all"
                      >
                        {selected.videoUrl}
                      </a>
                    ) : (
                      <span className="text-text-secondary italic text-[11px]">
                        Not configured
                      </span>
                    )
                  }
                />
              </MetadataSection>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ──────────────────────────── Sub-components ──────────────────────────── */

function MetadataSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-[0.08em] font-semibold text-text-secondary mb-2.5">
        {title}
      </h4>
      <div className="space-y-2 bg-surface/40 border border-border rounded-xl p-3">
        {children}
      </div>
    </div>
  );
}

function MetadataRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-text-secondary flex-shrink-0">{label}</span>
      <span
        className={`text-[12px] text-foreground text-right ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}