import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import RequestForm from "./request-form";

export default async function RequestsPage() {
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

  // Fetch history specifically for this user's organization
  const { data: requests, error } = await supabase
    .from("dataset_requests")
    .select("id, task_type, hours_needed, deadline, status, created_at")
    .eq("organization_id", profile.organization_id)
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
    
    return (
      <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-500/15 text-zinc-400 border border-zinc-500/20">
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-foreground">New Dataset Request</h1>
          <p className="text-[14px] text-text-secondary mt-1">Submit requirements for a new custom dataset.</p>
        </header>

        {/* Form Component */}
        <div className="mb-16">
          <RequestForm />
        </div>

        <header className="mb-6">
          <h2 className="text-[20px] font-semibold tracking-tight text-foreground">Request History</h2>
        </header>

        {error ? (
          <div className="bg-surface border border-red-500/20 rounded-lg p-8 text-center">
            <p className="text-[14px] font-medium text-red-400">Unable to load request history.</p>
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-8 text-center border-dashed">
            <p className="text-[14px] font-medium text-text-secondary">No previous requests found.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    Task Type
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    Hours Needed
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-background/40 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-foreground">
                        {new Date(req.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-foreground">
                        {req.task_type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {req.hours_needed} hrs
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-medium text-text-secondary">
                        {new Date(req.deadline).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {renderStatusBadge(req.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </main>
  );
}
