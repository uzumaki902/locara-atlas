"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function submitDatasetRequest(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "client") {
    return { success: false, error: "Only clients can submit requests." };
  }

  const taskType = formData.get("taskType") as string;
  const environment = formData.get("environment") as string;
  const hoursNeeded = parseInt(formData.get("hoursNeeded") as string, 10);
  const deadline = formData.get("deadline") as string;
  const notes = formData.get("notes") as string;

  // Server-side validation
  if (!taskType || taskType.trim() === "") return { success: false, error: "Task Type is required." };
  if (!environment || environment.trim() === "") return { success: false, error: "Environment is required." };
  if (isNaN(hoursNeeded) || hoursNeeded <= 0) return { success: false, error: "Valid Hours Needed is required." };
  if (!deadline) return { success: false, error: "Deadline is required." };

  const { error } = await supabase
    .from("dataset_requests")
    .insert({
      organization_id: profile.organization_id,
      user_id: user.id,
      task_type: taskType.trim(),
      environment: environment.trim(),
      hours_needed: hoursNeeded,
      deadline: deadline,
      notes: notes ? notes.trim() : null,
      status: "Submitted"
    });

  if (error) {
    console.log("DATASET REQUEST ERROR:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/requests");
  return { success: true };
}

export async function approveDatasetRequest(requestId: string, formData?: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Only admins can approve requests.");
  }

  const { data, error } = await supabase
    .from("dataset_requests")
    .update({ status: "Approved" })
    .eq("id", requestId)
    .select();

  console.log("UPDATED ROWS:", data);
  console.log("UPDATE ERROR:", error);

  if (error) {
    console.log("APPROVE REQUEST ERROR:", error);
    return;
  }

  revalidatePath("/admin/requests");
  revalidatePath("/requests");
}

export async function rejectDatasetRequest(requestId: string, formData?: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Only admins can reject requests.");
  }

  const { data, error } = await supabase
    .from("dataset_requests")
    .update({ status: "Rejected" })
    .eq("id", requestId)
    .select();

  console.log("UPDATED ROWS:", data);
  console.log("UPDATE ERROR:", error);

  if (error) {
    console.log("REJECT REQUEST ERROR:", error);
    return;
  }

  revalidatePath("/admin/requests");
  revalidatePath("/requests");
}
