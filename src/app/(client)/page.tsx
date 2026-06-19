import { createClient } from "@/lib/supabase/server";
import PageClient from "./page-client";
import { mapDatabaseVideoToFrontend } from "@/lib/db-adapter";
import { redirect } from "next/navigation";

// Server Component
export default async function Page({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  const resolvedParams = await searchParams;
  const collectionId = resolvedParams.collection;

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

  if (!profile) {
    redirect("/login");
  }

  // Redirect clients to collections page if they access root directly
  if (profile.role === "client" && !collectionId) {
    redirect("/collections");
  }

  // Defensively scope all queries to the organization_id regardless of role
  let query = supabase.from("videos").select("*").eq("organization_id", profile.organization_id);

  let collectionTitle = "";

  // If client and collection is provided, filter down to just that collection
  if (profile.role === "client" && collectionId) {
    query = query.eq("collection_id", collectionId);

    const { data: collectionData, error: collectionError } = await supabase
      .from("collections")
      .select("title")
      .eq("id", collectionId)
      .maybeSingle();
    
    if (!collectionError && collectionData) {
      collectionTitle = collectionData.title;
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch videos from Supabase:", error);
    // safely pass an empty array to prevent a total crash on error
  }

  // Map the raw snake_case DB rows to our frontend Video interface
  const videos = data ? data.map(mapDatabaseVideoToFrontend) : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {profile.role === "client" && (
        <div className="px-5 pt-4 flex-shrink-0">
          <a href="/collections" className="text-sm text-text-secondary hover:text-foreground mb-4 inline-block">
            ← Back to Collections
          </a>
        </div>
      )}
      <PageClient videos={videos} role={profile.role} collectionTitle={collectionTitle} />
    </div>
  );
}