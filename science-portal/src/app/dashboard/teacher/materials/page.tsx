import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MaterialsClient from "./MaterialsClient";

export default async function TeacherMaterialsPage() {
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

  // Fetch all materials
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .order("topic_order", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <MaterialsClient materials={materials || []} />
    </div>
  );
}
