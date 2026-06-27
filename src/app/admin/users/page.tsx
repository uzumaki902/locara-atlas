import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateUserButton, UserRowActions } from "./user-form";

export default async function UsersPage() {
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

  // Fetch profiles and organizations separately to prevent potential relation issues
  const [profilesRes, orgsRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, organization_id, is_active"),
    supabase.from("organizations").select("id, name").order("name")
  ]);



  const error = profilesRes.error || orgsRes.error;

  const orgMap = new Map(orgsRes.data?.map((org) => [org.id, org.name]) || []);

  const users = (profilesRes.data || []).map((p) => ({
    ...p,
    organizationName: orgMap.get(p.organization_id) || "Unknown Organization",
  }));

  // Sort: Admins first, then by full_name
  users.sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;
    return (a.full_name || "").localeCompare(b.full_name || "");
  });

  return (
    <div className="max-w-5xl">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-foreground tracking-tight">Users</h2>
          <p className="text-[14px] text-text-secondary mt-1">Manage platform users</p>
        </div>
        <CreateUserButton organizations={orgsRes.data ?? []} />
      </header>

      {error ? (
        <div className="bg-surface border border-red-500/20 rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-red-400">Unable to load users.</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-text-secondary">No users found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-background/40 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-[14px] font-medium text-foreground">
                      {u.full_name || "Unknown User"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded ${
                        u.role === "admin"
                          ? "bg-purple-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {u.role === "admin" ? "Admin" : "Client"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[13px] font-medium text-text-secondary">
                      {u.organizationName}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded ${
                        u.is_active
                          ? "bg-emerald-500 text-white"
                          : "bg-zinc-500 text-white"
                      }`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <UserRowActions user={u} organizations={orgsRes.data ?? []} />
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
