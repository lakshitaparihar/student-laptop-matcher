-- Run this in your Supabase dashboard → SQL Editor

-- Quiz sessions: saves each user's quiz results
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  major       TEXT NOT NULL,
  budget      TEXT NOT NULL,
  priorities  TEXT[] DEFAULT '{}',
  top_laptop_id   INTEGER,
  top_laptop_name TEXT,
  top_score   NUMERIC(4,1),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own sessions"   ON public.quiz_sessions FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.quiz_sessions FOR INSERT  WITH CHECK (auth.uid() = user_id);

-- Page visits: tracks every page load (anonymous + logged in)
CREATE TABLE IF NOT EXISTS public.page_visits (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS on visits — it's analytics only, not sensitive
ALTER TABLE public.page_visits DISABLE ROW LEVEL SECURITY;
