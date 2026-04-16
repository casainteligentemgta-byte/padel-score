import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { createClient } from '@supabase/supabase-js';
import { SMART_CONSENT_LEGAL_VERSION, SMART_CONSENT_STATUS_ACCEPTED } from '@/lib/legal/smartConsent';

function getBearerToken(req: Request): string | null {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7).trim() || null;
}

function getClientIp(req: Request): string | null {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) {
        const first = xff.split(',')[0]?.trim();
        if (first) return first;
    }
    const xri = req.headers.get('x-real-ip');
    if (xri) return xri.trim();
    return null;
}

export async function POST(req: Request) {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const token = getBearerToken(req);
    if (!token) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl || !anonKey) {
        return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
    }

    const ip = getClientIp(req);

    // Update server-side con JWT del usuario para que RLS “update_own” aplique.
    const supabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const payload = {
        status_legal: SMART_CONSENT_STATUS_ACCEPTED,
        legal_version: SMART_CONSENT_LEGAL_VERSION,
        legal_timestamp: new Date().toISOString(),
        user_ip: ip,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').update(payload).eq('id', auth.uid);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
}
