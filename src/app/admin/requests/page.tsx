import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RequestRowActions } from "./request-form";

export default async function AdminRequestsPage() {
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

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminClient = createAdminClient();

  // Try relational query first, fallback to decoupled
  let requests: any[] | null = null;
  let error: any = null;

  const result = await adminClient
    .from("dataset_requests")
    .select(`
      id,
      task_type,
      environment,
      hours_needed,
      deadline,
      notes,
      status,
      created_at,
      user_id,
      organization_id,
      profiles (full_name),
      organizations (name)
    `)
    .order("created_at", { ascending: false });

  if (result.error) {
    const [reqRes, profilesRes, orgsRes] = await Promise.all([
      adminClient.from("dataset_requests").select("*").order("created_at", { ascending: false }),
      adminClient.from("profiles").select("id, full_name"),
      adminClient.from("organizations").select("id, name"),
    ]);
    error = reqRes.error || profilesRes.error || orgsRes.error;
    if (!error) {
      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p.full_name]));
      const orgMap = new Map((orgsRes.data || []).map(o => [o.id, o.name]));
      requests = (reqRes.data || []).map(r => ({
        ...r,
        profiles: { full_name: profileMap.get(r.user_id) || "Unknown User" },
        organizations: { name: orgMap.get(r.organization_id) || "Unknown Organization" },
      }));
    }
  } else {
    requests = result.data;
  }

  // Helper function to render status badges
  const renderStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "unknown";
    
    if (s === "approved" || s === "delivered") {
      return (
        <span className="inline-flex px-2.5 py-1 rounded-md text-[12px] font-medium bg-emerald-500 text-white shadow-sm">
          <span className="capitalize">{status}</span>
        </span>
      );
    }
    if (s === "closed" || s === "rejected") {
      return (
        <span className="inline-flex px-2.5 py-1 rounded-md text-[12px] font-medium bg-red-500 text-white shadow-sm">
          <span className="capitalize">{status}</span>
        </span>
      );
    }
    if (s === "under review") {
      return (
        <span className="inline-flex px-2.5 py-1 rounded-md text-[12px] font-medium bg-blue-500 text-white shadow-sm">
          <span className="capitalize">Under Review</span>
        </span>
      );
    }
    if (s === "pending" || s === "submitted") {
      return (
        <span className="inline-flex px-2.5 py-1 rounded-md text-[12px] font-medium bg-amber-500 text-white shadow-sm">
          <span className="capitalize">{status}</span>
        </span>
      );
    }
    
    return (
      <span className="inline-flex px-2.5 py-1 rounded-md text-[12px] font-medium bg-zinc-500 text-white shadow-sm">
        <span className="capitalize">{status || "Unknown"}</span>
      </span>
    );
  };

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h2 className="text-[24px] font-semibold text-foreground tracking-tight">Dataset Requests</h2>
        <p className="text-[14px] text-text-secondary mt-1">Manage dataset provisioning requests</p>
      </header>

      {error ? (
        <div className="bg-surface border border-red-500/20 rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-red-400">Unable to load dataset requests.</p>
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-text-secondary">No dataset requests found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Task Type
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-right w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((req: any) => {
                const profileName = Array.isArray(req.profiles)
                  ? req.profiles[0]?.full_name
                  : req.profiles?.full_name || "Unknown User";
                  
                const orgName = Array.isArray(req.organizations) 
                  ? req.organizations[0]?.name 
                  : req.organizations?.name || "Unknown Organization";

                return (
                  <tr key={req.id} className="hover:bg-background/40 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-foreground">
                        {(req.id || 'N/A').split('-')[0]}...
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-foreground">
                        {profileName}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {orgName}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {req.task_type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {req.hours_needed}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {req.deadline ? new Date(req.deadline).toLocaleDateString() : "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {renderStatusBadge(req.status)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {req.created_at 
                          ? new Date(req.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"
                        }
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right align-middle">
                      <RequestRowActions req={req} />
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
