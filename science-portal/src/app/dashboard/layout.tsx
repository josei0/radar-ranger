import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { gradeToTheme } from "@/lib/types";
import DashboardNav from "./components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to determine theme
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const theme = profile?.grade_level
    ? gradeToTheme(profile.grade_level)
    : profile?.role === "teacher"
    ? "sciencelab"
    : "playful";

  return (
    <div data-theme={theme} className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <DashboardNav profile={profile} theme={theme} />
      <main className="max-w-6xl mx-auto px-4 py-6 page-enter">
        {children}
      </main>
    </div>
  );
}
