import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

function renderStatusBadge(status: string) {
  const s = status?.toLowerCase() || "unknown";
  
  if (s === "approved" || s === "delivered") {
    return <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500 text-white shadow-sm capitalize">{status}</span>;
  }
  if (s === "closed" || s === "rejected") {
    return <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-red-500 text-white shadow-sm capitalize">{status}</span>;
  }
  if (s === "under review") {
    return <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500 text-white shadow-sm capitalize">Under Review</span>;
  }
  if (s === "pending" || s === "submitted") {
    return <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500 text-white shadow-sm capitalize">{status}</span>;
  }
  return <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-500 text-white shadow-sm capitalize">{status || "Unknown"}</span>;
}

export default async function AdminPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/collections");
  }

  const [
    orgs, usersCount, collections, videos, requests,
    { data: recentVideos },
    { data: recentRequests },
    { data: allVideos }
  ] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("collections").select("*", { count: "exact", head: true }),
    supabase.from("videos").select("*", { count: "exact", head: true }),
    supabase.from("dataset_requests").select("*", { count: "exact", head: true }),
    supabase.from("videos").select("video_id, task_type, created_at, thumbnail_url").order("created_at", { ascending: false }).limit(5),
    supabase.from("dataset_requests").select("id, created_at, task_type, status, profiles(full_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("videos").select("task_type")
  ]);

  const metrics = [
    { label: "Organizations", count: orgs.count ?? 0, href: "/admin/organizations" },
    { label: "Users", count: usersCount.count ?? 0, href: "/admin/users" },
    { label: "Collections", count: collections.count ?? 0, href: "/admin/collections" },
    { label: "Videos", count: videos.count ?? 0, href: "/admin/videos" },
    { label: "Requests", count: requests.count ?? 0, href: "/admin/requests" },
  ];

  // Compute Task Distribution
  const taskCounts: Record<string, number> = {};
  let totalVideosWithTask = 0;
  if (allVideos) {
    allVideos.forEach(v => {
      if (v.task_type) {
        taskCounts[v.task_type] = (taskCounts[v.task_type] || 0) + 1;
        totalVideosWithTask++;
      }
    });
  }
  
  const topTasks = Object.entries(taskCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([task, count]) => ({
      task,
      count,
      percentage: totalVideosWithTask > 0 ? Math.round((count / totalVideosWithTask) * 100) : 0
    }));

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h2 className="text-[24px] font-semibold text-foreground tracking-tight">Dashboard</h2>
        <p className="text-[14px] text-text-secondary mt-1">Operational Command Center</p>
      </header>

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group relative bg-surface border border-border rounded-xl p-5 flex flex-col hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-[11px] text-text-secondary uppercase tracking-wider mb-2 font-semibold relative z-10">
              {m.label}
            </span>
            <span className="text-[32px] font-bold text-foreground leading-none relative z-10 group-hover:text-accent transition-colors">
              {m.count}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Operational Hub */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              <Link href="/admin/requests" className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 15.75h3.75m-3.75 2.25h3.75m-3.75-12h3.75m-3.75 2.25h3.75m-6-6v15m10.5-15v15" /></svg>
                Review Requests
              </Link>
              <Link href="/admin/users" className="flex items-center gap-2 bg-background hover:bg-border/50 text-foreground border border-border px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors flex-shrink-0">
                <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                Manage Users
              </Link>
              <Link href="/admin/videos" className="flex items-center gap-2 bg-background hover:bg-border/50 text-foreground border border-border px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors flex-shrink-0">
                <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                Add Content
              </Link>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <h3 className="text-[16px] font-semibold text-foreground">Pending Action: Requests</h3>
              <Link href="/admin/requests" className="text-[12px] text-text-secondary hover:text-accent font-medium transition-colors">View All &rarr;</Link>
            </div>
            <div className="flex-1">
              {!recentRequests || recentRequests.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-text-secondary">No recent requests.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {recentRequests.map((req: any) => {
                    const profileName = Array.isArray(req.profiles)
                      ? req.profiles[0]?.full_name
                      : req.profiles?.full_name || "Unknown User";

                    return (
                      <li key={req.id} className="p-4 px-6 hover:bg-background/50 transition-colors flex items-center justify-between group">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-foreground">{req.task_type}</span>
                          <span className="text-[11px] text-text-secondary mt-0.5">
                            {profileName} • {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {renderStatusBadge(req.status)}
                          <Link href="/admin/requests">
                            <svg className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: System Feed & Insights */}
        <div className="flex flex-col gap-6">
          
          {/* Task Distribution (Native CSS) */}
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
            <h3 className="text-[16px] font-semibold text-foreground mb-4">Platform Task Distribution</h3>
            {topTasks.length === 0 ? (
              <p className="text-[13px] text-text-secondary text-center py-4">No data available.</p>
            ) : (
              <div className="space-y-4">
                {topTasks.map((t) => (
                  <div key={t.task}>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span className="font-medium text-foreground">{t.task}</span>
                      <span className="text-text-secondary font-mono">{t.percentage}%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-1.5 border border-border/50 overflow-hidden">
                      <div className="bg-accent h-1.5 rounded-full" style={{ width: `${t.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Videos Feed */}
          <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col flex-1">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <h3 className="text-[16px] font-semibold text-foreground">Recently Ingested</h3>
              <Link href="/admin/videos" className="text-[12px] text-text-secondary hover:text-accent font-medium transition-colors">View All &rarr;</Link>
            </div>
            <div className="p-2">
              {!recentVideos || recentVideos.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-text-secondary">No recent videos.</div>
              ) : (
                <ul className="space-y-1">
                  {recentVideos.map((video: any) => (
                    <Link href="/admin/videos" key={video.video_id}>
                      <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded border border-border bg-background flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                          {video.thumbnail_url ? (
                            <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <svg className="w-4 h-4 text-text-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[13px] font-semibold text-foreground truncate group-hover:text-accent transition-colors">{video.task_type}</span>
                          <span className="text-[11px] font-mono text-text-secondary truncate mt-0.5">{video.video_id}</span>
                        </div>
                        <span className="text-[10px] text-text-secondary whitespace-nowrap">
                          {new Date(video.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}