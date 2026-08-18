import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "My Profile - Science Portal",
  description: "View your profile and collected badges",
};

export default async function ProfilePage() {
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

  // Fetch user's progress for badges
  const { data: progressData } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", authData.user.id)
    .eq("badge_earned", true);

  // Fetch all materials to match badges
  const { data: materialsData } = await supabase
    .from("materials")
    .select("id, title, badge_name, category");

  // Combine data to get earned badges info
  const earnedBadges = (progressData || []).map(p => {
    const material = materialsData?.find(m => m.id === p.material_id);
    return {
      materialId: p.material_id,
      title: material?.title || "Unknown Module",
      badgeName: material?.badge_name || "Champion",
      category: material?.category || "sd_1_3",
      earnedAt: p.last_played || p.created_at
    };
  });

  return <ProfileClient profile={profile} earnedBadges={earnedBadges} />;
}
