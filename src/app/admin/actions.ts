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
