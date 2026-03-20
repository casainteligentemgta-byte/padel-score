-- Registro de envíos de notificaciones (WhatsApp / Twilio u otros canales)
create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  type text not null,
  status text not null,
  error_message text,
  created_at timestamptz default now()
);

comment on table public.notification_logs is 'Auditoría de mensajes salientes; escrito desde el servidor con service role.';

-- Índice útil para consultas por fecha y tipo
create index if not exists idx_notification_logs_created_at on public.notification_logs (created_at desc);
create index if not exists idx_notification_logs_type on public.notification_logs (type);

-- RLS: sin políticas para anon/authenticated → solo el cliente con SUPABASE_SERVICE_ROLE_KEY
-- puede insertar/leer (el service role de Supabase bypass RLS).
alter table public.notification_logs enable row level security;
