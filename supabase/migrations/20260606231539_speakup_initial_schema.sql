/*
# SpeakUp AI - Initial Database Schema

1. New Tables
- `profiles` - User profile data (name, avatar, level, xp, streak)
- `levels` - 15 learning levels with descriptions
- `lessons` - Lessons within each level
- `user_progress` - Tracks user progress on lessons (completed, score)
- `vocabulary` - Word entries with translations, pronunciations, categories
- `sentences` - Useful sentences with translations and pronunciations
- `user_vocabulary` - Tracks which words user has learned/reviewed
- `achievements` - Achievement definitions
- `user_achievements` - Tracks which achievements user has unlocked
- `daily_challenges` - Daily challenge definitions
- `user_challenges` - Tracks user completion of daily challenges
- `conversations` - AI conversation history
- `roleplay_scenarios` - Role-play scenario definitions
- `notifications` - User notification records
- `streak_log` - Daily streak tracking

2. Security
- RLS enabled on all tables
- Owner-scoped policies for user-specific data
- Public read for reference data (levels, lessons, vocabulary, sentences, achievements, roleplay_scenarios)
- Authenticated-only write for user-specific tables
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL DEFAULT '',
  avatar_url text,
  current_level integer NOT NULL DEFAULT 1,
  total_xp integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  streak_last_date date,
  lessons_completed integer NOT NULL DEFAULT 0,
  words_learned integer NOT NULL DEFAULT 0,
  conversation_minutes integer NOT NULL DEFAULT 0,
  language text NOT NULL DEFAULT 'ar',
  is_guest boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Levels table (reference data)
CREATE TABLE IF NOT EXISTS levels (
  id integer PRIMARY KEY,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  description_en text NOT NULL,
  description_ar text NOT NULL,
  icon text NOT NULL DEFAULT 'BookOpen',
  xp_required integer NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0
);

-- Lessons table (reference data)
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id integer NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  type text NOT NULL DEFAULT 'lesson' CHECK (type IN ('lesson', 'quiz', 'pronunciation', 'conversation')),
  order_index integer NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 10,
  xp_reward integer NOT NULL DEFAULT 50,
  content jsonb NOT NULL DEFAULT '{}'
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  score integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  UNIQUE(user_id, lesson_id)
);

-- Vocabulary table (reference data)
CREATE TABLE IF NOT EXISTS vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_en text NOT NULL,
  word_ar text NOT NULL,
  pronunciation_en text NOT NULL,
  pronunciation_ar text NOT NULL,
  category text NOT NULL DEFAULT 'daily_life',
  example_sentence_en text,
  example_sentence_ar text,
  audio_url text,
  difficulty integer NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5)
);

-- Sentences table (reference data)
CREATE TABLE IF NOT EXISTS sentences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sentence_en text NOT NULL,
  sentence_ar text NOT NULL,
  pronunciation_guide text NOT NULL,
  category text NOT NULL DEFAULT 'daily_life',
  audio_url text,
  difficulty integer NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5)
);

-- User vocabulary tracking
CREATE TABLE IF NOT EXISTS user_vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id uuid NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  learned boolean NOT NULL DEFAULT false,
  review_count integer NOT NULL DEFAULT 0,
  last_reviewed_at timestamptz,
  UNIQUE(user_id, vocabulary_id)
);

-- Achievements definitions
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_ar text NOT NULL,
  description_en text NOT NULL,
  description_ar text NOT NULL,
  icon text NOT NULL DEFAULT 'Trophy',
  category text NOT NULL DEFAULT 'general',
  requirement_type text NOT NULL DEFAULT 'lessons_completed',
  requirement_value integer NOT NULL DEFAULT 1,
  xp_bonus integer NOT NULL DEFAULT 0
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL DEFAULT CURRENT_DATE,
  words jsonb NOT NULL DEFAULT '[]',
  sentences jsonb NOT NULL DEFAULT '[]',
  speaking_task_en text NOT NULL,
  speaking_task_ar text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 100,
  UNIQUE(challenge_date)
);

-- User challenge completions
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  words_completed boolean NOT NULL DEFAULT false,
  sentences_completed boolean NOT NULL DEFAULT false,
  speaking_completed boolean NOT NULL DEFAULT false,
  xp_earned integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  UNIQUE(user_id, challenge_id)
);

-- AI Conversation history
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'conversation' CHECK (type IN ('conversation', 'roleplay', 'pronunciation', 'shadowing')),
  scenario_id uuid,
  messages jsonb NOT NULL DEFAULT '[]',
  score integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Roleplay scenarios
CREATE TABLE IF NOT EXISTS roleplay_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_ar text NOT NULL,
  description_en text NOT NULL,
  description_ar text NOT NULL,
  icon text NOT NULL DEFAULT 'MessageSquare',
  ai_prompt text NOT NULL,
  category text NOT NULL DEFAULT 'restaurant',
  difficulty integer NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  body_en text NOT NULL,
  body_ar text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Streak log
CREATE TABLE IF NOT EXISTS streak_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  xp_earned integer NOT NULL DEFAULT 0,
  lessons_done integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, log_date)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_log ENABLE ROW LEVEL SECURITY;

-- Profiles: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_profiles" ON profiles;
CREATE POLICY "select_own_profiles" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_profiles" ON profiles;
CREATE POLICY "insert_own_profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_profiles" ON profiles;
CREATE POLICY "update_own_profiles" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_profiles" ON profiles;
CREATE POLICY "delete_own_profiles" ON profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reference tables: public read, authenticated write (admin-managed)
-- Levels
DROP POLICY IF EXISTS "read_levels" ON levels;
CREATE POLICY "read_levels" ON levels FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_levels" ON levels;
CREATE POLICY "write_levels" ON levels FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_levels" ON levels;
CREATE POLICY "update_levels" ON levels FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Lessons
DROP POLICY IF EXISTS "read_lessons" ON lessons;
CREATE POLICY "read_lessons" ON lessons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_lessons" ON lessons;
CREATE POLICY "write_lessons" ON lessons FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_lessons" ON lessons;
CREATE POLICY "update_lessons" ON lessons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Vocabulary
DROP POLICY IF EXISTS "read_vocabulary" ON vocabulary;
CREATE POLICY "read_vocabulary" ON vocabulary FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_vocabulary" ON vocabulary;
CREATE POLICY "write_vocabulary" ON vocabulary FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_vocabulary" ON vocabulary;
CREATE POLICY "update_vocabulary" ON vocabulary FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Sentences
DROP POLICY IF EXISTS "read_sentences" ON sentences;
CREATE POLICY "read_sentences" ON sentences FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_sentences" ON sentences;
CREATE POLICY "write_sentences" ON sentences FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_sentences" ON sentences;
CREATE POLICY "update_sentences" ON sentences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Achievements
DROP POLICY IF EXISTS "read_achievements" ON achievements;
CREATE POLICY "read_achievements" ON achievements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_achievements" ON achievements;
CREATE POLICY "write_achievements" ON achievements FOR INSERT TO authenticated WITH CHECK (true);

-- Roleplay scenarios
DROP POLICY IF EXISTS "read_roleplay_scenarios" ON roleplay_scenarios;
CREATE POLICY "read_roleplay_scenarios" ON roleplay_scenarios FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_roleplay_scenarios" ON roleplay_scenarios;
CREATE POLICY "write_roleplay_scenarios" ON roleplay_scenarios FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_roleplay_scenarios" ON roleplay_scenarios;
CREATE POLICY "update_roleplay_scenarios" ON roleplay_scenarios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Daily challenges
DROP POLICY IF EXISTS "read_daily_challenges" ON daily_challenges;
CREATE POLICY "read_daily_challenges" ON daily_challenges FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "write_daily_challenges" ON daily_challenges;
CREATE POLICY "write_daily_challenges" ON daily_challenges FOR INSERT TO authenticated WITH CHECK (true);

-- User-scoped tables: owner-scoped CRUD
-- User progress
DROP POLICY IF EXISTS "select_own_user_progress" ON user_progress;
CREATE POLICY "select_own_user_progress" ON user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_user_progress" ON user_progress;
CREATE POLICY "insert_own_user_progress" ON user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_user_progress" ON user_progress;
CREATE POLICY "update_own_user_progress" ON user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_user_progress" ON user_progress;
CREATE POLICY "delete_own_user_progress" ON user_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User vocabulary
DROP POLICY IF EXISTS "select_own_user_vocabulary" ON user_vocabulary;
CREATE POLICY "select_own_user_vocabulary" ON user_vocabulary FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_user_vocabulary" ON user_vocabulary;
CREATE POLICY "insert_own_user_vocabulary" ON user_vocabulary FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_user_vocabulary" ON user_vocabulary;
CREATE POLICY "update_own_user_vocabulary" ON user_vocabulary FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_user_vocabulary" ON user_vocabulary;
CREATE POLICY "delete_own_user_vocabulary" ON user_vocabulary FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User achievements
DROP POLICY IF EXISTS "select_own_user_achievements" ON user_achievements;
CREATE POLICY "select_own_user_achievements" ON user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_user_achievements" ON user_achievements;
CREATE POLICY "insert_own_user_achievements" ON user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User challenges
DROP POLICY IF EXISTS "select_own_user_challenges" ON user_challenges;
CREATE POLICY "select_own_user_challenges" ON user_challenges FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_user_challenges" ON user_challenges;
CREATE POLICY "insert_own_user_challenges" ON user_challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_user_challenges" ON user_challenges;
CREATE POLICY "update_own_user_challenges" ON user_challenges FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Conversations
DROP POLICY IF EXISTS "select_own_conversations" ON conversations;
CREATE POLICY "select_own_conversations" ON conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_conversations" ON conversations;
CREATE POLICY "insert_own_conversations" ON conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_conversations" ON conversations;
CREATE POLICY "update_own_conversations" ON conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_conversations" ON conversations;
CREATE POLICY "delete_own_conversations" ON conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Streak log
DROP POLICY IF EXISTS "select_own_streak_log" ON streak_log;
CREATE POLICY "select_own_streak_log" ON streak_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_streak_log" ON streak_log;
CREATE POLICY "insert_own_streak_log" ON streak_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_streak_log" ON streak_log;
CREATE POLICY "update_own_streak_log" ON streak_log FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_level_id ON lessons(level_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_category ON vocabulary(category);
CREATE INDEX IF NOT EXISTS idx_sentences_category ON sentences(category);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_log_user_date ON streak_log(user_id, log_date);
