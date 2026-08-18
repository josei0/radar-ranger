import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ModuleClient from "./ModuleClient";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const resolvedParams = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  const materialId = parseInt(resolvedParams.id);
  if (isNaN(materialId)) {
    redirect("/dashboard");
  }

  const { data: material } = await supabase
    .from("materials")
    .select("*")
    .eq("id", materialId)
    .single();

  if (!material) {
    redirect("/dashboard");
  }

  if (material.is_published === false && profile?.role !== "teacher") {
    redirect("/dashboard");
  }

  // Fetch progress, if none exists, we will pass null.
  // The server action 'markTheoryCompleted' handles creating it later.
  const { data: progress } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", authData.user.id)
    .eq("material_id", materialId)
    .single();

  return (
    <ModuleClient 
      material={material} 
      progress={progress} 
      profile={profile} 
    />
  );
}
