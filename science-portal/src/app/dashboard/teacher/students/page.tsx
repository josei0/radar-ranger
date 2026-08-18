import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StudentsClient from "./StudentsClient";

export default async function TeacherStudentsPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role !== "teacher") {
    redirect("/dashboard");
  }

  // Fetch all students
  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  // Fetch all progress data
  const { data: progressList } = await supabase
    .from("progress")
    .select(`
      *,
      materials (
        id,
        title,
        category
      )
    `);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <StudentsClient students={students || []} progressList={progressList || []} />
    </div>
  );
}
