"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";

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
    videoId: "VID-012",
    workerId: "WKR-012",
    workerName: "Amina Shaikh",
    videoLength: "00:28:27",
    mainCategory: "Cooking & Food Prep",
    taskType: "Cooking Meal, Cutting Vegetables",
    status: "Completed",
    locationEnvironment: "urban_1rk",
    recordingDate: "2025-12-19",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/d42761de1abd41158ea291ba0ca668b8_fba51347_20251766117761285437r.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-013",
    workerId: "WKR-013",
    workerName: "Firdous Shahnawaz Mulla",
    videoLength: "00:17:11",
    mainCategory: "Household Cleaning",
    taskType: "Cleaning Kitchen, Arranging the Utensils, Multi Tasking",
    status: "Completed",
    locationEnvironment: "urban_1rk",
    recordingDate: "2025-12-18",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/71dd86b576a74399b980bfc3154abccb_d96a5db1_20251766063825474lc66.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-014",
    workerId: "WKR-014",
    workerName: "Mandakini Morey",
    videoLength: "00:12:44",
    mainCategory: "Cooking & Food Prep",
    taskType: "Cooking Meal",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Morey_Mandakini_f716e2bd_20251765883893917v531.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-015",
    workerId: "WKR-015",
    workerName: "Mansi Mulam",
    videoLength: "00:10:41",
    mainCategory: "Household Cleaning",
    taskType: "Cleaning toilet bathroom and wash basin",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Mulam_Mansi_ff7c34fd_202517655576042222kd5.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-016",
    workerId: "WKR-016",
    workerName: "Nazreen Khan",
    videoLength: "00:05:04",
    mainCategory: "Cooking & Food Prep",
    taskType: "Cooking Meal",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Khan_Nazreen_fc2ec5d0_20251765973876811yfgi_30fps.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-017",
    workerId: "WKR-017",
    workerName: "Neha Goruvanthula",
    videoLength: "00:14:21",
    mainCategory: "Utensils & Kitchenware",
    taskType: "Wash Dishes",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Goruvanthula_Neha_fbbf7014_20251765539190367wkf4.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-018",
    workerId: "WKR-018",
    workerName: "Nisha Wavhal",
    videoLength: "00:25:32",
    mainCategory: "Utensils & Kitchenware",
    taskType: "Wash Dishes",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/5368e7763ec544a2aca9d859196b85b4_d97cbd16_20251766063295333n7tn.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-019",
    workerId: "WKR-019",
    workerName: "Poonam Narwade",
    videoLength: "00:01:22",
    mainCategory: "Cooking & Food Prep",
    taskType: "Cooking Meal, Picking and Cleaning Vegetables",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/0717990aedff4cf59ec22ecba4b2af62_fd73b564_20251765513320254yg05.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-020",
    workerId: "WKR-020",
    workerName: "Poonam Navik",
    videoLength: "00:20:39",
    mainCategory: "Clothing & Laundry",
    taskType: "Washing Cloths",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Navik_2_Poonam_e6e00906_20261769498406058a7wa.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-021",
    workerId: "WKR-021",
    workerName: "Poonam Navik",
    videoLength: "00:20:53",
    mainCategory: "Cooking & Food Prep",
    taskType: "Cooking Meal",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Navik_2_Poonam_e747fc72_20261769443924671tn8y.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-022",
    workerId: "WKR-022",
    workerName: "Pramila Choudhari",
    videoLength: "00:05:37",
    mainCategory: "Household Cleaning",
    taskType: "Mopping",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/d4097fe5f280482faf41f75c9a933528_d6d282b0_20251766078199714th49.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-023",
    workerId: "WKR-023",
    workerName: "Priyanka Shukala",
    videoLength: "00:04:30",
    mainCategory: "Cooking & Food Prep",
    taskType: "Cutting Vegetables",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/a9ea44afeb374c5594cd5faf1d3d556d_fb90d647_20251765983279935eedu.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-024",
    workerId: "WKR-024",
    workerName: "Reema Shaikh",
    videoLength: "00:09:34",
    mainCategory: "Utensils & Kitchenware",
    taskType: "Wash Dishes",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/7b320bc4837546568a9bff6167946c34_fa551a02_20251766034188637uvte_30fps.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-025",
    workerId: "WKR-025",
    workerName: "Saniya Mirza",
    videoLength: "00:00:22",
    mainCategory: "Household Cleaning",
    taskType: "Mopping",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/mirza_saniya_f8ef9ed1_202517656156259519b5v.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-026",
    workerId: "WKR-026",
    workerName: "Shweta Chaurasiya",
    videoLength: "00:06:43",
    mainCategory: "Water Management",
    taskType: "Filling Water Bottles",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Chaurasiya_Shweta_fae0aad7_20251766040356273qpq5.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-027",
    workerId: "WKR-027",
    workerName: "Subhalaxmi Settiyar",
    videoLength: "00:11:16",
    mainCategory: "Cooking & Food Prep",
    taskType: "Cooking Meal",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Settiyar_Subhalaxmi_e559afb2_20251765948740782sr9q_30fps.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  },
  {
    videoId: "VID-028",
    workerId: "WKR-028",
    workerName: "Tahseem Shaikh",
    videoLength: "00:09:11",
    mainCategory: "Utensils & Kitchenware",
    taskType: "Wash Dishes",
    status: "Completed",
    locationEnvironment: "Unknown",
    recordingDate: "2025-12-20",
    videoUrl: "https://ywqqahldudizrocgjdgn.supabase.co/storage/v1/object/public/rani-video-data/task_ee5e7f28-7dbe-4ba5-855d-746faea2077d/Shaikh_Tahseem_ed1d6a2e_20251765783621670hzao.mp4",
    fileSize: "Unknown",
    resolution: "1920×1080",
    frameRate: "30 fps",
    audioQuality: "Standard",
    handsVisible: true,
    lightingQuality: "Good",
    piiCheckStatus: "Passed",
  }
];

