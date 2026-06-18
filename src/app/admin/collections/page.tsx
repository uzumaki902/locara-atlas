import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminCollectionsPage() {
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

  // 1. Attempt the highly optimized relational query
  let { data: collections, error } = await supabase
    .from("collections")
    .select(`
      id,
      title,
      created_at,
      is_published,
      organizations (name),
      videos (count)
    `)
    .order("created_at", { ascending: false });

  // 2. If the relational count or join fails (e.g., due to schema drift), gracefully fallback
  if (error) {
    console.warn("Relational query failed, falling back to decoupled queries:", error);
    
    // Decoupled approach: fetch all required tables concurrently. Zero N+1 queries.
    const [collectionsRes, videosRes, orgsRes] = await Promise.all([
      supabase.from("collections").select("id, title, is_published, created_at, organization_id").order("created_at", { ascending: false }),
      supabase.from("videos").select("collection_id"),
      supabase.from("organizations").select("id, name")
    ]);

    error = collectionsRes.error || videosRes.error || orgsRes.error;

    if (!error) {
      // Map organizations for quick lookup
      const orgMap = new Map(orgsRes.data?.map(org => [org.id, org.name]) || []);
      
      // Calculate video counts per collection in memory
      const videoCounts = (videosRes.data || []).reduce((acc: Record<string, number>, v) => {
        if (v.collection_id) {
          acc[v.collection_id] = (acc[v.collection_id] || 0) + 1;
        }
        return acc;
      }, {});

      // Mutate the collections array to match the relational structure so rendering is identical
      collections = (collectionsRes.data || []).map(c => ({
        ...c,
        organizations: { name: orgMap.get(c.organization_id) || "Unknown Organization" },
        videos: [{ count: videoCounts[c.id] || 0 }]
      })) as any;
    }
  }

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <h2 className="text-[24px] font-semibold text-foreground tracking-tight">Collections</h2>
        <p className="text-[14px] text-text-secondary mt-1">Manage dataset collections in the platform</p>
      </header>

      {error ? (
        <div className="bg-surface border border-red-500/20 rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-red-400">Unable to load collections.</p>
        </div>
      ) : !collections || collections.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-text-secondary">No collections found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Collection Name
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Videos
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {collections.map((col: any) => {
                // PostgREST typically returns relations as arrays [{count: 5}], but single() joins return objects. Handle both safely.
                const videoCount = Array.isArray(col.videos) ? col.videos[0]?.count || 0 : col.videos?.count || 0;
                
                const orgName = Array.isArray(col.organizations) 
                  ? col.organizations[0]?.name 
                  : col.organizations?.name || "Unknown Organization";

                return (
                  <tr key={col.id} className="hover:bg-background/40 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-[14px] font-medium text-foreground">
                        {col.title}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {orgName}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-foreground">
                        {videoCount}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded ${
                          col.is_published
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20"
                        }`}
                      >
                        {col.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {new Date(col.created_at).toLocaleDateString("en-US", {
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
