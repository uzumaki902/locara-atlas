"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";



export interface Video {
  videoId: string;
  workerId: string;
  videoLength: string;
  mainCategory: string;
  taskType: string;
  status: "Completed" | "In Review" | "Processing" | "Pending";
  locationEnvironment: string;
  recordingDate: string;
  fileSize: string;
  resolution: string;
  frameRate: string;
  audioQuality: string;
  handsVisible: boolean;
  lightingQuality: string;
  piiCheckStatus: "Passed" | "Pending" | "Flagged";
}






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


function getVideoSource(video: Video): string {
  return `/api/video/${video.videoId}`;
}


export default function PageClient({
  videos,
  role,
  collectionTitle
}: {
  videos: Video[],
  role?: string,
  collectionTitle?: string
}) {
  const [selectedId, setSelectedId] = useState<string>(videos[0]?.videoId ?? "");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setProgress(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoContainerRef.current) {
      if (document.fullscreenElement) document.exitFullscreen();
      else videoContainerRef.current.requestFullscreen();
    }
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(videos.map((v) => v.mainCategory)));
    return ["All", ...cats];
  }, [videos]);

  const datasetStats = useMemo(() => {
    const totalVideos = videos.length;
    const totalCategories = new Set(videos.map((v) => v.mainCategory)).size;

    const approvedVideos = videos.filter((v) => v.status === "Completed").length;
    const approvedPercent = totalVideos > 0 ? Math.round((approvedVideos / totalVideos) * 100) : 0;

    let totalSeconds = 0;
    videos.forEach((v) => {
      const parts = v.videoLength.split(":");
      if (parts.length === 3) {
        totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      } else if (parts.length === 2) {
        totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    });
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m ${totalSeconds % 60}s`;

    const piiCleared = videos.filter((v) => v.piiCheckStatus === "Passed").length;
    const piiPercent = totalVideos > 0 ? Math.round((piiCleared / totalVideos) * 100) : 0;

    const goodLighting = videos.filter((v) => v.lightingQuality === "Good").length;
    const lightingPercent = totalVideos > 0 ? Math.round((goodLighting / totalVideos) * 100) : 0;

    const handsVisible = videos.filter((v) => v.handsVisible).length;
    const handsPercent = totalVideos > 0 ? Math.round((handsVisible / totalVideos) * 100) : 0;

    const envCount = new Set(videos.map((v) => v.locationEnvironment)).size;

    const catCounts = videos.reduce((acc, v) => {
      acc[v.mainCategory] = (acc[v.mainCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const highestRes = [...videos].sort((a, b) => {
      const resA = parseInt(a.resolution.split("×")[0] || a.resolution.split("x")[0]) || 0;
      const resB = parseInt(b.resolution.split("×")[0] || b.resolution.split("x")[0]) || 0;
      return resB - resA;
    })[0]?.resolution || "N/A";

    return {
      totalVideos,
      totalCategories,
      approvedVideos,
      approvedPercent,
      durationStr,
      piiPercent,
      lightingPercent,
      handsPercent,
      envCount,
      mostCommonCat,
      highestRes
    };
  }, [videos]);

  const selected = useMemo(
    () => videos.find((v) => v.videoId === selectedId) ?? videos[0],
    [selectedId, videos]
  );

  const filtered = useMemo(
    () =>
      videos.filter((v) => {
        const q = search.toLowerCase();
        const matchesSearch =
          v.workerId.toLowerCase().includes(q) ||
          v.taskType.toLowerCase().includes(q) ||
          v.mainCategory.toLowerCase().includes(q) ||
          v.videoId.toLowerCase().includes(q);
        const matchesCategory =
          activeCategory === "All" || v.mainCategory === activeCategory;
        return matchesSearch && matchesCategory;
      }),
    [search, activeCategory, videos]
  );

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setProgress(0);
    }
  }, [selectedId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-background w-full">
        <div className="bg-surface border border-border rounded-xl p-10 flex flex-col items-center max-w-md text-center shadow-2xl shadow-black/40">
          <svg className="w-16 h-16 text-text-secondary/30 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <h2 className="text-[20px] font-semibold text-foreground tracking-tight mb-2">No videos available</h2>
          <p className="text-[14px] text-text-secondary">
            This collection doesn't have any videos assigned to it yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen overflow-x-hidden md:overflow-hidden bg-background">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="w-full md:w-[340px] lg:w-[380px] md:min-w-[340px] lg:min-w-[380px] flex flex-col border-b md:border-b-0 md:border-r border-border bg-background flex-shrink-0">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border">
          {/* Collection Context */}
          <div className="min-w-0">
            {role === "client" ? (
              <div className="leading-tight">
                <p className="text-[15px] font-semibold text-foreground truncate" title={collectionTitle || "Collection"}>{collectionTitle || "Collection"}</p>
                <p className="text-[13px] font-normal text-text-secondary mt-0.5">{videos.length} {videos.length === 1 ? "Video" : "Videos"}</p>
              </div>
            ) : (
              <p className="text-[14px] font-normal text-text-secondary leading-tight truncate">
                Sample Dataset Explorer
              </p>
            )}
          </div>

          {/* Feature 1: Dataset Overview Cards */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <div className="bg-surface border border-border rounded-lg p-3 flex flex-col hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-3.5 h-3.5 text-accent/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Total Videos</span>
              </div>
              <span className="text-[18px] font-bold text-foreground leading-tight">{datasetStats.totalVideos}</span>
            </div>
            <div className="bg-surface border border-border rounded-lg p-3 flex flex-col hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-3.5 h-3.5 text-accent/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" /></svg>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Categories</span>
              </div>
              <span className="text-[18px] font-bold text-foreground leading-tight">{datasetStats.totalCategories}</span>
            </div>
            <div className="bg-surface border border-border rounded-lg p-3 flex flex-col hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-3.5 h-3.5 text-accent/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Approved</span>
              </div>
              <span className="text-[18px] font-bold text-foreground leading-tight">{datasetStats.approvedVideos}</span>
            </div>
            <div className="bg-surface border border-border rounded-lg p-3 flex flex-col hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-3.5 h-3.5 text-accent/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Total Footage</span>
              </div>
              <span className="text-[18px] font-bold text-foreground leading-tight">{datasetStats.durationStr}</span>
            </div>
          </div>
        </div>
        {/* Category Filter */}
        <div className="px-4 pt-4 pb-3">
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
          >
            <div>
              <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Categories ({categories.length})
              </h3>
              <p className="text-[14px] font-medium text-foreground">
                <span className="text-text-secondary font-normal mr-1">Selected:</span>
                {activeCategory} ({activeCategory === "All" ? videos.length : videos.filter(v => v.mainCategory === activeCategory).length})
              </p>
            </div>
            <button className="text-[12px] font-medium text-text-secondary flex items-center gap-1 group-hover:text-foreground transition-colors">
              {isCategoriesExpanded ? "Hide" : "Show"} Categories
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isCategoriesExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div
            className={`grid transition-all duration-300 ease-in-out ${isCategoriesExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
              }`}
          >
            <div className="overflow-hidden">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategory(cat);
                      }}
                      className={`
                        text-[13px] font-medium px-3 py-1 rounded-md transition-all duration-150 cursor-pointer
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
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
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
              placeholder="Search videos, categories, IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[14px] rounded-lg bg-surface border border-border text-foreground placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all duration-150"
            />
          </div>
        </div>

        {/* Video List */}
        <div className="flex-1 overflow-y-auto px-3 pb-24 space-y-0.5 max-h-[40vh] md:max-h-none">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-8 h-8 text-text-secondary/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <p className="text-[13px] font-medium text-text-secondary">No videos match your filters.</p>
              <p className="text-[12px] text-text-secondary/60 mt-1">Try adjusting your search or category.</p>
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
                    ? "bg-accent/10 border border-accent/30 shadow-sm shadow-accent/5"
                    : "bg-transparent border border-transparent hover:bg-surface/50"
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className={`text-[16px] font-semibold leading-tight truncate ${isActive ? "text-accent" : "text-foreground"
                      }`}
                    title={v.taskType}
                  >
                    {v.taskType}
                  </span>
                  <span className="text-[12px] font-medium font-mono text-text-secondary flex-shrink-0 mt-0.5">
                    {v.videoLength}
                  </span>
                </div>
                <p className="text-[14px] font-normal text-text-secondary truncate mb-1.5" title={`Category: ${v.mainCategory}`}>
                  Category: {v.mainCategory}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded ${statusColor(
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
      <main className="flex-1 flex flex-col min-w-0 md:overflow-hidden">
        {/* Top bar */}
        <header className="h-14 min-h-[56px] flex items-center justify-between px-5 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold text-foreground truncate">
                {selected.taskType}
              </h2>
              <p className="text-[14px] font-normal text-text-secondary">
                {selected.mainCategory} · {selected.videoId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-text-secondary mr-2">
              {selected.mainCategory}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-[3px] rounded ${statusColor(
                selected.status
              )}`}
            >
              {selected.status}
            </span>
          </div>
        </header>

        {/* Player + Metadata */}
        <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
          {/* Video Player Area */}
          <div className="flex-1 flex flex-col min-w-0 p-4">
            <div ref={videoContainerRef} className="relative w-full aspect-video lg:aspect-auto rounded-lg overflow-hidden bg-black/50 border border-border flex-1 flex items-center justify-center group">
              {getVideoSource(selected) ? (
                <>
                  <video
                    ref={videoRef}
                    id="main-video-player"
                    key={selected.videoId}
                    autoPlay
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onClick={togglePlay}
                    controlsList="nodownload"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    className="w-full h-full object-contain cursor-pointer"
                  >
                    <source src={getVideoSource(selected)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Custom Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-white font-mono w-10 text-right">{formatTime(progress)}</span>
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={progress}
                          onChange={handleSeek}
                          className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-accent"
                          aria-label="Seek video"
                        />
                      <span className="text-[10px] text-white font-mono w-10">{formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-white/70 transition-colors" aria-label={isPlaying ? "Pause video" : "Play video"}>
                          {isPlaying ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          )}
                        </button>

                        <div className="flex items-center gap-2 relative">
                          <button onClick={toggleMute} className="text-white hover:text-white/70 transition-colors" aria-label={isMuted || volume === 0 ? "Unmute video" : "Mute video"}>
                            {isMuted || volume === 0 ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                            )}
                          </button>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-accent"
                              aria-label="Volume"
                            />
                        </div>
                      </div>

                      <button onClick={toggleFullscreen} className="text-white hover:text-white/70 transition-colors" aria-label="Toggle fullscreen">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
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
                    <p className="text-[14px] font-medium text-foreground mb-1">
                      Internal Storage Reference Missing
                    </p>
                    <p className="text-[14px] font-normal text-text-secondary max-w-xs">
                      A Protected Asset URL must be configured for <strong>{selected.videoId}</strong> to enable playback.
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
                  className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-1.5 hover:border-border-hover transition-colors"
                >
                  <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    {s.label}
                  </span>
                  <span className="text-[13px] font-semibold font-mono text-foreground">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── METADATA PANEL ─── */}
          <aside className="w-full lg:w-[320px] lg:min-w-[320px] border-t lg:border-t-0 lg:border-l border-border lg:overflow-y-auto bg-background flex-shrink-0">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground tracking-tight">
                Metadata
              </h3>
              <p className="text-[13px] font-normal text-text-secondary mt-0.5">
                All fields for {selected.videoId}
              </p>
            </div>

            <div className="px-4 py-4 space-y-4">

              <MetadataSection title="Identity">
                <MetadataRow label="Worker ID" value={selected.workerId} mono />
                <MetadataRow label="Video ID" value={selected.videoId} mono />
              </MetadataSection>


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


              <MetadataSection title="Recording">
                <MetadataRow label="Video Length" value={selected.videoLength} mono />
                <MetadataRow label="Recording Date" value={selected.recordingDate} />
                <MetadataRow
                  label="Location / Environment"
                  value={selected.locationEnvironment}
                />
              </MetadataSection>

              <MetadataSection title="Technical">
                <MetadataRow label="Resolution" value={selected.resolution} mono />
                <MetadataRow label="Frame Rate" value={selected.frameRate} mono />
                <MetadataRow label="File Size" value={selected.fileSize} mono />
                <MetadataRow label="Audio Quality" value={selected.audioQuality} />
              </MetadataSection>


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
                    <span className={`text-[12px] font-medium ${piiColor(selected.piiCheckStatus)}`}>
                      {selected.piiCheckStatus}
                    </span>
                  }
                />
              </MetadataSection>

              {/* Feature 3: Dataset Health Panel */}
              <MetadataSection title="Dataset Health">
                <ProgressBar label="Approved" percent={datasetStats.approvedPercent} color="bg-accent" />
                <ProgressBar label="PII Cleared" percent={datasetStats.piiPercent} color="bg-emerald-500" />
                <ProgressBar label="Good Lighting" percent={datasetStats.lightingPercent} color="bg-amber-400" />
                <ProgressBar label="Hands Visible" percent={datasetStats.handsPercent} color="bg-blue-400" />
              </MetadataSection>

              {/* Feature 4: Dataset Insights Panel */}
              <MetadataSection title="Dataset Insights">
                <MetadataRow label="Most Common Cat." value={datasetStats.mostCommonCat} />
                <MetadataRow label="Highest Resolution" value={datasetStats.highestRes} mono />
                <MetadataRow label="Environments" value={datasetStats.envCount.toString()} mono />
                <MetadataRow label="Dataset Approved" value={`${datasetStats.approvedPercent}%`} mono />
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
      <h4 className="text-[14px] font-semibold text-foreground mb-2 pb-1 border-b border-border/50">
        {title}
      </h4>
      <div className="space-y-1.5 bg-surface border border-border rounded-lg p-3">
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
    <div className="flex items-center justify-between gap-3 min-h-[26px]">
      <span className="text-[12px] font-medium text-text-secondary flex-shrink-0">{label}</span>
      <span
        className={`text-[14px] font-medium text-foreground text-right ${mono ? "font-mono" : ""
          }`}
      >
        {value}
      </span>
    </div>
  );
}

function ProgressBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div className="flex flex-col gap-1 w-full py-1">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-text-secondary">{label}</span>
        <span className="text-[12px] font-medium font-mono text-foreground">{percent}%</span>
      </div>
      <div className="w-full h-1.5 bg-background border border-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-[width] duration-700 ease-out`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}