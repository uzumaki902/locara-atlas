import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "client") {
    redirect("/admin");
  }

  // Fetch organization name securely
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .single();
    
  const orgName = org?.name || "Client";

  // Fetch collections and videos scoped to this organization (handled by RLS)
  const [collectionsRes, videosRes] = await Promise.all([
    supabase.from("collections").select("id"),
    supabase.from("videos").select("*").order("recording_date", { ascending: false })
  ]);

  const collections = collectionsRes.data || [];
  const videos = videosRes.data || [];

  // Compute Metrics
  const totalVideos = videos.length;
  let totalSeconds = 0;
  videos.forEach((v) => {
    if (v.video_length) {
      const parts = v.video_length.split(":");
      if (parts.length === 3) {
        totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      } else if (parts.length === 2) {
        totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    }
  });
  const datasetHours = (totalSeconds / 3600).toFixed(1);
  const totalCollections = collections.length;
  
  const piiCleanVideos = videos.filter(v => v.pii_check_status?.toLowerCase() === "passed" || v.pii_check_status?.toLowerCase().includes("no pii")).length;
  const complianceRate = totalVideos > 0 ? Math.round((piiCleanVideos / totalVideos) * 100) : 0;

  // Compute Distributions
  const taskCounts: Record<string, number> = {};
  const resolutionCounts: Record<string, number> = {};
  const frameRateCounts: Record<string, number> = {};

  videos.forEach(v => {
    // Tasks (can be array or string depending on dirty data)
    const tasks = Array.isArray(v.task_type) ? v.task_type : [v.task_type || "Unknown Task"];
    tasks.forEach((t: string) => {
      if (t) taskCounts[t] = (taskCounts[t] || 0) + 1;
    });
    
    // Resolution
    const res = v.resolution || "Unknown";
    resolutionCounts[res] = (resolutionCounts[res] || 0) + 1;
    
    // Frame Rate
    const fps = v.frame_rate || "Unknown";
    frameRateCounts[fps] = (frameRateCounts[fps] || 0) + 1;
  });

  const taskDistribution = Object.entries(taskCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const resolutionDistribution = Object.entries(resolutionCounts).sort((a, b) => b[1] - a[1]);
  const frameRateDistribution = Object.entries(frameRateCounts).sort((a, b) => b[1] - a[1]);

  const maxTaskCount = taskDistribution.length > 0 ? taskDistribution[0][1] : 1;
  const maxResCount = resolutionDistribution.length > 0 ? resolutionDistribution[0][1] : 1;
  const maxFpsCount = frameRateDistribution.length > 0 ? frameRateDistribution[0][1] : 1;

  // Recently Added (top 5)
  const recentlyAdded = videos.slice(0, 5);

  const renderStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "approved" || s === "verified") {
      return <span className="px-2 py-[2px] rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Verified</span>;
    }
    if (s === "pending") {
      return <span className="px-2 py-[2px] rounded text-[11px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>;
    }
    return <span className="px-2 py-[2px] rounded text-[11px] font-medium bg-surface text-text-secondary border border-border">{status || "Unknown"}</span>;
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto w-full bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-[14px] text-text-secondary mt-1">
            {orgName} &middot; Dataset overview
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Total Videos</span>
              <svg className="w-4 h-4 text-accent/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
            </div>
            <span className="text-[32px] font-bold text-foreground leading-none">{totalVideos}</span>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Dataset Hours</span>
              <svg className="w-4 h-4 text-purple-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] font-bold text-foreground leading-none">{datasetHours}</span>
              <span className="text-[14px] text-text-secondary font-medium">hrs</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Collections</span>
              <svg className="w-4 h-4 text-emerald-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" /></svg>
            </div>
            <span className="text-[32px] font-bold text-foreground leading-none">{totalCollections}</span>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Compliance</span>
              <svg className="w-4 h-4 text-amber-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] font-bold text-foreground leading-none">{complianceRate}</span>
              <span className="text-[14px] text-text-secondary font-medium">%</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">Videos with No PII</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Task Dist + Recently Added) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Task Distribution */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-[14px] font-semibold text-foreground tracking-tight mb-5">Task Distribution</h2>
              {taskDistribution.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl bg-surface/30 p-12 flex flex-col items-center justify-center text-center">
                  <svg className="w-8 h-8 text-text-secondary/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2.667L7 8h4.667L13 16h4.667L19 11h2" />
                  </svg>
                  <p className="text-[13px] font-medium text-foreground">No task data available</p>
                  <p className="text-[12px] text-text-secondary mt-1 max-w-xs">Upload videos to see a breakdown of tasks.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {taskDistribution.map(([task, count]) => (
                    <div key={task} className="group">
                      <div className="flex justify-between text-[12px] text-text-secondary mb-1.5 group-hover:text-foreground transition-colors">
                        <span className="truncate pr-4">{Array.isArray(task) ? task.join(", ") : task}</span>
                        <span className="font-medium text-foreground">{count}</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                        <div className="bg-accent h-full rounded-full transition-all duration-500" style={{ width: `${(count / maxTaskCount) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Added */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-surface/50">
                <h2 className="text-[14px] font-semibold text-foreground tracking-tight">Recently Added</h2>
              </div>
              
              {recentlyAdded.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl bg-surface/30 m-6 p-12 flex flex-col items-center justify-center text-center">
                  <svg className="w-8 h-8 text-text-secondary/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-[13px] font-medium text-foreground">No videos added yet</p>
                  <p className="text-[12px] text-text-secondary mt-1">New footage will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-border">
                      {recentlyAdded.map((video) => (
                        <tr key={video.video_id} className="hover:bg-background/40 transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/?collection=all`} className="text-[13px] font-mono text-accent hover:text-accent-dim transition-colors">
                              {video.video_id}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-[12px] text-text-secondary">
                              {new Date(video.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right w-24">
                            {renderStatusBadge(video.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Quick Actions + Specs) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-[14px] font-semibold text-foreground tracking-tight mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/collections" className="group flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-accent/40 hover:bg-surface transition-all">
                  <div>
                    <h3 className="text-[13px] font-medium text-foreground group-hover:text-accent transition-colors">Browse Collections</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">View assigned datasets</p>
                  </div>
                  <svg className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors translate-x-0 group-hover:translate-x-1 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link href="/" className="group flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-accent/40 hover:bg-surface transition-all">
                  <div>
                    <h3 className="text-[13px] font-medium text-foreground group-hover:text-accent transition-colors">Search Dataset</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">Filter and find videos</p>
                  </div>
                  <svg className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors translate-x-0 group-hover:translate-x-1 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link href="/requests" className="group flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-accent/40 hover:bg-surface transition-all">
                  <div>
                    <h3 className="text-[13px] font-medium text-foreground group-hover:text-accent transition-colors">Request Data</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">Ask for more footage</p>
                  </div>
                  <svg className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors translate-x-0 group-hover:translate-x-1 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>

            {/* Resolution */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-[14px] font-semibold text-foreground tracking-tight mb-5">Resolution</h2>
              {resolutionDistribution.length === 0 ? (
                <div className="text-[12px] text-text-secondary text-center py-4">No data</div>
              ) : (
                <div className="space-y-3.5">
                  {resolutionDistribution.map(([res, count]) => (
                    <div key={res} className="group">
                      <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                        <span className="font-mono">{res}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                        <div className="bg-purple-400 h-full rounded-full transition-all duration-500" style={{ width: `${(count / maxResCount) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Frame Rate */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-[14px] font-semibold text-foreground tracking-tight mb-5">Frame Rate</h2>
              {frameRateDistribution.length === 0 ? (
                <div className="text-[12px] text-text-secondary text-center py-4">No data</div>
              ) : (
                <div className="space-y-3.5">
                  {frameRateDistribution.map(([fps, count]) => (
                    <div key={fps} className="group">
                      <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                        <span className="font-mono">{fps}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${(count / maxFpsCount) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
