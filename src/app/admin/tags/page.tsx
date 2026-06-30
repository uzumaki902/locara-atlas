import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tag } from "lucide-react";

export default async function AdminTagsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/collections");

  return (
    <div className="max-w-5xl">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-foreground tracking-tight">Tags</h2>
          <p className="text-[14px] text-text-secondary mt-1">Manage dataset tags and annotations (Coming Soon)</p>
        </div>
        <button disabled className="bg-accent/50 text-white/50 text-[13px] font-medium px-4 py-2 rounded-md cursor-not-allowed">
          Add Tag
        </button>
      </header>

      <div className="bg-surface border border-border rounded-lg p-16 text-center flex flex-col items-center justify-center">
        <Tag className="w-12 h-12 text-text-secondary/30 mb-4" />
        <h3 className="text-[16px] font-medium text-foreground mb-2">No tags found</h3>
        <p className="text-[14px] text-text-secondary max-w-md mx-auto">
          The Tags module is currently under development. Once enabled, you will be able to manage dataset taxonomies, annotations, and labels here.
        </p>
      </div>
    </div>
  );
}
