module.exports = [
"[project]/src/lib/supabase/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseAnonServerClient",
    ()=>getSupabaseAnonServerClient,
    "getSupabaseServiceClient",
    ()=>getSupabaseServiceClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
;
let serviceClient = null;
let anonServerClient = null;
function getSupabaseServiceClient() {
    const url = ("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co")?.trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)?.trim();
    if (!url || !key) return null;
    if (!serviceClient) {
        serviceClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key);
    }
    return serviceClient;
}
function getSupabaseAnonServerClient() {
    const url = ("TURBOPACK compile-time value", "https://cecwrpmoitxhfynpqhkc.supabase.co")?.trim();
    const key = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk")?.trim();
    if (!url || !key) return null;
    if (!anonServerClient) {
        anonServerClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key);
    }
    return anonServerClient;
}
}),
"[project]/src/lib/courtPlaylists.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canchaIdCandidates",
    ()=>canchaIdCandidates,
    "canchaIdStoredForPublicidadTables",
    ()=>canchaIdStoredForPublicidadTables,
    "fetchCanchaPlaylistConfig",
    ()=>fetchCanchaPlaylistConfig,
    "fetchCanchaPlaylistRows",
    ()=>fetchCanchaPlaylistRows,
    "fetchCanchaTiraMessages",
    ()=>fetchCanchaTiraMessages,
    "normalizeCanchaIdKey",
    ()=>normalizeCanchaIdKey,
    "normalizeCourtPlaylistRows",
    ()=>normalizeCourtPlaylistRows,
    "partitionPlaylistRows",
    ()=>partitionPlaylistRows,
    "playlistRowKind",
    ()=>playlistRowKind,
    "upsertCanchaPlaylistConfig",
    ()=>upsertCanchaPlaylistConfig
]);
function normalizeCanchaIdKey(raw) {
    const s = String(raw ?? '').trim();
    const m = s.match(/^cancha_(.+)$/i);
    return m ? m[1].trim() : s;
}
function canchaIdStoredForPublicidadTables(courtKeyOrCanchaId) {
    const n = normalizeCanchaIdKey(courtKeyOrCanchaId);
    if (/^\d+$/.test(n)) return `cancha_${n}`;
    const s = String(courtKeyOrCanchaId ?? '').trim();
    if (/^cancha_/i.test(s)) return s;
    return n;
}
function canchaIdCandidates(canchaId) {
    const id = String(canchaId || '').trim();
    if (!id) return [];
    const m = id.match(/^cancha_(\d+)$/i);
    if (m) return [
        id,
        m[1]
    ];
    if (/^\d+$/.test(id)) return [
        id,
        `cancha_${id}`
    ];
    return [
        id
    ];
}
async function enrichRowsWithMediaById(supabase, rows) {
    const missing = rows.filter((r)=>!r.media_content?.url && r.media_id).map((r)=>r.media_id);
    if (!missing.length) return rows;
    const ids = Array.from(new Set(missing));
    const { data } = await supabase.from('media_content').select('id, tipo, url, nombre_sponsor, nombre').in('id', ids);
    const byId = new Map((data || []).map((m)=>[
            String(m.id),
            m
        ]));
    return rows.map((r)=>{
        if (r.media_content?.url) return r;
        const m = byId.get(String(r.media_id));
        if (!m) return r;
        return {
            ...r,
            media_content: {
                id: String(m.id || ''),
                tipo: String(m.tipo || ''),
                url: String(m.url || ''),
                nombre_sponsor: m.nombre_sponsor ?? null,
                nombre: m.nombre ?? null
            }
        };
    });
}
function normalizeMediaContent(raw) {
    if (!raw) return null;
    if (Array.isArray(raw)) {
        const first = raw[0];
        if (!first) return null;
        return {
            id: String(first.id || ''),
            tipo: String(first.tipo || ''),
            url: String(first.url || ''),
            nombre_sponsor: first.nombre_sponsor ?? null,
            nombre: first.nombre ?? null
        };
    }
    const m = raw;
    return {
        id: String(m.id || ''),
        tipo: String(m.tipo || ''),
        url: String(m.url || ''),
        nombre_sponsor: m.nombre_sponsor ?? null,
        nombre: m.nombre ?? null
    };
}
function normalizeCourtPlaylistRows(rows) {
    return (rows || []).map((r)=>{
        const row = r || {};
        return {
            id: String(row.id || ''),
            cancha_id: String(row.cancha_id || ''),
            venue_name: row.venue_name ? String(row.venue_name) : undefined,
            media_id: String(row.media_id || ''),
            orden: Number(row.orden || 0),
            duracion_segundos: Number(row.duracion_segundos || 0),
            playlist_slot: row.playlist_slot ?? undefined,
            posicion_pantalla: row.posicion_pantalla ? String(row.posicion_pantalla) : null,
            media_content: normalizeMediaContent(row.media_content ?? row.publicidad)
        };
    });
}
function filterPlaylistRowsByVenueLoose(rows, vn) {
    if (!vn) return rows;
    const want = vn.trim().toLowerCase();
    return rows.filter((r)=>String(r.venue_name ?? '').trim().toLowerCase() === want);
}
function playlistRowKind(a) {
    const ps = a.playlist_slot || 'legacy';
    if (ps === 'imagen') return 'imagen';
    if (ps === 'video') return 'video';
    const mc = normalizeMediaContent(a.media_content);
    const tipo = String(mc?.tipo || '');
    return tipo === 'imagen' ? 'imagen' : 'video';
}
async function fetchCanchaPlaylistRows(supabase, canchaId, venueName) {
    const canchaIds = canchaIdCandidates(canchaId);
    const hasPlayableRows = (rows)=>rows.some((x)=>Boolean(x.media_content?.url));
    const vn = venueName?.trim() || null;
    let q = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, media_content(*)').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    if (vn) q = q.ilike('venue_name', vn);
    const r = await q;
    if (!r.error && (r.data || []).length > 0) {
        const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(r.data || []));
        if (hasPlayableRows(norm) || norm.length > 0) return {
            ...r,
            data: norm
        };
    }
    // Algunas BD exponen la relación como `publicidad` en lugar de `media_content`.
    let qRelFallback = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, publicidad(*)').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    if (vn) qRelFallback = qRelFallback.ilike('venue_name', vn);
    const rRelFallback = await qRelFallback;
    if (!rRelFallback.error && (rRelFallback.data || []).length > 0) {
        const norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(rRelFallback.data || []));
        if (hasPlayableRows(norm) || norm.length > 0) return {
            ...rRelFallback,
            data: norm
        };
    }
    // Fallback: sin filtro sede en SQL; acotamos por sede en cliente si hace falta.
    let q2 = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, media_content(*)').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    const r2 = await q2;
    if (!r2.error) {
        let norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(r2.data || []));
        norm = filterPlaylistRowsByVenueLoose(norm, vn);
        if (hasPlayableRows(norm) || norm.length > 0) return {
            ...r2,
            data: norm
        };
    }
    let q3 = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, publicidad(*)').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    const r3 = await q3;
    if (!r3.error) {
        let norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(r3.data || []));
        norm = filterPlaylistRowsByVenueLoose(norm, vn);
        if (norm.length > 0 || !vn) return {
            ...r3,
            data: norm
        };
    }
    // Fallback final: sin relaciones embebidas (evita fallos de schema cache/FK en PostgREST).
    // Luego resolvemos media por `media_id` con query independiente.
    let q4 = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    if (vn) {
        q4 = q4.ilike('venue_name', vn);
    }
    const r4 = await q4;
    if (!r4.error) {
        let norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(r4.data || []));
        norm = filterPlaylistRowsByVenueLoose(norm, vn);
        if (hasPlayableRows(norm) || norm.length > 0) return {
            ...r4,
            data: norm
        };
    }
    const r5 = await supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla').in('cancha_id', canchaIds).order('orden', {
        ascending: true
    });
    if (!r5.error) {
        let norm = await enrichRowsWithMediaById(supabase, normalizeCourtPlaylistRows(r5.data || []));
        norm = filterPlaylistRowsByVenueLoose(norm, vn);
        return {
            ...r5,
            data: norm
        };
    }
    return r3;
}
async function fetchCanchaPlaylistConfig(supabase, canchaId, venueName) {
    if (!venueName.trim()) return null;
    const canchaIds = canchaIdCandidates(canchaId);
    const vn = venueName.trim();
    const { data: rowsIlike, error: errIlike } = await supabase.from('cancha_playlist_config').select('*').in('cancha_id', canchaIds).ilike('venue_name', vn).limit(1);
    if (!errIlike && rowsIlike?.[0]) return rowsIlike[0];
    const { data: dataEq, error: errEq } = await supabase.from('cancha_playlist_config').select('*').in('cancha_id', canchaIds).eq('venue_name', vn).maybeSingle();
    if (!errEq && dataEq) return dataEq;
    // Fallback: algunas instalaciones no guardan/filtran por venue_name.
    const { data: data2, error: error2 } = await supabase.from('cancha_playlist_config').select('*').in('cancha_id', canchaIds).limit(1).maybeSingle();
    if (error2 || !data2) return null;
    return data2;
}
async function upsertCanchaPlaylistConfig(supabase, venueName, canchaId, patch) {
    const vn = venueName.trim();
    const { data: existing } = await supabase.from('cancha_playlist_config').select('*').eq('cancha_id', canchaId).eq('venue_name', vn).maybeSingle();
    const ex = existing || {};
    const row = {
        venue_name: vn,
        cancha_id: canchaId,
        imagen_loop: patch.imagen_loop ?? ex.imagen_loop ?? true,
        imagen_pausa_entre_segundos: patch.imagen_pausa_entre_segundos !== undefined ? Math.max(0, Math.floor(Number(patch.imagen_pausa_entre_segundos) || 0)) : Math.max(0, Math.floor(Number(ex.imagen_pausa_entre_segundos) || 0)),
        video_cambio_cada_minutos: patch.video_cambio_cada_minutos !== undefined ? Math.max(0, Math.floor(Number(patch.video_cambio_cada_minutos) || 0)) : Math.max(0, Math.floor(Number(ex.video_cambio_cada_minutos) || 0)),
        imagen_cambio_cada_minutos: patch.imagen_cambio_cada_minutos !== undefined ? Math.max(0, Math.floor(Number(patch.imagen_cambio_cada_minutos) || 0)) : Math.max(0, Math.floor(Number(ex.imagen_cambio_cada_minutos) || 0)),
        tira_cambio_cada_minutos: patch.tira_cambio_cada_minutos !== undefined ? Math.max(0, Math.floor(Number(patch.tira_cambio_cada_minutos) || 0)) : Math.max(0, Math.floor(Number(ex.tira_cambio_cada_minutos) || 0)),
        updated_at: new Date().toISOString()
    };
    return supabase.from('cancha_playlist_config').upsert(row, {
        onConflict: 'venue_name,cancha_id'
    });
}
async function fetchCanchaTiraMessages(supabase, canchaId, venueName) {
    const canchaIds = canchaIdCandidates(canchaId);
    const vn = venueName?.trim();
    if (vn) {
        const { data: links, error: e1 } = await supabase.from('cancha_tira').select('tira_informativa_id, orden').in('cancha_id', canchaIds).ilike('venue_name', vn).order('orden', {
            ascending: true
        });
        if (!e1 && links?.length) {
            const ids = links.map((l)=>l.tira_informativa_id);
            const { data: msgs, error: e2 } = await supabase.from('tira_informativa').select('id, mensaje, activo').in('id', ids).eq('activo', true);
            if (e2 || !msgs?.length) return [];
            const order = new Map(ids.map((id, i)=>[
                    id,
                    i
                ]));
            return msgs.filter((m)=>order.has(m.id)).sort((a, b)=>(order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        }
        // Fallback 1: mismas canchas, filtrar sede en cliente.
        const { data: links2, error: e1b } = await supabase.from('cancha_tira').select('tira_informativa_id, orden, venue_name').in('cancha_id', canchaIds).order('orden', {
            ascending: true
        });
        if (!e1b && links2?.length) {
            const want = vn.toLowerCase();
            const scoped = links2.filter((l)=>String(l.venue_name ?? '').trim().toLowerCase() === want);
            if (scoped.length > 0) {
                const ids = scoped.map((l)=>l.tira_informativa_id);
                const { data: msgs, error: e2 } = await supabase.from('tira_informativa').select('id, mensaje, activo').in('id', ids).eq('activo', true);
                if (!e2 && msgs?.length) {
                    const order = new Map(ids.map((id, i)=>[
                            id,
                            i
                        ]));
                    return msgs.filter((m)=>order.has(m.id)).sort((a, b)=>(order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
                }
            }
        }
    }
    // Fallback 2: mensajes globales.
    const { data: all, error } = await supabase.from('tira_informativa').select('id, mensaje').eq('activo', true).order('orden', {
        ascending: true
    });
    if (error || !all) return [];
    return all;
}
function partitionPlaylistRows(rows) {
    const video = [];
    const imagen = [];
    for (const r of rows){
        const mc = normalizeMediaContent(r.media_content);
        const row = {
            ...r,
            media_content: mc
        };
        const tipo = String(row.media_content?.tipo || '');
        const isImg = tipo === 'imagen';
        const isVid = tipo.includes('video') || tipo === 'video_url' || tipo === 'video_file';
        const slot = row.playlist_slot || 'legacy';
        if (slot === 'legacy') {
            if (isImg) imagen.push(row);
            else if (isVid) video.push(row);
            else video.push(row);
            continue;
        }
        if (slot === 'imagen') imagen.push(row);
        else video.push(row);
    }
    video.sort((a, b)=>(a.orden ?? 0) - (b.orden ?? 0));
    imagen.sort((a, b)=>(a.orden ?? 0) - (b.orden ?? 0));
    return {
        video,
        imagen
    };
}
}),
"[project]/src/app/admin/publicidad/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"400615e2431436f26bde6044913af92cf5e113a789":"addMediaContentAction","40bff0ff2a3bd0e5a0aeac776675ec12b8624dc258":"deleteMediaAction","40f4725878b7d31dab6b788de4448375535007ef0b":"deleteTickerAction","604b798fb887bee94c18b6cd9fd4333e6934847c80":"fetchAssignmentsAction","60ba3f4d8e8c83e0ef69208080d6c6966bf623b47c":"renameMediaAction","60f06574e9f652793eefffe7f9342febc29dad8643":"addTickerAction","70a91e9c6ea07eb0a4df594c26a9312045c552a285":"upsertPlaylistConfigAction","70c2caba043da5f5afaf103d26cfec3755df267290":"saveTiraPlaylistAction","7c74923beca990696eef0f4b402134dfbce06c6960":"savePlaylistAction"},"",""] */ __turbopack_context__.s([
    "addMediaContentAction",
    ()=>addMediaContentAction,
    "addTickerAction",
    ()=>addTickerAction,
    "deleteMediaAction",
    ()=>deleteMediaAction,
    "deleteTickerAction",
    ()=>deleteTickerAction,
    "fetchAssignmentsAction",
    ()=>fetchAssignmentsAction,
    "renameMediaAction",
    ()=>renameMediaAction,
    "savePlaylistAction",
    ()=>savePlaylistAction,
    "saveTiraPlaylistAction",
    ()=>saveTiraPlaylistAction,
    "upsertPlaylistConfigAction",
    ()=>upsertPlaylistConfigAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/courtPlaylists.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
function serviceMissing() {
    return {
        ok: false,
        error: 'Servidor sin credenciales Supabase. Añade SUPABASE_SERVICE_ROLE_KEY en Vercel (Environment Variables) y vuelve a desplegar.'
    };
}
/** Solo estas columnas existen en cancha_playlist_config; el resto se ignora (evita p. ej. split_ratio → INTEGER). */ const PLAYLIST_CONFIG_INT_KEYS = [
    'video_cambio_cada_minutos',
    'imagen_cambio_cada_minutos',
    'tira_cambio_cada_minutos',
    'imagen_pausa_entre_segundos'
];
function sanitizePlaylistConfigPatch(patch) {
    const out = {};
    for (const key of PLAYLIST_CONFIG_INT_KEYS){
        if (key in patch && patch[key] !== undefined) {
            out[key] = Math.max(0, Math.floor(Number(patch[key]) || 0));
        }
    }
    if ('imagen_loop' in patch && patch.imagen_loop !== undefined) {
        out.imagen_loop = Boolean(patch.imagen_loop);
    }
    return out;
}
/**
 * `cancha_publicidad` (y similares) tienen FK a `public.canchas(cancha_id)`.
 * En producción puede existir `1` o `cancha_1`; debemos escribir exactamente el id que ya está (o crear `cancha_N` por defecto).
 */ async function resolveCanchaIdForPublicidadFk(supabase, courtKey) {
    const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeCanchaIdKey"])(courtKey.trim());
    const variants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canchaIdCandidates"])(canonical);
    if (!variants.length) return {
        ok: false,
        error: 'Cancha inválida.'
    };
    const preferred = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canchaIdStoredForPublicidadTables"])(courtKey.trim());
    // Algunas instancias no exponen `public.canchas` o la columna `cancha_id` en la API (caché PostgREST / esquema distinto).
    // En ese caso seguimos sin fallar: escribimos `cancha_N` y las consultas usan `canchaIdCandidates`.
    let hits = null;
    const { data: selData, error: selErr } = await supabase.from('canchas').select('cancha_id').in('cancha_id', variants);
    if (selErr) {
        console.warn('[publicidad] canchas lookup omitido:', selErr.message);
    } else {
        hits = selData;
    }
    const existing = new Set((hits || []).map((r)=>String(r?.cancha_id ?? '').trim()).filter(Boolean));
    if (existing.size > 0) {
        const pickOrder = [
            preferred,
            ...variants.filter((v)=>v !== preferred)
        ];
        for (const id of pickOrder){
            if (existing.has(id)) return {
                ok: true,
                storageId: id,
                variants
            };
        }
    }
    const iso = new Date().toISOString();
    const { error: upErr } = await supabase.from('canchas').upsert({
        cancha_id: preferred,
        last_seen: null,
        updated_at: iso
    }, {
        onConflict: 'cancha_id'
    });
    if (upErr) {
        console.warn('[publicidad] canchas upsert omitido:', upErr.message);
    }
    return {
        ok: true,
        storageId: preferred,
        variants
    };
}
/**
 * Las Server Actions no deben usar throw hacia el cliente en producción:
 * Next.js oculta el mensaje real. Devolvemos { ok, error } siempre.
 */ function sanitizeMediaContentInsert(payload) {
    const row = {
        ...payload
    };
    if (row.duracion_segundos != null && row.duracion_segundos !== '') {
        row.duracion_segundos = Math.max(0, Math.round(Number(row.duracion_segundos) || 0));
    }
    if (row.file_size_bytes != null && row.file_size_bytes !== '') {
        row.file_size_bytes = Math.max(0, Math.floor(Number(row.file_size_bytes) || 0));
    }
    return row;
}
async function addMediaContentAction(payload) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) return serviceMissing();
    try {
        const row = sanitizeMediaContentInsert(payload);
        const { error, data } = await supabase.from('media_content').insert([
            row
        ]).select().single();
        if (error) return {
            ok: false,
            error: error.message || 'No se pudo crear el contenido.'
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/publicidad');
        return {
            ok: true,
            data: data
        };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : 'Error al crear contenido.'
        };
    }
}
async function deleteMediaAction(id) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) return serviceMissing();
    try {
        const { error } = await supabase.from('media_content').delete().eq('id', id);
        if (error) return {
            ok: false,
            error: error.message || 'No se pudo eliminar.'
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/publicidad');
        return {
            ok: true
        };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : 'Error al eliminar.'
        };
    }
}
async function renameMediaAction(id, nombre) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) return serviceMissing();
    try {
        const { error } = await supabase.from('media_content').update({
            nombre,
            nombre_sponsor: nombre.replace(/\.[^/.]+$/, '')
        }).eq('id', id);
        if (error) return {
            ok: false,
            error: error.message || 'No se pudo renombrar.'
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/publicidad');
        return {
            ok: true
        };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : 'Error al renombrar.'
        };
    }
}
async function addTickerAction(mensaje, orden) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) return serviceMissing();
    const ordenInt = Math.max(0, Math.floor(Number(orden) || 0));
    try {
        const { error } = await supabase.from('tira_informativa').insert({
            mensaje,
            orden: ordenInt,
            activo: true
        });
        if (error) return {
            ok: false,
            error: error.message || 'No se pudo añadir el mensaje.'
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/publicidad');
        return {
            ok: true
        };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : 'Error al añadir tira.'
        };
    }
}
async function deleteTickerAction(id) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) return serviceMissing();
    try {
        const { error } = await supabase.from('tira_informativa').delete().eq('id', id);
        if (error) return {
            ok: false,
            error: error.message || 'No se pudo eliminar el mensaje.'
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/publicidad');
        return {
            ok: true
        };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : 'Error al eliminar tira.'
        };
    }
}
/** Filas `playlist_slot = legacy`: decidir si pertenecen al slot vídeo o imagen (misma regla que `partitionPlaylistRows`). */ function legacyRowMatchesPlaylistSlot(row, slot) {
    const raw = row.media_content;
    const mc = Array.isArray(raw) ? raw[0] : raw;
    const tipo = String(mc?.tipo ?? '').toLowerCase();
    if (tipo === 'imagen') return slot === 'imagen';
    return slot === 'video';
}
async function savePlaylistAction(courtKey, venueName, mediaIds, slot, durSeconds) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) return serviceMissing();
    const cleanVenueName = venueName.trim();
    try {
        const resolved = await resolveCanchaIdForPublicidadFk(supabase, courtKey.trim());
        if (!resolved.ok) return resolved;
        const { storageId: storageCanchaId, variants: courtIdVariants } = resolved;
        // 1) Quitar filas ya etiquetadas con este slot (mismo venue exacto que el insert).
        const { error: delSlotErr } = await supabase.from('cancha_publicidad').delete().in('cancha_id', courtIdVariants).eq('venue_name', cleanVenueName).eq('playlist_slot', slot);
        if (delSlotErr) {
            console.error('Error al borrar playlist por slot:', delSlotErr);
            return {
                ok: false,
                error: `Al limpiar playlist: ${delSlotErr.message}`
            };
        }
        // 2) Quitar filas legacy que correspondan a este tipo de medio (playlist_slot es NOT NULL; nunca fue NULL).
        const { data: legacyRows, error: legSelErr } = await supabase.from('cancha_publicidad').select('id, media_content(tipo)').in('cancha_id', courtIdVariants).eq('venue_name', cleanVenueName).eq('playlist_slot', 'legacy');
        if (legSelErr) {
            console.error('Error al listar legacy cancha_publicidad:', legSelErr);
            return {
                ok: false,
                error: `Al limpiar playlist legacy: ${legSelErr.message}`
            };
        }
        const legacyIds = (legacyRows || []).filter((r)=>legacyRowMatchesPlaylistSlot(r, slot)).map((r)=>r.id);
        if (legacyIds.length > 0) {
            const { error: delLegErr } = await supabase.from('cancha_publicidad').delete().in('id', legacyIds);
            if (delLegErr) {
                console.error('Error al borrar filas legacy:', delLegErr);
                return {
                    ok: false,
                    error: `Al limpiar playlist antigua: ${delLegErr.message}`
                };
            }
        }
        const orderedUniqueIds = (()=>{
            const seen = new Set();
            const out = [];
            for (const id of mediaIds){
                const t = String(id || '').trim();
                if (!t || seen.has(t)) continue;
                seen.add(t);
                out.push(t);
            }
            return out;
        })();
        if (orderedUniqueIds.length > 0) {
            const durInt = Math.max(1, Math.round(Number(durSeconds) || 10));
            const rows = orderedUniqueIds.map((mid, i)=>({
                    cancha_id: storageCanchaId,
                    venue_name: cleanVenueName,
                    media_id: mid,
                    orden: i + 1,
                    duracion_segundos: durInt,
                    playlist_slot: slot
                }));
            const { error: insErr } = await supabase.from('cancha_publicidad').insert(rows);
            if (insErr) {
                console.error('Error al insertar nueva playlist:', insErr);
                return {
                    ok: false,
                    error: insErr.message || 'Error al guardar la playlist.'
                };
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/publicidad');
        return {
            ok: true
        };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : 'Error al guardar playlist.'
        };
    }
}
async function saveTiraPlaylistAction(courtKey, venueName, tiraIds) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) return serviceMissing();
    const cleanVenueName = venueName.trim();
    try {
        const resolved = await resolveCanchaIdForPublicidadFk(supabase, courtKey.trim());
        if (!resolved.ok) return resolved;
        const { storageId: storageCanchaId, variants: courtIdVariants } = resolved;
        const { error: delErr } = await supabase.from('cancha_tira').delete().in('cancha_id', courtIdVariants).eq('venue_name', cleanVenueName);
        if (delErr) return {
            ok: false,
            error: delErr.message || 'No se pudo limpiar la tira.'
        };
        if (tiraIds.length > 0) {
            const rows = tiraIds.map((tid, i)=>({
                    cancha_id: storageCanchaId,
                    venue_name: cleanVenueName,
                    tira_informativa_id: tid,
                    orden: i + 1
                }));
            const { error: insErr } = await supabase.from('cancha_tira').insert(rows);
            if (insErr) return {
                ok: false,
                error: insErr.message || 'No se pudo guardar la tira.'
            };
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/publicidad');
        return {
            ok: true
        };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : 'Error al guardar tira.'
        };
    }
}
async function upsertPlaylistConfigAction(venueName, canchaId, patch) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) return serviceMissing();
    try {
        const safePatch = sanitizePlaylistConfigPatch(patch);
        const resolved = await resolveCanchaIdForPublicidadFk(supabase, canchaId.trim());
        if (!resolved.ok) return resolved;
        const storageCanchaId = resolved.storageId;
        const iso = new Date().toISOString();
        const { error } = await supabase.from('cancha_playlist_config').upsert({
            venue_name: venueName.trim(),
            cancha_id: storageCanchaId,
            ...safePatch,
            updated_at: iso
        }, {
            onConflict: 'venue_name,cancha_id'
        });
        if (error) return {
            ok: false,
            error: error.message || 'No se pudo guardar la configuración.'
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin/publicidad');
        return {
            ok: true
        };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : 'Error al guardar configuración.'
        };
    }
}
async function fetchAssignmentsAction(venueName, keys) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
    if (!supabase) return serviceMissing();
    const v = venueName?.trim();
    try {
        let q = supabase.from('cancha_publicidad').select('id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, media_content(*)');
        if (v) q = q.ilike('venue_name', v);
        if (keys && keys.length > 0) q = q.in('cancha_id', keys);
        const { data, error } = await q.order('orden', {
            ascending: true
        });
        if (error) {
            console.error('Error in fetchAssignmentsAction:', error);
            return {
                ok: false,
                error: error.message || 'No se pudieron cargar las asignaciones.'
            };
        }
        const assignments = (data || []).map((r)=>({
                ...r,
                venue_name: String(r.venue_name || '').trim(),
                cancha_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeCanchaIdKey"])(String(r.cancha_id || ''))
            }));
        let qConfig = supabase.from('cancha_playlist_config').select('*');
        if (v) qConfig = qConfig.ilike('venue_name', v);
        const { data: config } = await qConfig;
        let qTiras = supabase.from('cancha_tira').select('cancha_id, tira_informativa_id, orden, venue_name');
        if (v) qTiras = qTiras.ilike('venue_name', v);
        const { data: tiras } = await qTiras;
        const configNorm = (config || []).map((r)=>({
                ...r,
                cancha_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeCanchaIdKey"])(String(r.cancha_id || ''))
            }));
        const tirasNorm = (tiras || []).map((r)=>({
                ...r,
                cancha_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$courtPlaylists$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeCanchaIdKey"])(String(r.cancha_id || ''))
            }));
        return {
            ok: true,
            assignments,
            config: configNorm,
            tiras: tirasNorm
        };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : 'Error al cargar asignaciones.'
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    addMediaContentAction,
    deleteMediaAction,
    renameMediaAction,
    addTickerAction,
    deleteTickerAction,
    savePlaylistAction,
    saveTiraPlaylistAction,
    upsertPlaylistConfigAction,
    fetchAssignmentsAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addMediaContentAction, "400615e2431436f26bde6044913af92cf5e113a789", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteMediaAction, "40bff0ff2a3bd0e5a0aeac776675ec12b8624dc258", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(renameMediaAction, "60ba3f4d8e8c83e0ef69208080d6c6966bf623b47c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addTickerAction, "60f06574e9f652793eefffe7f9342febc29dad8643", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteTickerAction, "40f4725878b7d31dab6b788de4448375535007ef0b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(savePlaylistAction, "7c74923beca990696eef0f4b402134dfbce06c6960", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveTiraPlaylistAction, "70c2caba043da5f5afaf103d26cfec3755df267290", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(upsertPlaylistConfigAction, "70a91e9c6ea07eb0a4df594c26a9312045c552a285", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(fetchAssignmentsAction, "604b798fb887bee94c18b6cd9fd4333e6934847c80", null);
}),
"[project]/.next-internal/server/app/admin/publicidad/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/admin/publicidad/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/admin/publicidad/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/admin/publicidad/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "400615e2431436f26bde6044913af92cf5e113a789",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addMediaContentAction"],
    "40bff0ff2a3bd0e5a0aeac776675ec12b8624dc258",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteMediaAction"],
    "40f4725878b7d31dab6b788de4448375535007ef0b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteTickerAction"],
    "604b798fb887bee94c18b6cd9fd4333e6934847c80",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchAssignmentsAction"],
    "60ba3f4d8e8c83e0ef69208080d6c6966bf623b47c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renameMediaAction"],
    "60f06574e9f652793eefffe7f9342febc29dad8643",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addTickerAction"],
    "70a91e9c6ea07eb0a4df594c26a9312045c552a285",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["upsertPlaylistConfigAction"],
    "70c2caba043da5f5afaf103d26cfec3755df267290",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveTiraPlaylistAction"],
    "7c74923beca990696eef0f4b402134dfbce06c6960",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["savePlaylistAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$publicidad$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/publicidad/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/admin/publicidad/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$publicidad$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/admin/publicidad/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_e0153b64._.js.map