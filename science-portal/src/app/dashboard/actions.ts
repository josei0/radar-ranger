"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserStreak(userId: string) {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("weekly_streak, last_active_week")
    .eq("id", userId)
    .single();

  if (error || !profile) return;

  // Calculate current week number since first Monday of Unix Epoch
  const FIRST_MONDAY = new Date('1970-01-05T00:00:00Z').getTime();
  const currentWeek = Math.floor((Date.now() - FIRST_MONDAY) / (7 * 24 * 60 * 60 * 1000));

  if (profile.last_active_week === currentWeek) {
    return; // Already updated this week
  }

  let newStreak = profile.weekly_streak;
  if (profile.last_active_week === currentWeek - 1) {
    newStreak += 1; // Consecutive week
  } else {
    newStreak = 1; // Missed a week, reset to 1
  }

  await supabase
    .from("profiles")
    .update({
      weekly_streak: newStreak,
      last_active_week: currentWeek
    })
    .eq("id", userId);
}

export async function markTheoryCompleted(materialId: number) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not logged in" };

  // Check if progress exists
  const { data: existingProgress } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", authData.user.id)
    .eq("material_id", materialId)
    .single();

  let addedXp = 0;

  if (existingProgress) {
    if (!existingProgress.is_theory_completed) {
      await supabase
        .from("progress")
        .update({ is_theory_completed: true })
        .eq("id", existingProgress.id);
      
      const { data: material } = await supabase
        .from("materials")
        .select("xp_theory")
        .eq("id", materialId)
        .single();
        
      if (material) {
        addedXp = material.xp_theory;
        const { data: profile } = await supabase
          .from("profiles")
          .select("xp")
          .eq("id", authData.user.id)
          .single();
          
        if (profile) {
          await supabase
            .from("profiles")
            .update({ xp: profile.xp + addedXp })
            .eq("id", authData.user.id);
        }
      }
    }
  } else {
    // Create new progress record
    await supabase.from("progress").insert({
      user_id: authData.user.id,
      material_id: materialId,
      is_theory_completed: true,
      highscore: 0,
      attempts: 0,
      consecutive_fails: 0,
      is_module_completed: false,
      xp_earned: 0,
      badge_earned: false
    });
    
    // Add XP
    const { data: material } = await supabase
      .from("materials")
      .select("xp_theory")
      .eq("id", materialId)
      .single();
      
    if (material) {
      addedXp = material.xp_theory;
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", authData.user.id)
        .single();
        
      if (profile) {
        await supabase
          .from("profiles")
          .update({ xp: profile.xp + addedXp })
          .eq("id", authData.user.id);
      }
    }
  }

  await updateUserStreak(authData.user.id);
  revalidatePath(`/dashboard/module/${materialId}`);
  return { success: true, addedXp };
}

export async function submitGameScore(materialId: number, score: number) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not logged in" };

  const { data: material } = await supabase
    .from("materials")
    .select("*")
    .eq("id", materialId)
    .single();

  if (!material) return { error: "Material not found" };

  const { data: progress } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", authData.user.id)
    .eq("material_id", materialId)
    .single();

  if (!progress) return { error: "Progress not found" };

  const passed = score >= material.kkm_score;
  const perfect = score === 100;
  
  let newConsecutiveFails = progress.consecutive_fails;
  let lockedUntil = progress.locked_until;
  let isModuleCompleted = progress.is_module_completed;
  let newHighscore = Math.max(progress.highscore, score);
  
  let addedXp = 0;
  let earnedBadge = progress.badge_earned;

  if (passed) {
    newConsecutiveFails = 0;
    if (!isModuleCompleted) {
      isModuleCompleted = true;
      addedXp += material.xp_pass;
    }
    if (perfect && !earnedBadge) {
      earnedBadge = true;
      addedXp += material.xp_perfect;
    }
  } else {
    newConsecutiveFails += 1;
    // Lock for 5 minutes if 3 consecutive fails
    if (newConsecutiveFails >= 3) {
      const lockDate = new Date();
      lockDate.setMinutes(lockDate.getMinutes() + 5);
      lockedUntil = lockDate.toISOString();
    }
  }

  await supabase
    .from("progress")
    .update({
      highscore: newHighscore,
      attempts: progress.attempts + 1,
      consecutive_fails: newConsecutiveFails,
      locked_until: lockedUntil,
      is_module_completed: isModuleCompleted,
      badge_earned: earnedBadge,
      xp_earned: progress.xp_earned + addedXp,
      last_played: new Date().toISOString()
    })
    .eq("id", progress.id);

  if (addedXp > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", authData.user.id)
      .single();
      
    if (profile) {
      await supabase
        .from("profiles")
        .update({ xp: profile.xp + addedXp })
        .eq("id", authData.user.id);
    }
  }

  await updateUserStreak(authData.user.id);
  revalidatePath(`/dashboard/module/${materialId}`);
  
  return { 
    success: true, 
    passed, 
    perfect, 
    locked: newConsecutiveFails >= 3,
    addedXp,
    newHighscore
  };
}