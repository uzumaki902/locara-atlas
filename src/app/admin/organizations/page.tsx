import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateOrgButton, OrgRowActions } from "./org-form";

export default async function OrganizationsPage() {
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

  const { data: organizations, error } = await supabase
    .from("organizations")
    .select("id, name, is_active, created_at, logo_url")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-foreground tracking-tight">Organizations</h2>
          <p className="text-[14px] text-text-secondary mt-1">Manage organizations in the platform</p>
        </div>
        <CreateOrgButton />
      </header>

      {error ? (
        <div className="bg-surface border border-red-500/20 rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-red-400">Unable to load organizations.</p>
        </div>
      ) : !organizations || organizations.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-text-secondary">No organizations found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Organization Name
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-background/40 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-[14px] font-medium text-foreground">
                      {org.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded ${
                        org.is_active
                          ? "bg-emerald-500 text-white"
                          : "bg-zinc-500 text-white"
                      }`}
                    >
                      {org.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[13px] font-medium text-text-secondary">
                      {new Date(org.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <OrgRowActions org={org} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
