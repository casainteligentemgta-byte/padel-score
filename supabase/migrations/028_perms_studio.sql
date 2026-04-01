-- Migration 028: Explicit Permissions for Dynamic Layout Studio
-- Ensure anon/authenticated can fully manage templates and link them to courts

-- Permissions for display_templates
GRANT ALL ON TABLE public.display_templates TO anon;
GRANT ALL ON TABLE public.display_templates TO authenticated;
GRANT ALL ON TABLE public.display_templates TO service_role;

-- Ensure canchas is open for template linking
GRANT ALL ON TABLE public.canchas TO anon;
GRANT ALL ON TABLE public.canchas TO authenticated;
GRANT ALL ON TABLE public.canchas TO service_role;

-- Re-verify RLS - allow everything as this admin tool runs without strict session checks
DROP POLICY IF EXISTS "Allow all for display_templates" ON public.display_templates;
CREATE POLICY "Allow all management for display_templates" ON public.display_templates
  FOR ALL TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Ensure Canchas also obeys the open policy for the new column
DROP POLICY IF EXISTS "Allow all for canchas" ON public.canchas;
CREATE POLICY "Allow all management for canchas" ON public.canchas
  FOR ALL TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);
