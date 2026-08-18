"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMaterial(data: any) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not logged in" };

  const { error } = await supabase.from("materials").insert([data]);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/teacher/materials");
  return { success: true };
}

export async function updateMaterial(id: number, data: any) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not logged in" };

  const { error } = await supabase.from("materials").update(data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/teacher/materials");
  return { success: true };
}

export async function deleteMaterial(id: number) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not logged in" };

  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/teacher/materials");
  return { success: true };
}

export async function toggleMaterialStatus(id: number, is_published: boolean) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not logged in" };

  const { error } = await supabase.from("materials").update({ is_published }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/teacher/materials");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateStudent(id: string, data: any) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not logged in" };

  const { error } = await supabase.from("profiles").update(data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/teacher/students");
  return { success: true };
}
