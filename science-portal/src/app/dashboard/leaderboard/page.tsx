import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeaderboardClient from "./LeaderboardClient";

export const metadata = {
  title: "Leaderboard - Science Portal",
  description: "Top students leaderboard",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Fetch top 50 students
  const { data: topStudents } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("xp", { ascending: false })
    .limit(50);

  return <LeaderboardClient topStudents={topStudents || []} currentUser={profile} />;
}
