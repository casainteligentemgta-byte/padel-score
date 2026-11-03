-- =============================================================================
-- 072: RLS least-privilege
-- Sustituye políticas FOR ALL USING (true) de 001, 020, 056, 061, 062
-- (049 venues ya tenía políticas por rol; aquí se añade lectura pública de
--  sedes activas para TV/QR y se mantiene escritura solo admin).
--
-- Lectura pública: pantallas TV, playlists, tira, express_matches (marcador).
-- Escritura: admin/marker (JWT) o service_role (rutas API).
-- tv_devices y club_staff: sin acceso anon (solo service_role / admin).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(public.get_my_role(), '')) IN ('admin', 'marker', 'staff');
$$;

REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_or_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- Helper: drop open policies + public SELECT + admin/staff writes
-- -----------------------------------------------------------------------------
-- media_content
DROP POLICY IF EXISTS "Allow all for media_content" ON public.media_content;
DROP POLICY IF EXISTS "media_content_select_public" ON public.media_content;
DROP POLICY IF EXISTS "media_content_write_staff" ON public.media_content;
CREATE POLICY "media_content_select_public"
  ON public.media_content FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "media_content_write_staff"
  ON public.media_content FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- pantallas
DROP POLICY IF EXISTS "Allow all for pantallas" ON public.pantallas;
DROP POLICY IF EXISTS "pantallas_select_public" ON public.pantallas;
DROP POLICY IF EXISTS "pantallas_write_staff" ON public.pantallas;
CREATE POLICY "pantallas_select_public"
  ON public.pantallas FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "pantallas_write_staff"
  ON public.pantallas FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- configuracion_display
DROP POLICY IF EXISTS "Allow all for configuracion_display" ON public.configuracion_display;
DROP POLICY IF EXISTS "configuracion_display_select_public" ON public.configuracion_display;
DROP POLICY IF EXISTS "configuracion_display_write_staff" ON public.configuracion_display;
CREATE POLICY "configuracion_display_select_public"
  ON public.configuracion_display FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "configuracion_display_write_staff"
  ON public.configuracion_display FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- tira_informativa
DROP POLICY IF EXISTS "Allow all for tira_informativa" ON public.tira_informativa;
DROP POLICY IF EXISTS "tira_informativa_select_public" ON public.tira_informativa;
DROP POLICY IF EXISTS "tira_informativa_write_staff" ON public.tira_informativa;
CREATE POLICY "tira_informativa_select_public"
  ON public.tira_informativa FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "tira_informativa_write_staff"
  ON public.tira_informativa FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- display_estado
DROP POLICY IF EXISTS "Allow all for display_estado" ON public.display_estado;
DROP POLICY IF EXISTS "display_estado_select_public" ON public.display_estado;
DROP POLICY IF EXISTS "display_estado_write_staff" ON public.display_estado;
CREATE POLICY "display_estado_select_public"
  ON public.display_estado FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "display_estado_write_staff"
  ON public.display_estado FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- cancha_playlist_config (020)
DROP POLICY IF EXISTS "Allow all cancha_playlist_config" ON public.cancha_playlist_config;
DROP POLICY IF EXISTS "cancha_playlist_config_select_public" ON public.cancha_playlist_config;
DROP POLICY IF EXISTS "cancha_playlist_config_write_staff" ON public.cancha_playlist_config;
CREATE POLICY "cancha_playlist_config_select_public"
  ON public.cancha_playlist_config FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "cancha_playlist_config_write_staff"
  ON public.cancha_playlist_config FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- cancha_tira (020)
DROP POLICY IF EXISTS "Allow all cancha_tira" ON public.cancha_tira;
DROP POLICY IF EXISTS "cancha_tira_select_public" ON public.cancha_tira;
DROP POLICY IF EXISTS "cancha_tira_write_staff" ON public.cancha_tira;
CREATE POLICY "cancha_tira_select_public"
  ON public.cancha_tira FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "cancha_tira_write_staff"
  ON public.cancha_tira FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- cancha_publicidad (misma familia de pantallas; TV lee playlists)
