-- ============================================
-- SCIENCE PORTAL — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
-- Stores user profile data (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  grade_level INT CHECK (grade_level BETWEEN 1 AND 12),
  xp INT NOT NULL DEFAULT 0,
  weekly_streak INT NOT NULL DEFAULT 0,
  last_active_week INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. MATERIALS TABLE
-- Stores all learning modules (theory + game references)
CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('sd_1_3', 'sd_4_6', 'smp_7_9', 'sma_10_12')),
  topic_order INT NOT NULL DEFAULT 1,
  theory_content TEXT,
  game_slug TEXT UNIQUE,
  game_type TEXT,
  kkm_score INT NOT NULL DEFAULT 70,
  xp_theory INT NOT NULL DEFAULT 10,
  xp_pass INT NOT NULL DEFAULT 25,
  xp_perfect INT NOT NULL DEFAULT 50,
  badge_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PROGRESS TABLE
-- Tracks each student's progress per material
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  material_id INT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  is_theory_completed BOOLEAN NOT NULL DEFAULT false,
  highscore INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0,
  consecutive_fails INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  is_module_completed BOOLEAN NOT NULL DEFAULT false,
  xp_earned INT NOT NULL DEFAULT 0,
  badge_earned BOOLEAN NOT NULL DEFAULT false,
  last_played TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- 4. ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Materials: Everyone can read materials
CREATE POLICY "Anyone can view materials"
  ON materials FOR SELECT
  USING (true);

-- Progress: Users can only see and modify their own progress
CREATE POLICY "Users can view own progress"
  ON progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Teachers can view all progress (for monitoring)
CREATE POLICY "Teachers can view all progress"
  ON progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- 5. AUTO-CREATE PROFILE ON SIGNUP
-- Trigger function to create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. SEED FIRST MATERIAL (Panca Indra)
INSERT INTO materials (title, description, category, topic_order, game_slug, game_type, kkm_score, badge_name)
VALUES (
  'Panca Indra & Tubuh Manusia',
  'Mengenal 5 indra manusia (mata, telinga, hidung, lidah, kulit) dan fungsinya dalam kehidupan sehari-hari.',
  'sd_1_3',
  1,
  'sensor-match',
  'drag-and-drop',
  70,
  'Master Panca Indra'
);
