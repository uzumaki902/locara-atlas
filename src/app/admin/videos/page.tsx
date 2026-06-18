import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminVideosPage() {
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

  // The database schema guarantees a direct foreign key from videos.collection_id to collections.id.
  // We use a single, strict relational query with no runtime fallbacks.
  const { data: videos, error } = await supabase
    .from("videos")
    .select(`
      video_id,
      worker_id,
      main_category,
      task_type,
      recording_date,
      collections (title)
    `)
    .order("recording_date", { ascending: false });

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <h2 className="text-[24px] font-semibold text-foreground tracking-tight">Videos</h2>
        <p className="text-[14px] text-text-secondary mt-1">Manage uploaded dataset videos</p>
      </header>

      {error ? (
        <div className="bg-surface border border-red-500/20 rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-red-400">Unable to load videos.</p>
        </div>
      ) : !videos || videos.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-text-secondary">No videos found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider w-16">
                  {/* Thumbnail Placeholder Column */}
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Video ID
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Collection
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Task Type
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {videos.map((vid: any) => {
                const collectionName = Array.isArray(vid.collections) 
                  ? vid.collections[0]?.title 
                  : vid.collections?.title || "Unassigned";

                return (
                  <tr key={vid.video_id} className="hover:bg-background/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-10 h-6 bg-background border border-border rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-text-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Link 
                        href={`/video/${vid.video_id}`}
                        className="text-[13px] font-medium text-accent hover:underline"
                      >
                        {vid.video_id.split('-')[0]}...
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-foreground">
                        {vid.worker_id}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {collectionName}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {vid.main_category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {vid.task_type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {new Date(vid.recording_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
