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
          <div className="bg-surface border border-border/60 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-background/30">
                  <th className="px-6 py-4 text-[12px] font-medium text-text-secondary">
                    Request Date
                  </th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-secondary">
                    Task Type
                  </th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-secondary">
                    Hours Needed
                  </th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-secondary">
                    Deadline
                  </th>
                  <th className="px-6 py-4 text-[12px] font-medium text-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-background/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-foreground">
                        {new Date(req.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-medium text-foreground group-hover:text-accent transition-colors">
                        {req.task_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-text-secondary">
                        {req.hours_needed} hrs
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-text-secondary">
                        {new Date(req.deadline).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
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
