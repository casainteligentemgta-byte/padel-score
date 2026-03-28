import { getSupabaseAnonServerClient, getSupabaseServiceClient } from '@/lib/supabase/server';

export type PublicTrophy = {
  /** id del logro (achievements) */
  id: string;
  rowId: string;
  title: string;
  tier: 'gold' | 'silver' | 'bronze';
  awardedAt: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isProfileUuid(id: string): boolean {
  return UUID_RE.test(id.trim());
}

type ProfileRowSnip = { id: string; name: string | null; unique_code: string | null };

export async function fetchPublicProfileTrophies(profileId: string): Promise<{
  profile: { id: string; name: string | null; uniqueCode: string | null };
  trophies: PublicTrophy[];
  /** true si hay service role y no existe fila en profiles */
  profileMissing: boolean;
}> {
  const id = profileId.trim();
  const svc = getSupabaseServiceClient();
  const anon = getSupabaseAnonServerClient();
  const db = svc ?? anon;
  if (!db) {
    return {
      profile: { id, name: null, uniqueCode: null },
      trophies: [],
      profileMissing: false,
    };
  }

  let profileRow: ProfileRowSnip | null = null;
  let profileMissing = false;
  if (svc) {
    const { data, error } = await svc
      .from('profiles')
      .select('id, name, unique_code')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.warn('[profileAchievementsServer] profiles', error.message);
    }
    profileRow = (data as ProfileRowSnip | null) ?? null;
    if (!profileRow) profileMissing = true;
  }

  const { data: paRows, error: paErr } = await db
    .from('profile_achievements')
    .select(
      `
      id,
      awarded_at,
      achievements (
        id,
        title,
        tier
      )
    `,
    )
    .eq('profile_id', id)
    .order('awarded_at', { ascending: false });

  if (paErr) {
    if (paErr.code === '42P01' || paErr.message?.includes('does not exist')) {
      console.warn('[profileAchievementsServer] tablas achievements no desplegadas aún');
    } else {
      console.warn('[profileAchievementsServer] profile_achievements', paErr.message);
    }
  }

  const trophies: PublicTrophy[] = (paRows || [])
    .map((row: any) => {
      const ach = row.achievements;
      const a = Array.isArray(ach) ? ach[0] : ach;
      if (!a?.id || !row.id) return null;
      const tier = (['gold', 'silver', 'bronze'] as const).includes(a.tier)
        ? a.tier
        : 'gold';
      return {
        id: String(a.id),
        rowId: String(row.id),
        title: String(a.title || 'Logro'),
        tier,
        awardedAt: row.awarded_at || new Date().toISOString(),
      };
    })
    .filter(Boolean) as PublicTrophy[];

  return {
    profile: {
      id,
      name: profileRow?.name?.trim() || null,
      uniqueCode: profileRow?.unique_code?.trim() || null,
    },
    trophies,
    profileMissing,
  };
}
