import { createClient } from "@/lib/supabase/server";
import PageClient from "./page-client";
import { mapDatabaseVideoToFrontend } from "@/lib/db-adapter";

// Server Component
export default async function Page() {
  const supabase = await createClient();
  
  // Fetch all videos from the Supabase table
  const { data, error } = await supabase.from("videos").select("*");

  if (error) {
    console.error("Failed to fetch videos from Supabase:", error);
    // You could render an error state or throw, 
    // but we'll safely pass an empty array to prevent a total crash.
  }

  // Map the raw snake_case DB rows to our frontend Video interface
  const videos = data ? data.map(mapDatabaseVideoToFrontend) : [];

  return <PageClient videos={videos} />;
}