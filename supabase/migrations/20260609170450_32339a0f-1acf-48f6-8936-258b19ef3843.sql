
CREATE TABLE public.hospital_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_name text NOT NULL,
  hospital_address text,
  hospital_phone text,
  booking_date date NOT NULL,
  booking_time text,
  complaint text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospital_bookings TO authenticated;
GRANT ALL ON public.hospital_bookings TO service_role;
ALTER TABLE public.hospital_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON public.hospital_bookings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_code text NOT NULL,
  label text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON public.user_challenges(user_id);

INSERT INTO public.challenges (title, description, duration_days, category, icon)
SELECT * FROM (VALUES
  ('Minum 8 Gelas Air Sehari', 'Biasakan minum air putih cukup setiap hari.', 14, 'hidrasi', '💧'),
  ('Jalan 7000 Langkah', 'Bergerak aktif minimal 7000 langkah per hari.', 21, 'olahraga', '🚶'),
  ('Tidur 7 Jam', 'Pulihkan tubuh dengan tidur cukup.', 14, 'tidur', '😴'),
  ('Kurangi Gula', 'Batasi konsumsi gula harian sesuai anjuran.', 30, 'nutrisi', '🍬')
) AS v(title, description, duration_days, category, icon)
WHERE NOT EXISTS (SELECT 1 FROM public.challenges LIMIT 1);
