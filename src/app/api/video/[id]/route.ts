import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: video, error } = await supabase
    .from("videos")
    .select("video_url")
    .eq("video_id", id)
    .single();

  if (error || !video || !video.video_url) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }

  const range = request.headers.get("range");

  const supabaseResponse = await fetch(video.video_url, {
    headers: range
      ? {
          Range: range,
        }
      : {},
  });

  if (!supabaseResponse.ok && supabaseResponse.status !== 206) {
    return Response.json(
      { error: "Unable to fetch video" },
      { status: supabaseResponse.status },
    );
  }

  const headers = new Headers();

  const contentType = supabaseResponse.headers.get("content-type");
  const contentLength = supabaseResponse.headers.get("content-length");
  const contentRange = supabaseResponse.headers.get("content-range");
  const acceptRanges = supabaseResponse.headers.get("accept-ranges");

  if (contentType) headers.set("Content-Type", contentType);
  if (contentLength) headers.set("Content-Length", contentLength);
  if (contentRange) headers.set("Content-Range", contentRange);
  if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);

  return new Response(supabaseResponse.body, {
    status: supabaseResponse.status,
    headers,
  });
}
