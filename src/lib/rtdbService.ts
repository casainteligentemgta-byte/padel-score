import { ref, set, update, get, serverTimestamp, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/rtdb';

export type EstadoCancha = 'espera' | 'en_vivo';
export type ModoPublicidad = 'fija' | 'programada' | 'carrusel';

// ─── CANCHAS ─────────────────────────────────────────────────────────────────

/** Activa una cancha (marker inicia sesión y selecciona su cancha) */
export async function activarCancha(
    canchaId: string,
    markerUid: string,
    markerNombre: string,
    torneoId: string,
    partidoId: string,
    equipo1: { nombre: string; color: string },
    equipo2: { nombre: string; color: string }
) {
    const canchaRef = ref(rtdb, `canchas/${canchaId}`);
    await set(canchaRef, {
        estado: 'en_vivo' as EstadoCancha,
        marker_uid: markerUid,
        marker_nombre: markerNombre,
        torneo_id: torneoId,
        partido_id: partidoId,
        marcador: {
            sets: { local: 0, visitante: 0 },
            games: { local: 0, visitante: 0 },
            puntos: { local: '0', visitante: '0' },
            modo_puntos: 'normal' as 'normal' | 'tiebreak' | 'super_tiebreak',
            golden_point: false,
            equipo_1: equipo1,
            equipo_2: equipo2,
            saque: { equipo: 1, jugador: 1 },
            ultimo_update: Date.now(),
        },
        publicidad: {
            override_local: false,
            imagen_url_local: null,
        },
    });
}

/** Desactiva una cancha (partido terminado o marker cierra sesión) */
export async function desactivarCancha(canchaId: string) {
    const canchaRef = ref(rtdb, `canchas/${canchaId}`);
    await set(canchaRef, {
        estado: 'espera' as EstadoCancha,
        marker_uid: null,
        marker_nombre: null,
        torneo_id: null,
        partido_id: null,
        marcador: null,
        publicidad: { override_local: false, imagen_url_local: null },
    });
}

/** Actualiza solo el marcador de una cancha */
export async function actualizarMarcador(canchaId: string, marcador: Record<string, any>) {
    const marcadorRef = ref(rtdb, `canchas/${canchaId}/marcador`);
    await update(marcadorRef, {
        ...marcador,
        ultimo_update: Date.now(),
    });
}

/** Cambia el modo de puntos: normal (0/15/30/40), tiebreak (0‑7) o super_tiebreak (0‑10) */
export async function setModoPuntos(
    canchaId: string,
    modo: 'normal' | 'tiebreak' | 'super_tiebreak'
) {
    await update(ref(rtdb, `canchas/${canchaId}/marcador`), {
        modo_puntos: modo,
        puntos: { local: '0', visitante: '0' },
        ultimo_update: Date.now(),
    });
}

/** Lee el estado actual de una cancha (una sola vez, no listener) */
export async function getCanchaOnce(canchaId: string) {
    const snap = await get(ref(rtdb, `canchas/${canchaId}`));
    return snap.val();
}

// ─── PUBLICIDAD ───────────────────────────────────────────────────────────────

/** Cambia el modo global de publicidad */
export async function setModoPublicidad(modo: ModoPublicidad) {
    await update(ref(rtdb, 'publicidad_master'), { modo, ultimo_update: Date.now() });
}

/** Activa/desactiva el carrusel */
export async function toggleCarrusel(activo: boolean) {
    await update(ref(rtdb, 'publicidad_master'), {
        carrusel_activo: activo,
        ultimo_update: Date.now(),
    });
}

/** Actualiza imagen fija */
export async function setImagenFija(url: string) {
    await update(ref(rtdb, 'publicidad_master/fija'), { url });
    await update(ref(rtdb, 'publicidad_master'), { ultimo_update: Date.now() });
}

/** Programa un banner con rango horario (epoch ms) */
export async function setProgramada(url: string, inicioMs: number, finMs: number) {
    await update(ref(rtdb, 'publicidad_master/programada'), {
        activa: true,
        url,
        inicio_unix_ms: inicioMs,
        fin_unix_ms: finMs,
    });
    await update(ref(rtdb, 'publicidad_master'), { ultimo_update: Date.now() });
}

/** Agrega o actualiza una imagen del carrusel */
export async function setImagenCarrusel(imgId: string, url: string, orden: number, activa = true) {
    await set(ref(rtdb, `publicidad_master/imagenes/${imgId}`), { url, orden, activa });
    await update(ref(rtdb, 'publicidad_master'), { ultimo_update: Date.now() });
}

/** Elimina una imagen del carrusel */
export async function deleteImagenCarrusel(imgId: string) {
    await set(ref(rtdb, `publicidad_master/imagenes/${imgId}`), null);
}

// ─── ROLES (escrito solo por el Admin) ───────────────────────────────────────

export async function setRTDBUserRole(
    uid: string,
    rol: 'admin' | 'marker' | 'player',
    nombre: string,
    email: string,
    canchaAsignada?: string
) {
    await set(ref(rtdb, `usuarios_roles/${uid}`), {
        rol,
        nombre,
        email,
        cancha_asignada: canchaAsignada ?? null,
    });
}

/** Inicializa la estructura base de publicidad_master si no existe */
export async function initPublicidadMaster() {
    const snap = await get(ref(rtdb, 'publicidad_master'));
    if (!snap.exists()) {
        await set(ref(rtdb, 'publicidad_master'), {
            modo: 'fija',
            carrusel_activo: false,
            carrusel_intervalo_seg: 8,
            imagenes: {},
            fija: { url: '' },
            programada: { activa: false, url: '', inicio_unix_ms: 0, fin_unix_ms: 0 },
            ticker: { activo: false, texto: '', velocidad_seg: 30 },
            ultimo_update: Date.now(),
        });
    }
}

/** Actualiza la configuración de la correa informativa (ticker) */
export async function setTickerConfig(activo: boolean, texto: string, velocidad_seg: number) {
    await update(ref(rtdb, 'publicidad_master/ticker'), {
        activo,
        texto,
        velocidad_seg,
    });
    await update(ref(rtdb, 'publicidad_master'), { ultimo_update: Date.now() });
}

// ─── PIZARRA: CRONÓMETRO, RELOJ, LOGOS, TICKER, ANIMACIONES ─────────────────

export type CronometroTipo = 'default' | 'minimal' | 'broadcast' | 'digital';
export type RelojTipo = 'default' | 'broadcast' | 'custom';

/** Tipo de cronómetro (duración del partido) en la pizarra */
export async function setCronometroTipo(tipo: CronometroTipo) {
    await update(ref(rtdb, 'publicidad_master'), { cronometro_tipo: tipo, ultimo_update: Date.now() });
}

/** Estilo del reloj (hora del día). reloj_ocasion se mantiene por compatibilidad. */
export async function setRelojTipo(tipo: RelojTipo) {
    await update(ref(rtdb, 'publicidad_master'), { reloj_tipo: tipo, reloj_ocasion: tipo, ultimo_update: Date.now() });
}

/** Modelos de reloj: cada uno tiene id, nombre, items (urls), rotacion_seg */
export async function setRelojModelo(modeloId: string, data: { nombre: string; items: { url: string; orden: number }[]; rotacion_seg: number }) {
    await set(ref(rtdb, `publicidad_master/reloj_modelos/${modeloId}`), data);
    await update(ref(rtdb, 'publicidad_master'), { ultimo_update: Date.now() });
}

/** Selecciona qué modelo de reloj está activo */
export async function setRelojModeloActivo(modeloId: string | null) {
    await update(ref(rtdb, 'publicidad_master'), { reloj_modelo_activo: modeloId ?? null, ultimo_update: Date.now() });
}

/** Logo evento (esquina superior izquierda): lista de items y rotación */
export async function setLogoEvento(items: { id: string; url: string; orden: number }[], rotacion_seg: number) {
    const obj: Record<string, { url: string; orden: number }> = {};
    items.forEach(i => { obj[i.id] = { url: i.url, orden: i.orden }; });
    await set(ref(rtdb, 'publicidad_master/logo_evento'), { items: obj, rotacion_seg });
    await update(ref(rtdb, 'publicidad_master'), { ultimo_update: Date.now() });
}

/** Logos patrocinantes (esquina): lista y rotación */
export async function setLogosPatrocinantes(items: { id: string; url: string; orden: number }[], rotacion_seg: number) {
    const obj: Record<string, { url: string; orden: number }> = {};
    items.forEach(i => { obj[i.id] = { url: i.url, orden: i.orden }; });
    await set(ref(rtdb, 'publicidad_master/logos_patrocinantes'), { items: obj, rotacion_seg });
    await update(ref(rtdb, 'publicidad_master'), { ultimo_update: Date.now() });
}

/** Video esquina: lista y rotación */
export async function setVideoEsquina(items: { id: string; url: string; orden: number }[], rotacion_seg: number) {
    const obj: Record<string, { url: string; orden: number }> = {};
    items.forEach(i => { obj[i.id] = { url: i.url, orden: i.orden }; });
    await set(ref(rtdb, 'publicidad_master/video_esquina'), { items: obj, rotacion_seg });
    await update(ref(rtdb, 'publicidad_master'), { ultimo_update: Date.now() });
}

/** Ticker: tipo (texto | animado) y lista de animaciones para la tira */
export async function setTickerTipoYAnimaciones(tipo: 'texto' | 'animado', animaciones: { id: string; url: string; orden: number }[]) {
    const obj: Record<string, { url: string; orden: number }> = {};
    animaciones.forEach(a => { obj[a.id] = { url: a.url, orden: a.orden }; });
    await update(ref(rtdb, 'publicidad_master/ticker'), { tipo_animacion: tipo, animaciones: obj });
    await update(ref(rtdb, 'publicidad_master'), { ultimo_update: Date.now() });
}

/** Animaciones del marcador: se cargan aquí y se disparan desde el marker (botones debajo de los puntos) */
export async function setAnimacionMarcador(animId: string, data: { nombre: string; url: string } | null) {
    if (data === null) {
        await set(ref(rtdb, `publicidad_master/animaciones_marcador/${animId}`), null);
    } else {
        await set(ref(rtdb, `publicidad_master/animaciones_marcador/${animId}`), data);
    }
    await update(ref(rtdb, 'publicidad_master'), { ultimo_update: Date.now() });
}

/** El marker dispara una animación en la pizarra (por cancha) */
export async function dispararAnimacionMarcador(canchaId: string, animId: string | null) {
    await update(ref(rtdb, `canchas/${canchaId}/animacion_actual`), animId ? { id: animId, ts: Date.now() } : null);
}
