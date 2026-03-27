-- Create knowledge_base table for RAG
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    source TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for knowledge_base
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- If we want public read for anonymous (e.g., if RAG is on landing page)
CREATE POLICY "Public read knowledge_base" ON public.knowledge_base
    FOR SELECT USING (true);

-- Admin can do everything
CREATE POLICY "Admin full access knowledge_base" ON public.knowledge_base
    FOR ALL USING (true) -- Simplified for now, in production we should check roles
    WITH CHECK (true);

-- Create system_logs table for system monitoring
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL,
    module TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id TEXT DEFAULT 'system',
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (logs can come from client too)
CREATE POLICY "Public insert system_logs" ON public.system_logs
    FOR INSERT WITH CHECK (true);

-- Only authenticated can view logs (Admin panel)
CREATE POLICY "Authenticated select system_logs" ON public.system_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON public.system_logs(timestamp DESC);
