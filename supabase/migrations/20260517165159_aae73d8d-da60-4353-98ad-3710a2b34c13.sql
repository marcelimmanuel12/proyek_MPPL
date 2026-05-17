
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  blood_type TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  allergies TEXT,
  emergency_contact TEXT,
  avatar_mood TEXT DEFAULT 'neutral',
  onboarded BOOLEAN NOT NULL DEFAULT false,
  ai_initial_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own_profile_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- INITIAL QUESTIONNAIRE responses (stored as JSON for flexibility)
CREATE TABLE public.initial_questionnaire (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.initial_questionnaire ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_iq_all" ON public.initial_questionnaire FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- MONITORING LOGS (every 5h check-in)
CREATE TABLE public.monitoring_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT,
  ate_breakfast BOOLEAN,
  ate_lunch BOOLEAN,
  ate_dinner BOOLEAN,
  exercised BOOLEAN,
  water_glasses INTEGER,
  sleep_hours NUMERIC,
  symptoms TEXT,
  notes TEXT,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.monitoring_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_ml_all" ON public.monitoring_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- MEDICATIONS
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  times_per_day INTEGER DEFAULT 1,
  schedule_times TEXT[] DEFAULT ARRAY['08:00'],
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_med_all" ON public.medications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- REMINDERS (sleep, exercise, checkup, custom)
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'sleep' | 'exercise' | 'checkup' | 'custom'
  title TEXT NOT NULL,
  reminder_time TIME,
  reminder_date DATE,
  recurring TEXT, -- 'daily' | 'weekly' | 'monthly' | 'none'
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_rem_all" ON public.reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CHECKUPS history
CREATE TABLE public.checkups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkup_date DATE NOT NULL,
  doctor TEXT,
  hospital TEXT,
  diagnosis TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checkups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_chk_all" ON public.checkups FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI CONSULTATIONS
CREATE TABLE public.ai_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'consult' | 'symptom' | 'lifestyle'
  user_input TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_aic_all" ON public.ai_consultations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CHALLENGES (global, readable by all authenticated)
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER DEFAULT 7,
  category TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges_read" ON public.challenges FOR SELECT TO authenticated USING (true);

-- USER CHALLENGES (per-user progress)
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress_days INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, challenge_id)
);
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_uc_all" ON public.user_challenges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FORUM POSTS
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_posts_read" ON public.forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "forum_posts_insert" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_posts_update_own" ON public.forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "forum_posts_delete_own" ON public.forum_posts FOR DELETE USING (auth.uid() = user_id);

-- FORUM COMMENTS
CREATE TABLE public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_comments_read" ON public.forum_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "forum_comments_insert" ON public.forum_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_comments_delete_own" ON public.forum_comments FOR DELETE USING (auth.uid() = user_id);

-- Seed default challenges
INSERT INTO public.challenges (title, description, duration_days, category, icon) VALUES
('Minum 8 Gelas Air Sehari', 'Jaga tubuh tetap terhidrasi selama 7 hari berturut-turut', 7, 'hidrasi', '💧'),
('Jalan Kaki 10.000 Langkah', 'Capai 10.000 langkah setiap hari selama 14 hari', 14, 'olahraga', '🚶'),
('Tidur 8 Jam Setiap Malam', 'Bangun pola tidur sehat selama 21 hari', 21, 'tidur', '😴'),
('Sarapan Sehat Setiap Hari', '7 hari sarapan bergizi tanpa skip', 7, 'nutrisi', '🥗'),
('Meditasi 10 Menit', 'Mindfulness setiap hari selama 14 hari', 14, 'mental', '🧘');
