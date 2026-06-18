import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  // Schema guarantees foreign keys from dataset_requests to profiles(user_id) and organizations(organization_id).
  // We use a single strict relational query.
  const { data: requests, error } = await supabase
    .from("dataset_requests")
    .select(`
      id,
      status,
      created_at,
      profiles (full_name),
      organizations (name)
    `)
    .order("created_at", { ascending: false });

  // Helper function to render status badges
  const renderStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "unknown";
    
    if (s === "approved") {
      return (
        <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          Approved
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20">
          Rejected
        </span>
      );
    }
    if (s === "pending" || s === "submitted") {
      return (
        <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
          {status}
        </span>
      );
    }
    
    // Default fallback
    return (
      <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-500/15 text-zinc-400 border border-zinc-500/20">
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="max-w-5xl">
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
                  Status
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Created At
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
                        {req.id.split('-')[0]}...
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
                      {renderStatusBadge(req.status)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {new Date(req.created_at).toLocaleDateString("en-US", {
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