/* ──────────────────────────── Helpers ──────────────────────────── */

function statusColor(status: Video["status"]): string {
  switch (status) {
    case "Completed":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
    case "In Review":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
    case "Processing":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
    case "Pending":
      return "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20";
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
  const [activeCategory, setActiveCategory] = useState("All");
  const videoRef = useRef<HTMLVideoElement>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(videos.map((v) => v.mainCategory)));
    return ["All", ...cats];
  }, []);

  const selected = useMemo(
    () => videos.find((v) => v.videoId === selectedId) ?? videos[0],
    [selectedId]
  );

  const filtered = useMemo(
    () =>
      videos.filter((v) => {
        const q = search.toLowerCase();
        const matchesSearch =
          v.workerName.toLowerCase().includes(q) ||
          v.taskType.toLowerCase().includes(q) ||
          v.mainCategory.toLowerCase().includes(q) ||
          v.videoId.toLowerCase().includes(q);
        const matchesCategory =
          activeCategory === "All" || v.mainCategory === activeCategory;
        return matchesSearch && matchesCategory;
      }),
    [search, activeCategory]
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="w-[320px] min-w-[320px] flex flex-col border-r border-border bg-background">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Locara Labs"
              width={32}
              height={32}
              className="rounded-md"
              priority
            />
            <div>
              <h1 className="text-[13px] font-semibold text-foreground tracking-wide leading-tight uppercase">
                Locara Atlas
              </h1>
              <p className="text-[10px] text-text-secondary leading-tight mt-0.5">
                Locara Atlas · {videos.length} videos
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none"
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
              className="w-full pl-8 pr-3 py-[7px] text-[12px] rounded-lg bg-surface border border-border text-foreground placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all duration-150"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 pb-3 pt-1">
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => {
              const isActive = cat === activeCategory;
              const count =
                cat === "All"
                  ? videos.length
                  : videos.filter((v) => v.mainCategory === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    text-[11px] px-2.5 py-[4px] rounded-md font-medium transition-all duration-150 cursor-pointer
                    ${isActive
                      ? "bg-accent/15 text-accent border border-accent/25"
                      : "bg-surface text-text-secondary border border-border hover:border-border-hover hover:text-foreground/70"
                    }
                  `}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Video List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-text-secondary text-[12px]">
              No videos match your filters.
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
                  w-full text-left rounded-lg px-3 py-2.5 transition-all duration-150 cursor-pointer
                  ${isActive
                    ? "bg-accent/8 border border-accent/20"
                    : "bg-transparent border border-transparent hover:bg-surface-hover hover:border-border"
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className={`text-[12px] font-medium leading-tight ${isActive ? "text-accent" : "text-foreground"
                      }`}
                  >
                    {v.taskType}
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary flex-shrink-0 mt-0.5">
                    {v.videoLength}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary truncate mb-1.5">
                  {v.workerName}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex text-[9px] font-medium px-1.5 py-[1px] rounded ${statusColor(
                      v.status
                    )}`}
                  >
                    {v.status}
                  </span>
                  <span className="text-[9px] text-text-secondary/50">
                    {v.mainCategory}
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
        <header className="h-12 min-h-[48px] flex items-center justify-between px-5 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h2 className="text-[13px] font-medium text-foreground truncate">
                {selected.taskType}
              </h2>
              <p className="text-[10px] text-text-secondary">
                {selected.workerName} · {selected.videoId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-secondary mr-2">
              {selected.mainCategory}
            </span>
            <span
              className={`text-[10px] font-medium px-2 py-[3px] rounded ${statusColor(
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
          <div className="flex-1 flex flex-col min-w-0 p-4">
            <div className="relative w-full rounded-lg overflow-hidden bg-black/50 border border-border flex-1 flex items-center justify-center">
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
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-text-secondary/50"
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
                    <p className="text-[12px] font-medium text-foreground mb-1">
                      No Video URL Configured
                    </p>
                    <p className="text-[11px] text-text-secondary max-w-xs">
                      Paste a Supabase Storage URL into the{" "}
                      <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-[10px] font-mono">
                        videoUrl
                      </code>{" "}
                      field for <strong>{selected.videoId}</strong> to enable playback.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats bar below video */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {[
                { label: "Duration", value: selected.videoLength },
                { label: "Resolution", value: selected.resolution },
                { label: "Frame Rate", value: selected.frameRate },
                { label: "File Size", value: selected.fileSize },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 bg-surface border border-border rounded-md px-2.5 py-1"
                >
                  <span className="text-[9px] uppercase tracking-wider text-text-secondary font-medium">
                    {s.label}
                  </span>
                  <span className="text-[11px] font-mono text-foreground">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── METADATA PANEL ─── */}
          <aside className="w-[320px] min-w-[320px] border-l border-border overflow-y-auto bg-background">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-[12px] font-semibold text-foreground tracking-tight">
                Metadata
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                All fields for {selected.videoId}
              </p>
            </div>

            <div className="px-4 py-4 space-y-4">
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
                      className={`inline-flex text-[10px] font-medium px-1.5 py-[1px] rounded ${statusColor(
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
      <h4 className="text-[9px] uppercase tracking-[0.1em] font-semibold text-text-secondary/70 mb-2">
        {title}
      </h4>
      <div className="space-y-1.5 bg-surface border border-border rounded-lg p-2.5">
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
      <span className="text-[10px] text-text-secondary flex-shrink-0">{label}</span>
      <span
        className={`text-[11px] text-foreground text-right ${mono ? "font-mono" : ""
          }`}
      >
        {value}
      </span>
    </div>
  );
}