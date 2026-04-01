-- Migration 027: Dynamic Display Templates
-- Admin Studio for UI Layout and Split-Media

CREATE TABLE IF NOT EXISTS public.display_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  header_vh INTEGER NOT NULL DEFAULT 10,
  score_vh INTEGER NOT NULL DEFAULT 23,
  media_vh INTEGER NOT NULL DEFAULT 59,
  ticker_vh INTEGER NOT NULL DEFAULT 8,
  split_ratio FLOAT NOT NULL DEFAULT 0.5, -- 0.5 means 50/50 split
  clock_style TEXT NOT NULL DEFAULT 'modern', -- 'modern', 'classic', 'minimal'
  clock_color TEXT NOT NULL DEFAULT '#ccff00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraint to ensure vh rows sum 100
ALTER TABLE public.display_templates
  ADD CONSTRAINT row_vh_sum_check CHECK (header_vh + score_vh + media_vh + ticker_vh = 100);

-- Enable RLS
ALTER TABLE public.display_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for display_templates" ON public.display_templates
  FOR ALL USING (true) WITH CHECK (true);

-- Add template link to canchas
ALTER TABLE public.canchas
  ADD COLUMN IF NOT EXISTS current_template_id UUID REFERENCES public.display_templates(id) ON DELETE SET NULL;

-- Initial default template
INSERT INTO public.display_templates (name, header_vh, score_vh, media_vh, ticker_vh, split_ratio, clock_style, clock_color)
VALUES ('Default Padel Pro', 10, 23, 59, 8, 0.5, 'modern', '#ccff00');

-- Enable Realtime for canchas and display_templates
-- Ensure they are in the publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.canchas, public.display_templates;
  END IF;
EXCEPTION WHEN others THEN
  -- Possibly already added or publication doesn't exist
  NULL;
END$$;
