"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const supabase = await createClient();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const email = `${username}@scienceportal.local`;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid username or password." };
  }

  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const supabase = await createClient();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;
  const role = formData.get("role") as string;
  const gradeLevel = formData.get("gradeLevel") as string;
  const email = `${username}@scienceportal.local`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role: role,
        username: username,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Update profile with grade_level after signup
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && gradeLevel) {
    await supabase
      .from("profiles")
      .update({
        grade_level: parseInt(gradeLevel),
        display_name: displayName,
      })
      .eq("id", user.id);
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
