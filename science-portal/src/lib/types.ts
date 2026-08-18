// ============================================
// Database Types — mirrors Supabase schema
// ============================================

export type UserRole = "student" | "teacher";

export type GradeCategory = "sd_1_3" | "sd_4_6" | "smp_7_9" | "sma_10_12";

export type ThemeVariant = "playful" | "sciencelab" | "futuristic";

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
  grade_level: number | null;
  avatar_id: string | null;
  xp: number;
  weekly_streak: number;
  last_active_week: number;
  created_at: string;
}

export interface Material {
  id: number;
  title: string;
  description: string | null;
  category: GradeCategory;
  topic_order: number;
  theory_content: string | null;
  game_slug: string | null;
  game_type: string | null;
  quiz_data?: any;
  game_data?: any;
  kkm_score: number;
  xp_theory: number;
  xp_pass: number;
  xp_perfect: number;
  badge_name: string | null;
  is_published: boolean;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  material_id: number;
  is_theory_completed: boolean;
  highscore: number;
  best_streak: number;
  attempts: number;
  consecutive_fails: number;
  locked_until: string | null;
  is_module_completed: boolean;
  xp_earned: number;
  badge_earned: boolean;
  last_played: string | null;
  created_at: string;
}

// Helper: map grade_level to category
export function gradeToCategory(grade: number): GradeCategory {
  if (grade <= 3) return "sd_1_3";
  if (grade <= 6) return "sd_4_6";
  if (grade <= 9) return "smp_7_9";
  return "sma_10_12";
}

// Helper: map grade_level to theme
export function gradeToTheme(grade: number): ThemeVariant {
  if (grade <= 6) return "playful";
  if (grade <= 9) return "sciencelab";
  return "futuristic";
}
