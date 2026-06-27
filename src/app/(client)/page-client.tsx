"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

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
  thumbnailUrl?: string;
}

function statusColor(status: Video["status"]): string {
  switch (status) {
    case "Completed":
      return "bg-emerald-500 text-white border-transparent";
    case "In Review":
      return "bg-amber-500 text-white border-transparent";
    case "Processing":
      return "bg-blue-500 text-white border-transparent";
    case "Pending":
      return "bg-zinc-500 text-white border-transparent";
  }
}

function piiColor(pii: Video["piiCheckStatus"]): string {
  switch (pii) {
    case "Passed":
      return "text-blue-500";
    case "Pending":
      return "text-amber-500";
    case "Flagged":
      return "text-red-500";
  }
}

function getVideoSource(video: Video | undefined): string {
  if (!video) return "";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Base filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  
  // Advanced filters from PRD
  const [frameRateFilter, setFrameRateFilter] = useState("All");
  const [resolutionFilter, setResolutionFilter] = useState("All");
  const [audioQualityFilter, setAudioQualityFilter] = useState("All");
  const [piiStatusFilter, setPiiStatusFilter] = useState("All");
  const [lightingQualityFilter, setLightingQualityFilter] = useState("All");
  const [handsVisibleFilter, setHandsVisibleFilter] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
    () => videos.find((v) => v.videoId === selectedId),
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
          
        const matchesFrameRate = frameRateFilter === "All" || v.frameRate === frameRateFilter;
        const matchesResolution = resolutionFilter === "All" || v.resolution === resolutionFilter;
        const matchesAudioQuality = audioQualityFilter === "All" || v.audioQuality === audioQualityFilter;
        
        let matchesPii = true;
        if (piiStatusFilter === "No PII") matchesPii = v.piiCheckStatus === "Passed";
        if (piiStatusFilter === "Blurred Required") matchesPii = v.piiCheckStatus !== "Passed";
        
        const matchesLighting = lightingQualityFilter === "All" || v.lightingQuality === lightingQualityFilter;
        const matchesHands = !handsVisibleFilter || v.handsVisible === true;

        return matchesSearch && matchesCategory && matchesFrameRate && matchesResolution && matchesAudioQuality && matchesPii && matchesLighting && matchesHands;
      }),
    [search, activeCategory, frameRateFilter, resolutionFilter, audioQualityFilter, piiStatusFilter, lightingQualityFilter, handsVisibleFilter, videos]
  );

  useEffect(() => {
    if (selectedId && videoRef.current) {
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

  if (selectedId && selected) {
    const relatedVideos = videos
      .filter((v) => v.videoId !== selectedId && (v.taskType === selected.taskType || v.mainCategory === selected.mainCategory))
      .slice(0, 6);

    // ─── VIDEO DETAIL VIEW ───
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
        {/* Top bar */}
        <header className="h-16 min-h-[64px] flex items-center justify-between px-6 border-b border-border bg-background shrink-0">
          <div className="flex items-center gap-5 min-w-0">
            <button 
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 text-[14px] font-medium px-3 py-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Explorer
            </button>
            <div className="h-5 w-px bg-border"></div>
            <div className="min-w-0">
              <h2 className="text-[18px] font-semibold text-foreground truncate">
                {selected.taskType}
              </h2>
              <p className="text-[13px] font-normal text-text-secondary mt-0.5">
                {selected.mainCategory} · {selected.videoId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-medium text-text-secondary">
              {selected.mainCategory}
            </span>
            <span
              className={`text-[12px] font-medium px-2.5 py-[3px] rounded-md ${statusColor(
                selected.status
              )}`}
            >
              {selected.status}
            </span>
          </div>
        </header>

        {/* Player + Metadata */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Video Player Area */}
          <div className="flex-1 flex flex-col min-w-0 p-6 overflow-y-auto bg-surface/10">
            <div ref={videoContainerRef} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-border shadow-2xl flex items-center justify-center group flex-shrink-0">
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
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[12px] text-white font-mono w-12 text-right">{formatTime(progress)}</span>
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={progress}
                          onChange={handleSeek}
                          className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer accent-accent"
                          aria-label="Seek video"
                        />
                      <span className="text-[12px] text-white font-mono w-12">{formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <button onClick={togglePlay} className="text-white hover:text-white/70 transition-colors" aria-label={isPlaying ? "Pause video" : "Play video"}>
                          {isPlaying ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          )}
                        </button>

                        <div className="flex items-center gap-3 relative">
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
                              className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-accent"
                              aria-label="Volume"
                            />
                        </div>
                      </div>

                      <button onClick={toggleFullscreen} className="text-white hover:text-white/70 transition-colors" aria-label="Toggle fullscreen">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                  <div className="w-20 h-20 rounded-xl bg-surface border border-border flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-text-secondary/50"
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
                    <p className="text-[16px] font-medium text-foreground mb-1">
                      Internal Storage Reference Missing
                    </p>
                    <p className="text-[14px] font-normal text-text-secondary max-w-sm mx-auto">
                      A Protected Asset URL must be configured for <strong>{selected.videoId}</strong> to enable playback.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* MVP Activity Timeline */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[14px] font-bold text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>
                  Activity Timeline
                </h3>
              </div>
              <div className="relative group">
                <div className="h-3.5 w-full bg-surface border border-border rounded-md overflow-hidden flex relative cursor-crosshair shadow-inner">
                  {/* Generated dummy segmented timeline for demo purposes */}
                  <div className="h-full bg-slate-500/80 transition-all hover:bg-slate-500 border-r border-black/20" style={{ width: '15%' }} title="Preparation"></div>
                  <div className="h-full bg-accent/80 transition-all hover:bg-accent border-r border-black/20" style={{ width: '60%' }} title={selected.taskType}></div>
                  <div className="h-full bg-emerald-500/80 transition-all hover:bg-emerald-500 border-r border-black/20" style={{ width: '25%' }} title="Cleanup"></div>
                </div>
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[11px] font-mono text-text-secondary">00:00</span>
                  
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-medium text-text-secondary bg-surface border border-border px-1.5 py-0.5 rounded shadow-sm hidden sm:inline-block">Preparation</span>
                    <svg className="w-3 h-3 text-text-secondary/50 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                    <span className="text-[12px] font-medium text-foreground bg-surface border border-border px-2 py-0.5 rounded shadow-sm border-accent/30">{selected.taskType}</span>
                    <svg className="w-3 h-3 text-text-secondary/50 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                    <span className="text-[10px] font-medium text-text-secondary bg-surface border border-border px-1.5 py-0.5 rounded shadow-sm hidden sm:inline-block">Cleanup</span>
                  </div>

                  <span className="text-[11px] font-mono text-text-secondary">{selected.videoLength}</span>
                </div>
              </div>
            </div>

            {/* Quick stats bar below video */}
            <div className="flex items-center gap-4 mt-6 flex-wrap pb-6 border-b border-border">
              {[
                { label: "Duration", value: selected.videoLength },
                { label: "Resolution", value: selected.resolution },
                { label: "Frame Rate", value: selected.frameRate },
                { label: "File Size", value: selected.fileSize },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2.5 bg-surface border border-border rounded-lg px-4 py-2 hover:border-border-hover transition-colors"
                >
                  <span className="text-[12px] font-medium uppercase tracking-wider text-text-secondary">
                    {s.label}
                  </span>
                  <span className="text-[14px] font-semibold font-mono text-foreground">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <div className="mt-6 mb-6">
                <h3 className="text-[16px] font-bold text-foreground mb-4">More from this Collection</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                  {relatedVideos.map((v) => (
                    <div 
                      key={v.videoId} 
                      onClick={() => handleSelect(v.videoId)}
                      className="w-[240px] shrink-0 cursor-pointer group snap-start"
                    >
                      <div className="relative aspect-video bg-surface rounded-lg overflow-hidden border border-border mb-2">
                        {v.thumbnailUrl ? (
                          <img src={v.thumbnailUrl} alt={v.taskType} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-surface/50">
                            <svg className="w-6 h-6 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <svg className="w-8 h-8 text-white shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                        <div className="absolute bottom-1 right-1">
                          <span className="bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10">{v.videoLength}</span>
                        </div>
                      </div>
                      <h4 className="text-[13px] font-semibold text-foreground truncate group-hover:text-accent transition-colors">{v.taskType}</h4>
                      <p className="text-[11px] text-text-secondary truncate mt-0.5">{v.mainCategory} • {v.videoId}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── METADATA PANEL ─── */}
          <aside className="w-full lg:w-[400px] lg:min-w-[400px] border-l border-border bg-background flex-shrink-0 overflow-y-auto">
            <div className="px-6 py-5 border-b border-border bg-surface/30">
              <h3 className="text-[18px] font-semibold text-foreground tracking-tight">
                Metadata
              </h3>
              <p className="text-[14px] font-normal text-text-secondary mt-1">
                All fields for {selected.videoId}
              </p>
            </div>

            <div className="px-6 py-6 space-y-5">
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
                      className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded ${statusColor(
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
                          ? "text-emerald-400 font-medium"
                          : "text-red-400 font-medium"
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
                    <span className={`text-[13px] font-medium ${piiColor(selected.piiCheckStatus)}`}>
                      {selected.piiCheckStatus}
                    </span>
                  }
                />
              </MetadataSection>
            </div>

            <div className="px-6 pb-6 pt-2 space-y-3">

              <Link
                href={`/requests?task=${encodeURIComponent(selected.taskType)}&env=${encodeURIComponent(selected.locationEnvironment)}`}
                className="w-full py-2.5 px-4 bg-accent hover:bg-accent/90 rounded-lg text-[13px] font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Request Similar Data
              </Link>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // ─── DATASET EXPLORER (GRID VIEW) ───
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* ─── LEFT SIDEBAR (Filters) ─── */}
      <aside className="w-full md:w-[280px] lg:w-[320px] md:min-w-[280px] lg:min-w-[320px] flex flex-col border-r border-border bg-background flex-shrink-0 overflow-y-auto">
        <div className="px-5 pt-5 pb-5 border-b border-border bg-surface/30">
          <div className="min-w-0">
            {role === "client" ? (
              <div className="leading-tight">
                <p className="text-[16px] font-bold text-foreground truncate tracking-tight" title={collectionTitle || "Collection"}>
                  {collectionTitle || "Collection"}
                </p>
                <p className="text-[13px] font-medium text-text-secondary mt-1">{videos.length} {videos.length === 1 ? "Video" : "Videos"}</p>
              </div>
            ) : (
              <p className="text-[15px] font-bold text-foreground leading-tight truncate">
                Sample Dataset Explorer
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1.5">
                <svg className="w-4 h-4 text-accent/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">Total</span>
              </div>
              <span className="text-[22px] font-bold text-foreground leading-tight tracking-tight">{datasetStats.totalVideos}</span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1.5">
                <svg className="w-4 h-4 text-accent/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">Footage</span>
              </div>
              <span className="text-[22px] font-bold text-foreground leading-tight tracking-tight">{datasetStats.durationStr}</span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1.5">
                <svg className="w-4 h-4 text-emerald-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">Approved</span>
              </div>
              <span className="text-[22px] font-bold text-foreground leading-tight tracking-tight">{datasetStats.approvedVideos}</span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
              <div className="flex items-center gap-2 mb-1.5">
                <svg className="w-4 h-4 text-accent/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" /></svg>
                <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">Categories</span>
              </div>
              <span className="text-[22px] font-bold text-foreground leading-tight tracking-tight">{datasetStats.totalCategories}</span>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 pb-4 border-b border-border">
          <h3 className="text-[12px] font-bold text-text-secondary uppercase tracking-widest mb-3">
            Search
          </h3>
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
              placeholder="Search IDs, tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-[14px] rounded-lg bg-surface border border-border text-foreground placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all"
            />
          </div>
        </div>

        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div
            className="flex items-center justify-between cursor-pointer group mb-3"
            onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
          >
            <h3 className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">
              Categories
            </h3>
            <svg
              className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${isCategoriesExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${isCategoriesExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="flex flex-col gap-2.5">
              {categories.map((cat) => {
                const isActive = cat === activeCategory;
                const count = cat === "All"
                    ? videos.length
                    : videos.filter((v) => v.mainCategory === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left w-full
                      ${isActive
                        ? "bg-accent/15 text-accent font-semibold"
                        : "text-text-secondary hover:bg-surface hover:text-foreground font-medium"
                      }
                    `}
                  >
                    <span className="text-[13px]">{cat}</span>
                    <span className={`text-[12px] ${isActive ? "text-accent/80" : "text-text-secondary/60"} font-mono`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── NEW PRD FILTERS ─── */}
        <div className="px-5 pt-5 pb-6 border-b border-border bg-surface/10">
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 0H4.5m4.5 12h9.75M10.5 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 0H4.5m4.5-6h-9.75M15 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 0h9.75" />
              </svg>
              <h3 className="text-[13px] font-bold text-foreground">Filters</h3>
            </div>
            <svg
              className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${isFiltersExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isFiltersExpanded ? "max-h-[1000px] opacity-100 mt-5" : "max-h-0 opacity-0 mt-0"}`}>
            <div className="flex flex-col gap-6">
              
              {/* FRAME RATE */}
              <div>
                <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-3">Frame Rate</h4>
                <div className="flex flex-col gap-2.5">
                  {["All", "30fps", "60fps"].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${frameRateFilter === opt ? 'border-accent bg-transparent' : 'border-border group-hover:border-accent/50'}`}>
                        {frameRateFilter === opt && <div className="w-2 h-2 rounded-full bg-accent" />}
                      </div>
                      <input type="radio" className="hidden" checked={frameRateFilter === opt} onChange={() => setFrameRateFilter(opt)} />
                      <span className={`text-[13px] ${frameRateFilter === opt ? "text-foreground font-medium" : "text-text-secondary group-hover:text-foreground/80"}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* RESOLUTION */}
              <div>
                <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-3">Resolution</h4>
                <div className="flex flex-col gap-2.5">
                  {["All", "1080p", "720p"].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${resolutionFilter === opt ? 'border-accent bg-transparent' : 'border-border group-hover:border-accent/50'}`}>
                        {resolutionFilter === opt && <div className="w-2 h-2 rounded-full bg-accent" />}
                      </div>
                      <input type="radio" className="hidden" checked={resolutionFilter === opt} onChange={() => setResolutionFilter(opt)} />
                      <span className={`text-[13px] ${resolutionFilter === opt ? "text-foreground font-medium" : "text-text-secondary group-hover:text-foreground/80"}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AUDIO QUALITY */}
              <div>
                <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-3">Audio Quality</h4>
                <div className="flex flex-col gap-2.5">
                  {["All", "Good", "Poor"].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${audioQualityFilter === opt ? 'border-accent bg-transparent' : 'border-border group-hover:border-accent/50'}`}>
                        {audioQualityFilter === opt && <div className="w-2 h-2 rounded-full bg-accent" />}
                      </div>
                      <input type="radio" className="hidden" checked={audioQualityFilter === opt} onChange={() => setAudioQualityFilter(opt)} />
                      <span className={`text-[13px] ${audioQualityFilter === opt ? "text-foreground font-medium" : "text-text-secondary group-hover:text-foreground/80"}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* PII STATUS */}
              <div>
                <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-3">PII Status</h4>
                <div className="flex flex-col gap-2.5">
                  {["All", "No PII", "Blurred Required"].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${piiStatusFilter === opt ? 'border-accent bg-transparent' : 'border-border group-hover:border-accent/50'}`}>
                        {piiStatusFilter === opt && <div className="w-2 h-2 rounded-full bg-accent" />}
                      </div>
                      <input type="radio" className="hidden" checked={piiStatusFilter === opt} onChange={() => setPiiStatusFilter(opt)} />
                      <span className={`text-[13px] ${piiStatusFilter === opt ? "text-foreground font-medium" : "text-text-secondary group-hover:text-foreground/80"}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* LIGHTING QUALITY */}
              <div>
                <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-3">Lighting Quality</h4>
                <div className="flex flex-col gap-2.5">
                  {["All", "Good", "Poor"].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${lightingQualityFilter === opt ? 'border-accent bg-transparent' : 'border-border group-hover:border-accent/50'}`}>
                        {lightingQualityFilter === opt && <div className="w-2 h-2 rounded-full bg-accent" />}
                      </div>
                      <input type="radio" className="hidden" checked={lightingQualityFilter === opt} onChange={() => setLightingQualityFilter(opt)} />
                      <span className={`text-[13px] ${lightingQualityFilter === opt ? "text-foreground font-medium" : "text-text-secondary group-hover:text-foreground/80"}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* HANDS VISIBLE */}
              <div>
                <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-3">Hands Visible</h4>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-text-secondary">Show only</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={handsVisibleFilter} onChange={(e) => setHandsVisibleFilter(e.target.checked)} />
                    <div className="w-9 h-5 bg-surface border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent peer-checked:border-accent"></div>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT (Video Grid) ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background/50 p-6 md:p-8">
        <div className="mb-6 flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground">Dataset Explorer</h1>
            <p className="text-[14px] text-text-secondary mt-1">
              Showing {filtered.length} {filtered.length === 1 ? 'video' : 'videos'} matching filters
            </p>
          </div>
          <div className="flex items-center bg-surface border border-border p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-accent/15 text-accent shadow-sm" : "text-text-secondary hover:text-foreground"}`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-accent/15 text-accent shadow-sm" : "text-text-secondary hover:text-foreground"}`}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/50 rounded-2xl bg-surface/10">
            <svg className="w-12 h-12 text-text-secondary/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="text-[16px] font-semibold text-foreground">No videos found</p>
            <p className="text-[14px] text-text-secondary mt-1 max-w-sm">Adjust your search or category filters to find what you're looking for.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-12">
            {filtered.map((v) => (
              <div
                key={v.videoId}
                className="relative group z-10 hover:z-50"
              >
                {/* 1. Base Card */}
                <div 
                  onClick={() => handleSelect(v.videoId)}
                  className="cursor-pointer flex flex-col gap-3 transition-transform duration-300"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-surface border border-border shadow-sm">
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} alt={v.taskType} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-surface/50">
                        <svg className="w-8 h-8 text-text-secondary/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex gap-1.5 z-20">
                      {v.status === "Completed" && (
                        <span className="bg-emerald-500 text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow-sm">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 z-20">
                      <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-medium px-2 py-[2px] rounded-md border border-white/10 shadow-sm">
                        {v.videoLength}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1.5 z-20">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md shadow-sm text-white ${
                        v.piiCheckStatus === "Passed" ? "bg-blue-500" : v.piiCheckStatus === "Flagged" ? "bg-red-500" : "bg-amber-500"
                      }`}>
                        {v.piiCheckStatus === "Passed" ? "No PII" : v.piiCheckStatus}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 px-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[15px] font-semibold text-foreground leading-tight line-clamp-1 group-hover:text-accent transition-colors">
                        {v.taskType}
                      </h3>
                    </div>
                    <p className="text-[13px] text-text-secondary line-clamp-1">
                      {v.mainCategory}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-text-secondary font-mono bg-surface border border-border px-1.5 py-0.5 rounded text-text-secondary/70" title={v.videoId}>
                        {v.videoId.length > 8 ? `${v.videoId.substring(0, 8)}...` : v.videoId}
                      </span>
                      <span className="text-[12px] text-text-secondary/60 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        {v.locationEnvironment.split("_").join(" ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Hover Popup Box (Fades in over the base card) */}
                <div 
                  className="absolute -inset-x-3 -top-3 bg-surface/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 scale-[0.98] group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto flex flex-col z-50 overflow-hidden"
                  style={{ maxHeight: '450px' }}
                >
                   {/* Popup Thumbnail */}
                   <div className="relative aspect-video bg-background shrink-0 cursor-pointer border-b border-border/50" onClick={() => handleSelect(v.videoId)}>
                     {v.thumbnailUrl ? (
                       <img src={v.thumbnailUrl} alt={v.taskType} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-surface/50">
                         <svg className="w-8 h-8 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                         </svg>
                       </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                       <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transform scale-90 hover:scale-100 transition-transform">
                         <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                       </div>
                     </div>
                     {/* Badges in popup */}
                     <div className="absolute top-2.5 left-2.5">
                       <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md shadow-sm text-white ${
                         v.piiCheckStatus === "Passed" ? "bg-blue-500" : v.piiCheckStatus === "Flagged" ? "bg-red-500" : "bg-amber-500"
                       }`}>
                         {v.piiCheckStatus === "Passed" ? "No PII" : v.piiCheckStatus}
                       </span>
                     </div>
                     {v.status === "Completed" && (
                       <div className="absolute top-2.5 right-2.5">
                         <span className="bg-emerald-500 text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow-sm">
                           Verified
                         </span>
                       </div>
                     )}
                     <div className="absolute bottom-2.5 right-2.5">
                       <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-medium px-2 py-[2px] rounded-md border border-white/10 shadow-sm">
                         {v.videoLength}
                       </span>
                     </div>
                   </div>

                   {/* Popup Scrollable Details */}
                   <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
                     <h4 className="text-[15px] font-bold text-foreground leading-tight mb-3 pr-2">{v.taskType}</h4>
                     
                     <div className="flex flex-col gap-2.5">
                       <div className="flex justify-between items-center gap-2">
                         <span className="text-[12px] font-medium text-text-secondary whitespace-nowrap">Resolution</span>
                         <span className="text-[12px] font-bold text-foreground font-mono text-right">{v.resolution}</span>
                       </div>
                       <div className="flex justify-between items-center gap-2">
                         <span className="text-[12px] font-medium text-text-secondary whitespace-nowrap">Frame Rate</span>
                         <span className="text-[12px] font-bold text-foreground font-mono text-right">{v.frameRate}</span>
                       </div>
                       <div className="flex justify-between items-center gap-2">
                         <span className="text-[12px] font-medium text-text-secondary whitespace-nowrap">Worker ID</span>
                         <span className="text-[12px] font-bold text-foreground font-mono truncate text-right max-w-[120px]" title={v.workerId}>{v.workerId}</span>
                       </div>
                       <div className="flex justify-between items-center gap-2">
                         <span className="text-[12px] font-medium text-text-secondary whitespace-nowrap">Category</span>
                         <span className="text-[12px] font-bold text-foreground truncate text-right max-w-[120px]" title={v.mainCategory}>{v.mainCategory}</span>
                       </div>
                       <div className="flex justify-between items-center gap-2">
                         <span className="text-[12px] font-medium text-text-secondary whitespace-nowrap">Audio Quality</span>
                         <span className="text-[12px] font-bold text-foreground text-right">{v.audioQuality}</span>
                       </div>
                       <div className="flex justify-between items-center gap-2">
                         <span className="text-[12px] font-medium text-text-secondary whitespace-nowrap">Lighting</span>
                         <span className="text-[12px] font-bold text-foreground text-right">{v.lightingQuality}</span>
                       </div>
                       <div className="flex justify-between items-center gap-2">
                         <span className="text-[12px] font-medium text-text-secondary whitespace-nowrap">Recorded</span>
                         <span className="text-[12px] font-bold text-foreground text-right">{v.recordingDate}</span>
                       </div>
                       <div className="flex justify-between items-center gap-2">
                         <span className="text-[12px] font-medium text-text-secondary whitespace-nowrap">Environment</span>
                         <span className="text-[12px] font-bold text-foreground text-right">{v.locationEnvironment.split('_').join(' ')}</span>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-12">
            {filtered.map((v) => (
              <div
                key={v.videoId}
                onClick={() => handleSelect(v.videoId)}
                className="flex items-center gap-6 bg-surface border border-border rounded-xl p-3 hover:border-accent/40 hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden shrink-0 border border-border/50">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt={v.taskType} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface/50">
                      <svg className="w-6 h-6 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 z-20">
                    <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-medium px-2 py-[2px] rounded-md border border-white/10 shadow-sm">
                      {v.videoLength}
                    </span>
                  </div>
                </div>

                {/* Info Columns */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  
                  {/* Title & Task */}
                  <div className="flex flex-col gap-1 col-span-2">
                    <h3 className="text-[15px] font-semibold text-foreground leading-tight truncate group-hover:text-accent transition-colors">
                      {v.taskType}
                    </h3>
                    <div className="flex items-center gap-3">
                      <p className="text-[13px] text-text-secondary truncate">
                        {v.mainCategory}
                      </p>
                      <span className="text-[11px] text-text-secondary font-mono bg-surface border border-border px-1.5 py-0.5 rounded text-text-secondary/70">
                        {v.videoId.length > 8 ? `${v.videoId.substring(0, 8)}...` : v.videoId}
                      </span>
                    </div>
                  </div>

                  {/* Environment & Tech */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-text-secondary flex items-center gap-1.5 truncate">
                      <svg className="w-4 h-4 shrink-0 text-text-secondary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {v.locationEnvironment.split("_").join(" ")}
                    </span>
                    <span className="text-[12px] text-text-secondary font-mono flex items-center gap-2">
                      {v.resolution} • {v.frameRate}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md shadow-sm text-white shrink-0 ${
                      v.piiCheckStatus === "Passed" ? "bg-blue-500" : v.piiCheckStatus === "Flagged" ? "bg-red-500" : "bg-amber-500"
                    }`}>
                      {v.piiCheckStatus === "Passed" ? "No PII" : v.piiCheckStatus}
                    </span>
                    {v.status === "Completed" && (
                      <span className="bg-emerald-500 text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow-sm shrink-0">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
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
      <h4 className="text-[13px] font-bold text-foreground mb-3 pb-2 border-b border-border/50 uppercase tracking-wide">
        {title}
      </h4>
      <div className="space-y-1.5 bg-surface/50 border border-border rounded-xl p-4">
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
      <span className="text-[13px] font-medium text-text-secondary flex-shrink-0">{label}</span>
      <span
        className={`text-[14px] font-medium text-foreground text-right ${mono ? "font-mono text-[13px]" : ""
          }`}
      >
        {value}
      </span>
    </div>
  );
}

function ProgressBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div className="flex flex-col gap-1.5 w-full py-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-text-secondary">{label}</span>
        <span className="text-[12px] font-medium font-mono text-foreground">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-background border border-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-[width] duration-700 ease-out`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}