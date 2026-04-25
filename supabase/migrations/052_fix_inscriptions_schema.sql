-- Migration: 052_fix_inscriptions_schema.sql
-- Description: Asegura que la tabla inscriptions tenga todas las columnas necesarias, especialmente owner_id.

DO $$ 
BEGIN
    -- 1. Asegurar owner_id (crítico para RLS)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inscriptions' AND column_name='owner_id') THEN
        ALTER TABLE public.inscriptions ADD COLUMN owner_id UUID;
    END IF;

    -- 2. Asegurar campos de estado y confirmación (usados en dataService.ts)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inscriptions' AND column_name='inscription_status') THEN
        ALTER TABLE public.inscriptions ADD COLUMN inscription_status TEXT DEFAULT 'NORMAL';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inscriptions' AND column_name='status') THEN
        ALTER TABLE public.inscriptions ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inscriptions' AND column_name='confirmed_at') THEN
        ALTER TABLE public.inscriptions ADD COLUMN confirmed_at TIMESTAMPTZ;
    END IF;

    -- 3. Asegurar IDs de participantes y compañeros (UUID para consistencia con auth.users)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inscriptions' AND column_name='participant_id') THEN
        -- Si ya existe como TEXT, podríamos necesitar convertirlo, pero ADD COLUMN IF NOT EXISTS es más seguro para empezar
        ALTER TABLE public.inscriptions ADD COLUMN participant_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inscriptions' AND column_name='partner_id') THEN
        ALTER TABLE public.inscriptions ADD COLUMN partner_id UUID;
    END IF;

    -- 4. Otros campos que podrían faltar según schema.sql
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inscriptions' AND column_name='tournament_name') THEN
        ALTER TABLE public.inscriptions ADD COLUMN tournament_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inscriptions' AND column_name='category_key') THEN
        ALTER TABLE public.inscriptions ADD COLUMN category_key TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inscriptions' AND column_name='category_price') THEN
        ALTER TABLE public.inscriptions ADD COLUMN category_price NUMERIC;
    END IF;

END $$;

-- 5. Actualizar políticas de RLS si es necesario
-- Habilitar RLS
ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;

-- Política para que el owner pueda ver y editar sus inscripciones
DROP POLICY IF EXISTS "inscriptions_owner" ON public.inscriptions;
CREATE POLICY "inscriptions_owner" ON public.inscriptions 
    FOR ALL USING (auth.uid() = owner_id);

-- Política para que los admins puedan ver todo
DROP POLICY IF EXISTS "inscriptions_admin" ON public.inscriptions;
CREATE POLICY "inscriptions_admin" ON public.inscriptions 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para permitir lectura pública (necesaria para el flujo de inscripción/confirmación si no están logueados aún)
DROP POLICY IF EXISTS "inscriptions_public_read" ON public.inscriptions;
CREATE POLICY "inscriptions_public_read" ON public.inscriptions 
    FOR SELECT USING (true);

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_inscriptions_owner_id ON public.inscriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_tournament_id ON public.inscriptions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_participant_id ON public.inscriptions(participant_id);
