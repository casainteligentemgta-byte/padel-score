import { createClient } from '@supabase/supabase-js';
import { isAdminAccess } from '@/lib/adminAccess';

export type AmericanoAuthUser = { uid: string; email?: string; role: string };

function getAuthClient(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export async function getAmericanoAuthUser(
  accessToken: string | undefined | null,
): Promise<AmericanoAuthUser | null> {
  const token = String(accessToken || '').trim();
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;

  try {
    const base = createClient(url, key);
    const { data: { user }, error } = await base.auth.getUser(token);
    if (error || !user) return null;

    const client = getAuthClient(token);
    let dbRole = 'player';
    if (client) {
      const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).maybeSingle();
      dbRole = (profile?.role as string) ?? 'player';
    }

    const role = isAdminAccess(dbRole, user.email) ? 'admin' : dbRole;
    return { uid: user.id, email: user.email ?? undefined, role };
  } catch {
    return null;
  }
}

export async function canManageAmericanoSession(
  supabase: { from: (table: string) => any },
  user: AmericanoAuthUser,
  sessionId: string,
): Promise<boolean> {
  if (user.role === 'admin') return true;

  const { data: session } = await supabase
    .from('americano_sessions')
    .select('tournament_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session?.tournament_id) {
    // Laboratorio standalone: solo admin
    return false;
  }

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('owner_id')
    .eq('id', session.tournament_id)
    .maybeSingle();

  return tournament?.owner_id === user.uid;
}

export async function canManageAmericanoTournament(
  supabase: { from: (table: string) => any },
  user: AmericanoAuthUser,
  tournamentId: string,
): Promise<boolean> {
  if (user.role === 'admin') return true;

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('owner_id')
    .eq('id', tournamentId)
    .maybeSingle();

  return tournament?.owner_id === user.uid;
}

export async function requireAmericanoManager(
  accessToken: string | undefined | null,
  opts: { sessionId?: string; tournamentId?: string; allowLab?: boolean },
): Promise<{ ok: true; user: AmericanoAuthUser } | { ok: false; error: string }> {
  const user = await getAmericanoAuthUser(accessToken);
  if (!user) {
    return { ok: false, error: 'Debes iniciar sesión para gestionar el americano.' };
  }

  const { getSupabaseServiceClient } = await import('@/lib/supabase/server');
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, error: 'Servidor sin SUPABASE_SERVICE_ROLE_KEY.' };
  }

  if (opts.allowLab) {
    return { ok: true, user };
  }

  if (opts.sessionId) {
    const allowed = await canManageAmericanoSession(supabase, user, opts.sessionId);
    if (!allowed) return { ok: false, error: 'No tienes permiso para gestionar esta sesión.' };
    return { ok: true, user };
  }

  if (opts.tournamentId) {
    const allowed = await canManageAmericanoTournament(supabase, user, opts.tournamentId);
    if (!allowed) return { ok: false, error: 'No tienes permiso para gestionar este torneo.' };
    return { ok: true, user };
  }

  if (user.role === 'admin') return { ok: true, user };
  return { ok: false, error: 'Acción no autorizada.' };
}
