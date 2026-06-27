import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function CollectionsPage() {
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

  // 1. Fetch collections for this organization (Unrestricted query for debugging)
  const { data, error } = await supabase
    .from("collections")
    .select("*");

  const collections = data;
  const collectionsError = error;

  // 2. Fetch all videos for this organization to calculate counts in-memory
  const { data: videos } = await supabase
    .from("videos")
    .select("collection_id");



  const collectionsData = collections || [];
  const videosData = videos || [];

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-foreground">Your Collections</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Browse your assigned datasets and operations
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collectionsData.map((collection) => {
          // Calculate video count in memory
          const videoCount = videosData.filter(v => v.collection_id === collection.id).length;
          
          return (
            <Link 
              key={collection.id} 
              href={`/?collection=${collection.id}`}
              className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Card Thumbnail Area */}
              <div className="aspect-video relative flex items-center justify-center border-b border-border overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0F0F18 0%, #14141F 50%, #0F0F18 100%)" }}
              >
                {collection.cover_image_url ? (
                  <Image 
                    src={collection.cover_image_url} 
                    alt={collection.title} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-text-secondary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-[18px] font-semibold text-foreground tracking-tight line-clamp-1">
                    {collection.title}
                  </h2>
                  {collection.is_published && (
                    <span className="px-2 py-[2px] rounded text-[11px] font-medium bg-green-500/10 text-green-500 border border-green-500/20 shrink-0">
                      Published
                    </span>
                  )}
                </div>
                
                <p className="text-[14px] text-text-secondary line-clamp-2 h-10 mb-4">
                  {collection.description || "No description provided."}
                </p>

                {/* Card Footer / Metrics */}
                <div className="flex items-center text-[12px] font-medium text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {collectionsData.length === 0 && (
          <div className="col-span-full py-16 text-center bg-surface border border-border rounded-lg border-dashed">
            <svg className="w-10 h-10 text-text-secondary/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            <p className="text-[14px] font-medium text-text-secondary">No collections assigned yet.</p>
            <p className="text-[12px] text-text-secondary/60 mt-1">Contact your administrator to get access.</p>
          </div>
        )}
      </div>
    </main>
  );
}