DROP POLICY IF EXISTS "Allow all for cancha_publicidad" ON public.cancha_publicidad;
DROP POLICY IF EXISTS "cancha_publicidad_select_public" ON public.cancha_publicidad;
DROP POLICY IF EXISTS "cancha_publicidad_write_staff" ON public.cancha_publicidad;
CREATE POLICY "cancha_publicidad_select_public"
  ON public.cancha_publicidad FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "cancha_publicidad_write_staff"
  ON public.cancha_publicidad FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- display_templates
DROP POLICY IF EXISTS "Allow all for display_templates" ON public.display_templates;
DROP POLICY IF EXISTS "Allow all management for display_templates" ON public.display_templates;
DROP POLICY IF EXISTS "display_templates_select_public" ON public.display_templates;
DROP POLICY IF EXISTS "display_templates_write_staff" ON public.display_templates;
CREATE POLICY "display_templates_select_public"
  ON public.display_templates FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "display_templates_write_staff"
  ON public.display_templates FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- programacion_publicidad (002; no fallar si la tabla no existe en un entorno viejo)
DO $$
BEGIN
  IF to_regclass('public.programacion_publicidad') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow all for programacion_publicidad" ON public.programacion_publicidad';
    EXECUTE 'DROP POLICY IF EXISTS "programacion_publicidad_select_public" ON public.programacion_publicidad';
    EXECUTE 'DROP POLICY IF EXISTS "programacion_publicidad_write_staff" ON public.programacion_publicidad';
    EXECUTE $p$
      CREATE POLICY "programacion_publicidad_select_public"
        ON public.programacion_publicidad FOR SELECT
        TO anon, authenticated
        USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "programacion_publicidad_write_staff"
        ON public.programacion_publicidad FOR ALL
        TO authenticated
        USING (public.is_admin_or_staff())
        WITH CHECK (public.is_admin_or_staff())
    $p$;
  END IF;
END $$;

-- venues (049): lectura pública de sedes activas; admin ve todas; writes ya eran admin
DROP POLICY IF EXISTS "venues_select_authenticated" ON public.venues;
DROP POLICY IF EXISTS "venues_select_public_active" ON public.venues;
DROP POLICY IF EXISTS "venues_select_admin_all" ON public.venues;
CREATE POLICY "venues_select_public_active"
  ON public.venues FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
CREATE POLICY "venues_select_admin_all"
  ON public.venues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- express_matches (056): TV + mando leen; writes solo staff o service_role (API /session)
DROP POLICY IF EXISTS "Allow all for express_matches" ON public.express_matches;
DROP POLICY IF EXISTS "express_matches_select_public" ON public.express_matches;
DROP POLICY IF EXISTS "express_matches_write_staff" ON public.express_matches;
CREATE POLICY "express_matches_select_public"
  ON public.express_matches FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "express_matches_write_staff"
  ON public.express_matches FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- tv_devices (061): PIN/token — sin acceso público
DROP POLICY IF EXISTS "Allow all for tv_devices" ON public.tv_devices;
DROP POLICY IF EXISTS "tv_devices_admin_all" ON public.tv_devices;
CREATE POLICY "tv_devices_admin_all"
  ON public.tv_devices FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- club_staff (062): códigos Telegram — sin acceso público
DROP POLICY IF EXISTS "Allow all for club_staff" ON public.club_staff;
DROP POLICY IF EXISTS "club_staff_admin_all" ON public.club_staff;
CREATE POLICY "club_staff_admin_all"
  ON public.club_staff FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- express_activity_logs: sin lectura/escritura anon
DO $$
BEGIN
  IF to_regclass('public.express_activity_logs') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow all for express_activity_logs" ON public.express_activity_logs';
    EXECUTE 'DROP POLICY IF EXISTS "express_activity_logs_admin_select" ON public.express_activity_logs';
    EXECUTE $p$
      CREATE POLICY "express_activity_logs_admin_select"
        ON public.express_activity_logs FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
          )
        )
    $p$;
  END IF;
END $$;

-- Idempotencia webhook Mercado Pago (solo service_role)
CREATE TABLE IF NOT EXISTS public.mercadopago_processed_payments (
  payment_id TEXT PRIMARY KEY,
  inscription_ids TEXT[] NOT NULL DEFAULT '{}',
  amount NUMERIC,
  currency_id TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mercadopago_processed_payments IS
  'Pagos MP ya aplicados; evita procesar dos veces el mismo payment_id.';

ALTER TABLE public.mercadopago_processed_payments ENABLE ROW LEVEL SECURITY;
