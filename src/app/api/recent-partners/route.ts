import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/authServerSupabase';

/**
 * GET /api/recent-partners
 * Devuelve los últimos 5 user_id únicos con los que el usuario actual ha formado pareja,
 * consultando la tabla inscriptions (data.partnerId) y enriqueciendo con profiles (name, unique_code)
 * y opcionalmente photo del participant del compañero.
 */
export async function GET(req: Request) {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const uid = authResult.uid;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) {
        return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 });
    }

    try {
        const supabase = createClient(url, key);

        const { data: rows, error: insErr } = await supabase
            .from('inscriptions')
            .select('id, data, created_at')
            .eq('owner_id', uid)
            .order('created_at', { ascending: false });

        if (insErr) {
            console.error('[recent-partners] inscriptions', insErr);
            return NextResponse.json({ error: 'Error al obtener inscripciones' }, { status: 500 });
        }

        const partnerIds: string[] = [];
        for (const r of rows || []) {
            const partnerId = (r.data as Record<string, unknown>)?.partnerId as string | undefined;
            if (partnerId && typeof partnerId === 'string' && partnerId !== uid && !partnerIds.includes(partnerId)) {
                partnerIds.push(partnerId);
                if (partnerIds.length >= 5) break;
            }
        }

        if (partnerIds.length === 0) {
            return NextResponse.json({ partners: [] });
        }

        const { data: profiles, error: profErr } = await supabase
            .from('profiles')
            .select('id, name, unique_code')
            .in('id', partnerIds);

        if (profErr) {
            console.error('[recent-partners] profiles', profErr);
            return NextResponse.json({ partners: [] });
        }

        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        const { data: participants } = await supabase
            .from('participants')
            .select('owner_id, data')
            .in('owner_id', partnerIds);

        const photoByOwner = new Map<string, string>();
        (participants || []).forEach((p: any) => {
            if (!photoByOwner.has(p.owner_id)) {
                const photo = (p.data as Record<string, unknown>)?.photo as string | undefined;
                if (photo && typeof photo === 'string') photoByOwner.set(p.owner_id, photo);
            }
        });

        const partners = partnerIds.map((id) => {
            const p = profileMap.get(id);
            return {
                userId: id,
                name: p?.name ?? 'Compañero',
                uniqueCode: p?.unique_code ?? null,
                photo: photoByOwner.get(id) ?? null,
            };
        });

        return NextResponse.json({ partners });
    } catch (e) {
        console.error('[recent-partners]', e);
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
    }
}
