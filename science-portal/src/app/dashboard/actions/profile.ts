"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAvatar(avatarId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not logged in" };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_id: avatarId })
    .eq("id", authData.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  
  return { success: true };
}
