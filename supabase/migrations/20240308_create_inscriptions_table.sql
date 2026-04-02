-- Create inscriptions table
CREATE TABLE IF NOT EXISTS public.inscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT NOT NULL,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    tournament_name TEXT,
    category_key TEXT,
    category_price NUMERIC,
    participant_name TEXT,
    participant_email TEXT,
    participant_id TEXT,
    amount_extracted NUMERIC,
    receipt_url TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'alert')),
    alert_message TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies (idempotente si la tabla ya existía en remoto)
DROP POLICY IF EXISTS "Allow public view for inscriptions" ON public.inscriptions;
CREATE POLICY "Allow public view for inscriptions" ON public.inscriptions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert for inscriptions" ON public.inscriptions;
CREATE POLICY "Allow authenticated insert for inscriptions" ON public.inscriptions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow update for owners or admins" ON public.inscriptions;
CREATE POLICY "Allow update for owners or admins" ON public.inscriptions
    FOR UPDATE USING (
        auth.uid()::text = owner_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Allow delete for owners or admins" ON public.inscriptions;
CREATE POLICY "Allow delete for owners or admins" ON public.inscriptions
    FOR DELETE USING (
        auth.uid()::text = owner_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS inscriptions_tournament_id_idx ON public.inscriptions(tournament_id);
CREATE INDEX IF NOT EXISTS inscriptions_owner_id_idx ON public.inscriptions(owner_id);
