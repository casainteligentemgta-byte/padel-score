import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }

  const { data, error } = await supabase
    .from('payment_logs')
    .select('id, owner_id, user_id, tournament_id, reference_number, bank_origin, phone_emitter, amount_bs, status, created_at')
    .order('created_at', { ascending: false })
    .limit(120);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data || [];
  const profileIds = [...new Set(rows.map((r: any) => String(r.user_id || r.owner_id || '')).filter(Boolean))];
  const profileById: Record<string, { name: string | null; full_name: string | null; email: string | null }> = {};

  /** Ficha del jugador (participants.data): nombre, apellido, cédula por owner (uid). */
  const payerByOwner = new Map<
    string,
    { payerName: string; payerLastName: string; payerDni: string; updatedAt: string }
  >();

  /** Inscripción más reciente por clave `uid` o `uid|tournamentId` para enlazar a equipos inscritos. */
  const inscriptionIdByOwner = new Map<string, string>();
  const inscriptionIdByOwnerTournament = new Map<string, string>();

  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', profileIds);
    (profiles || []).forEach((p: any) => {
      profileById[String(p.id)] = {
        name: p?.name ?? null,
        full_name: p?.name ?? null,
        email: p?.email ?? null,
      };
    });

    const { data: partRows } = await supabase
      .from('participants')
      .select('owner_id, data, updated_at, created_at')
      .in('owner_id', profileIds);

    for (const row of partRows || []) {
      const oid = String((row as any).owner_id || '');
      if (!oid) continue;
      const d = ((row as any).data || {}) as Record<string, unknown>;
      const name = String(d.name ?? '').trim();
      const lastName = String(d.lastName ?? '').trim();
      const dni = String(d.dni ?? '').trim();
      const ts = String((row as any).updated_at || (row as any).created_at || '');
      const prev = payerByOwner.get(oid);
      if (!prev || ts > prev.updatedAt) {
        payerByOwner.set(oid, { payerName: name, payerLastName: lastName, payerDni: dni, updatedAt: ts });
      }
    }

    const { data: insRows } = await supabase
      .from('inscriptions')
      .select('id, owner_id, user_id, tournament_id, created_at')
      .or(`owner_id.in.(${profileIds.join(',')}),user_id.in.(${profileIds.join(',')})`);

    const bestInsByOwner = new Map<string, { id: string; created_at: string }>();
    const bestInsByOwnerTournament = new Map<string, { id: string; created_at: string }>();

    for (const ins of insRows || []) {
      const i = ins as {
        id: string;
        owner_id?: string | null;
        user_id?: string | null;
        tournament_id?: string | null;
        created_at?: string | null;
      };
      const created = String(i.created_at || '');
      const tid = i.tournament_id ? String(i.tournament_id) : '';
      for (const uid of [...new Set([i.owner_id, i.user_id].filter(Boolean).map(String))]) {
        if (!profileIds.includes(uid)) continue;
        const prevO = bestInsByOwner.get(uid);
        if (!prevO || created > prevO.created_at) {
          bestInsByOwner.set(uid, { id: i.id, created_at: created });
        }
        if (tid) {
          const key = `${uid}|${tid}`;
          const prevT = bestInsByOwnerTournament.get(key);
          if (!prevT || created > prevT.created_at) {
            bestInsByOwnerTournament.set(key, { id: i.id, created_at: created });
          }
        }
      }
    }
    bestInsByOwner.forEach((v, k) => inscriptionIdByOwner.set(k, v.id));
    bestInsByOwnerTournament.forEach((v, k) => inscriptionIdByOwnerTournament.set(k, v.id));
  }

  const mapped = rows.map((r: any) => {
    const uid = String(r.user_id || r.owner_id || '');
    const payer = payerByOwner.get(uid);
    const prof = profileById[uid] || null;
    const tid = r.tournament_id ? String(r.tournament_id) : '';
    const linkedInscriptionId =
      (tid && inscriptionIdByOwnerTournament.get(`${uid}|${tid}`)) ||
      inscriptionIdByOwner.get(uid) ||
      null;

    let payerName = payer?.payerName || '';
    let payerLastName = payer?.payerLastName || '';
    const payerDni = payer?.payerDni || '';
    if (!payerName && prof?.name) {
      const parts = String(prof.name).trim().split(/\s+/).filter(Boolean);
      payerName = parts[0] || '';
      payerLastName = parts.slice(1).join(' ') || '';
    }

    return {
      ...r,
      profiles: prof,
      payerName: payerName || null,
      payerLastName: payerLastName || null,
      payerDni: payerDni || null,
      linkedInscriptionId,
    };
  });

  return NextResponse.json(mapped);
}

export async function PATCH(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }

  let body: { id?: string; status?: 'pending' | 'paid' | 'alert' } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const id = String(body.id || '').trim();
  const status = String(body.status || '').trim().toLowerCase();
  if (!id) return NextResponse.json({ error: 'Falta id.' }, { status: 400 });
  if (!['pending', 'paid', 'alert'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('payment_logs')
    .update({ status, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

