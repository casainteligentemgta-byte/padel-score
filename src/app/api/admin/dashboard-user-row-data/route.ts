import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { mergeParticipantRowsForDisplay, type ParticipantDataSlice } from '@/lib/participantDataExtract';

const MAX_IDS = 40;

type Body = { profileIds?: unknown };

/**
 * Fichas de jugador (`participants`): RLS impide a un admin leer a otros usuarios desde el cliente.
 * Esta ruta (service role) devuelve name / apellido / teléfono por `owner_id` para el dashboard.
 */
export async function POST(request: Request) {
  const auth = await requireRole(request, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY en el servidor).' },
      { status: 503 }
    );
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const raw = body.profileIds;
  const profileIds = Array.isArray(raw)
    ? raw
        .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
        .map((x) => x.trim().toLowerCase())
    : [];

  if (profileIds.length === 0) {
    return NextResponse.json({ byProfileId: {} as Record<string, ParticipantDataSlice> });
  }
  if (profileIds.length > MAX_IDS) {
    return NextResponse.json({ error: `Máximo ${MAX_IDS} perfiles por solicitud` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('participants')
    .select('owner_id, data, created_at')
    .in('owner_id', profileIds)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byOwnerLists = new Map<string, Array<{ data: unknown; created_at?: string | null }>>();
  for (const row of data || []) {
    const oid = row?.owner_id != null ? String(row.owner_id).trim().toLowerCase() : '';
    if (!oid) continue;
    if (!byOwnerLists.has(oid)) byOwnerLists.set(oid, []);
    byOwnerLists.get(oid)!.push({ data: row.data, created_at: row.created_at ?? null });
  }

  const byProfileId: Record<string, ParticipantDataSlice> = {};
  for (const [oid, list] of byOwnerLists) {
    byProfileId[oid] = mergeParticipantRowsForDisplay(list);
  }

  return NextResponse.json({ byProfileId });
}
