import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const [orgs, usersCount, collections, videos, requests] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("collections").select("*", { count: "exact", head: true }),
    supabase.from("videos").select("*", { count: "exact", head: true }),
    supabase.from("dataset_requests").select("*", { count: "exact", head: true })
  ]);

  console.log("ORGS:", orgs);
  console.log("USERS:", usersCount);
  console.log("COLLECTIONS:", collections);
  console.log("VIDEOS:", videos);


  const metrics = [
    { label: "Organizations", count: orgs.count ?? 0, href: "/admin/organizations" },
    { label: "Users", count: usersCount.count ?? 0, href: "/admin/users" },
    { label: "Collections", count: collections.count ?? 0, href: "/admin/collections" },
    { label: "Videos", count: videos.count ?? 0, href: "/admin/videos" },
    { label: "Requests", count: requests.count ?? 0, href: "/admin/requests" },
  ];

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <h2 className="text-[24px] font-semibold text-foreground tracking-tight">Dashboard</h2>
        <p className="text-[14px] text-text-secondary mt-1">Overview of system metrics</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <a
            key={m.label}
            href={m.href}
            className="bg-surface border border-border hover:border-border-hover rounded-lg p-5 flex flex-col transition-all duration-150 cursor-pointer"
          >
            <span className="text-[11px] text-text-secondary uppercase tracking-wider mb-2 font-semibold">
              {m.label}
            </span>
            <span className="text-[28px] font-semibold text-foreground leading-none">
              {m.count}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}