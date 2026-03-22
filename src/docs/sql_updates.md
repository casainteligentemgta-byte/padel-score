# SQL Updates Required

The following SQL updates are requested for the Supabase database.

## Notifications Table
Date Requested: 2026-03-09

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id), -- El que recibe (Jugador B)
  sender_id UUID REFERENCES profiles(id), -- El que invita (Jugador A)
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'tournament_invite',
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para esta tabla en el Dashboard de Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## Teams Table (Parejas e Invitaciones)
Date Requested: 2026-03-09

Si la tabla `teams` no existe o le faltan columnas (como `category`), ejecuta esto:

```sql
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  player_a_id UUID REFERENCES public.profiles(id),
  player_b_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, category, player_a_id, player_b_id)
);

-- Habilitar RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Permitir lectura a todos" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Permitir inserción a autenticados" ON public.teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir actualización a los involucrados" ON public.teams FOR UPDATE USING (
  auth.uid() = player_a_id OR auth.uid() = player_b_id
);
CREATE POLICY "Permitir borrado a los involucrados" ON public.teams FOR DELETE USING (
  auth.uid() = player_a_id OR auth.uid() = player_b_id
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
```
