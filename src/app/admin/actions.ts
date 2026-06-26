"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const logo_url = formData.get("logo_url") as string;

  if (!name) return { error: "Name is required" };

  const { error } = await supabase.from("organizations").insert({ 
    name, 
    logo_url: logo_url || null 
  });
  
  if (error) return { error: error.message };

  revalidatePath("/admin/organizations");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateOrganization(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const logo_url = formData.get("logo_url") as string;

  if (!name) return { error: "Name is required" };

  const { error } = await supabase.from("organizations").update({ 
    name, 
    logo_url: logo_url || null 
  }).eq("id", id);
  
  if (error) return { error: error.message };

  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function toggleOrganizationActive(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("organizations").update({ 
    is_active: !currentStatus 
  }).eq("id", id);
  
  if (error) return { error: error.message };

  revalidatePath("/admin/organizations");
  return { success: true };
}

import { createAdminClient } from "@/lib/supabase/admin";

// ─── Users ────────────────────────────────────────────────────────────────────

export async function createUser(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const full_name = (formData.get("full_name") as string)?.trim();
  const role = formData.get("role") as "admin" | "client";
  const organization_id = formData.get("organization_id") as string;

  if (!email) return { error: "Email is required" };
  if (!full_name) return { error: "Name is required" };

  const adminClient = createAdminClient();

  // Step 1 – Create user directly with a dummy password (bypasses rate limit!)
  const { data: inviteData, error: inviteError } =
    await adminClient.auth.admin.createUser({
      email,
      password: "Welcome123!",
      email_confirm: true,
      user_metadata: { full_name },
    });

  if (inviteError) return { error: inviteError.message };

  const newUserId = inviteData.user.id;

  // Step 2 – upsert profile row (trigger may already have created it)
  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert({
      id: newUserId,
      full_name,
      role,
      organization_id: organization_id || null,
      is_active: true,
    });

  if (profileError) {
    // Roll back: delete the orphaned auth user
    await adminClient.auth.admin.deleteUser(newUserId);
    return { error: profileError.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateUser(id: string, formData: FormData) {
  const full_name = (formData.get("full_name") as string)?.trim();
  const role = formData.get("role") as "admin" | "client";
  const organization_id = formData.get("organization_id") as string;

  if (!full_name) return { error: "Name is required" };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({
      full_name,
      role,
      organization_id: organization_id || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserActive(id: string, currentStatus: boolean) {
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ is_active: !currentStatus })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

// ─── Collections ──────────────────────────────────────────────────────────────

export async function createCollection(formData: FormData) {
  const adminClient = createAdminClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const cover_image_url = formData.get("cover_image_url") as string;
  const organization_id = formData.get("organization_id") as string;

  if (!title) return { error: "Title is required" };
  if (!organization_id) return { error: "Organization is required" };

  const { error } = await adminClient.from("collections").insert({
    title,
    description: description || null,
    cover_image_url: cover_image_url || null,
    organization_id,
    is_published: false,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/collections");
  return { success: true };
}

export async function updateCollection(id: string, formData: FormData) {
  const adminClient = createAdminClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const cover_image_url = formData.get("cover_image_url") as string;
  const organization_id = formData.get("organization_id") as string;

  if (!title) return { error: "Title is required" };
  if (!organization_id) return { error: "Organization is required" };

  const { error } = await adminClient.from("collections").update({
    title,
    description: description || null,
    cover_image_url: cover_image_url || null,
    organization_id,
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/collections");
  return { success: true };
}

export async function toggleCollectionPublish(id: string, currentStatus: boolean) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("collections").update({
    is_published: !currentStatus,
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/collections");
  return { success: true };
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export async function createVideo(formData: FormData) {
  const adminClient = createAdminClient();
  
  const video_id = formData.get("video_id") as string;
  const collection_id = formData.get("collection_id") as string;
  const video_url = formData.get("video_url") as string;
  const hands_visible = formData.get("hands_visible") === "true";
  
  if (!video_id || !collection_id || !video_url) {
    return { error: "Video ID, Collection, and Video URL are required" };
  }

  // Fetch the organization_id from the assigned collection
  const { data: collectionData, error: collectionError } = await adminClient
    .from("collections")
    .select("organization_id")
    .eq("id", collection_id)
    .single();

  if (collectionError || !collectionData) {
    return { error: "Failed to resolve organization for the selected collection" };
  }

  const { error } = await adminClient.from("videos").insert({
    video_id,
    collection_id,
    organization_id: collectionData.organization_id,
    video_url,
    worker_id: formData.get("worker_id") as string || null,
    task_type: formData.get("task_type") as string || null,
    video_length: formData.get("video_length") as string || null,
    recording_date: formData.get("recording_date") as string || null,
    location_environment: formData.get("location_environment") as string || null,
    file_size: formData.get("file_size") as string || null,
    resolution: formData.get("resolution") as string || null,
    frame_rate: formData.get("frame_rate") as string || null,
    audio_quality: formData.get("audio_quality") as string || null,
    lighting_quality: formData.get("lighting_quality") as string || null,
    pii_check_status: formData.get("pii_check_status") as string || null,
    status: formData.get("status") as string || "Pending",
    hands_visible,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/videos");
  return { success: true };
}

export async function updateVideo(video_id: string, formData: FormData) {
  const adminClient = createAdminClient();
  
  const collection_id = formData.get("collection_id") as string;
  const video_url = formData.get("video_url") as string;
  const hands_visible = formData.get("hands_visible") === "true";

  if (!collection_id || !video_url) {
    return { error: "Collection and Video URL are required" };
  }

  // Fetch the organization_id from the assigned collection
  const { data: collectionData, error: collectionError } = await adminClient
    .from("collections")
    .select("organization_id")
    .eq("id", collection_id)
    .single();

  if (collectionError || !collectionData) {
    return { error: "Failed to resolve organization for the selected collection" };
  }

  const { error } = await adminClient.from("videos").update({
    video_id: formData.get("video_id") as string,
    collection_id,
    organization_id: collectionData.organization_id,
    video_url,
    worker_id: formData.get("worker_id") as string || null,
    task_type: formData.get("task_type") as string || null,
    video_length: formData.get("video_length") as string || null,
    recording_date: formData.get("recording_date") as string || null,
    location_environment: formData.get("location_environment") as string || null,
    file_size: formData.get("file_size") as string || null,
    resolution: formData.get("resolution") as string || null,
    frame_rate: formData.get("frame_rate") as string || null,
    audio_quality: formData.get("audio_quality") as string || null,
    lighting_quality: formData.get("lighting_quality") as string || null,
    pii_check_status: formData.get("pii_check_status") as string || null,
    status: formData.get("status") as string || "Pending",
    hands_visible,
  }).eq("video_id", video_id);

  if (error) return { error: error.message };

  revalidatePath("/admin/videos");
  return { success: true };
}

export async function deleteVideo(video_id: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("videos").delete().eq("video_id", video_id);
  if (error) return { error: error.message };
  revalidatePath("/admin/videos");
  return { success: true };
}

// ─── Dataset Requests ─────────────────────────────────────────────────────────

export async function updateDatasetRequest(id: string, formData: FormData) {
  const adminClient = createAdminClient();
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;

  if (!status) return { error: "Status is required" };

  const { error } = await adminClient.from("dataset_requests").update({
    status,
    notes: notes || null,
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/requests");
  revalidatePath("/requests"); // Revalidate client side as well
  return { success: true };
}
