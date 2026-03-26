'use client';

/**
 * Vista pantalla completa (Fullscreen) para pizarras del club.
 * ID = pantallas.id (UUID).
 * Escucha Supabase Realtime en display_estado y respeta programacion_publicidad cada minuto.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { ProgramacionPublicidad } from '@/lib/supabase/publicidad';
import { useThreeFingerDragExit } from '@/lib/useThreeFingerDragExit';

const INTERVALO_PROGRAMACION_MS = 60 * 1000; // 1 minuto

/** `/display/[id]` usa el UUID de `pantallas.id`. Números o `cancha_N` provocan error UUID en Supabase. */
function isPantallaUuid(pantallaId: string): boolean {
  const s = pantallaId.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

/** Devuelve la hora actual en formato HH:MM:SS para comparar con hora_inicio/hora_fin */
function getHoraActual(): string {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/** Comparación de tiempos en formato HH:MM:SS (strings comparan bien) */
function tiempoEntre(actual: string, inicio: string, fin: string): boolean {
  const n = actual;
  const i = inicio.length === 5 ? `${inicio}:00` : inicio;
  const f = fin.length === 5 ? `${fin}:00` : fin;
  return n >= i && n <= f;
}

export default function DisplayPantallaPage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  useThreeFingerDragExit('/');
  const [isActivated, setIsActivated] = useState(false);
  const [contenidoActualId, setContenidoActualId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return createClient();
      }
    } catch {
      // env incompleto
    }
    return null;
  }, []);

  /**
   * getContenidoProgramado: contenido a mostrar según la hora actual.
   * 1. Hora actual del sistema.
   * 2. Consulta programacion_publicidad donde la hora esté entre hora_inicio y hora_fin.
   * 3. Si hay varios, el de mayor prioridad.
   * 4. Si no hay ninguno programado, usa contenido_actual_id de la tabla pantallas.
   * 5. Si la pantalla no tiene contenido_actual_id, usa display_estado.media_content_id.
   * Se ejecuta al cargar y cada 1 minuto para cambiar al entrar en un nuevo bloque horario.
   */
  const getContenidoProgramado = useCallback(
    async (pantallaId: string): Promise<string | null> => {
      if (!supabase || !pantallaId || !isPantallaUuid(pantallaId)) return null;
      setError(null);

      const horaActual = getHoraActual();

      try {
        // 1. Programación: esta pantalla o global (pantalla_id IS NULL)
        const { data: programacion, error: errProg } = await supabase
          .from('programacion_publicidad')
          .select('id, pantalla_id, hora_inicio, hora_fin, media_content_id, prioridad')
          .or(`pantalla_id.eq.${pantallaId},pantalla_id.is.null`);

        if (errProg) {
          setError(errProg.message);
          return null;
        }

        const filas = (programacion || []) as (ProgramacionPublicidad & { hora_inicio: string; hora_fin: string })[];
        const coincidentes = filas.filter((f) =>
          tiempoEntre(horaActual, f.hora_inicio, f.hora_fin)
        );

        if (coincidentes.length > 0) {
          coincidentes.sort((a, b) => (b.prioridad ?? 0) - (a.prioridad ?? 0));
          return coincidentes[0].media_content_id;
        }

        // 2. Ninguno programado → contenido por defecto de la tabla pantallas
        const { data: pantalla, error: errPantalla } = await supabase
          .from('pantallas')
          .select('contenido_actual_id')
          .eq('id', pantallaId)
          .maybeSingle();

        if (!errPantalla && pantalla?.contenido_actual_id) {
          return pantalla.contenido_actual_id;
        }

        // 3. Si la pantalla no tiene contenido_actual_id → display_estado
        const { data: estado, error: errEstado } = await supabase
          .from('display_estado')
          .select('media_content_id')
          .eq('pantalla_id', pantallaId)
          .maybeSingle();

        if (errEstado) {
          setError(errEstado.message);
          return null;
        }

        return estado?.media_content_id ?? null;
      } catch (e: any) {
        setError(e?.message || 'Error al obtener contenido programado');
        return null;
      }
    },
    [supabase]
  );

  // Carga inicial y verificación cada 1 minuto
  useEffect(() => {
    if (!id || !supabase) return;

    if (!isPantallaUuid(id)) {
      const courtNum = id.replace(/^cancha_?/i, '').trim();
      const hint =
        courtNum && /^\d+$/.test(courtNum)
          ? ` Para la pizarra de la pista ${courtNum} abre /display/court/${courtNum}.`
          : '';
      setError(
        `La ruta /display/[id] espera el UUID de una pantalla (tabla pantallas), no un id de cancha.${hint}`,
      );
      setContenidoActualId(null);
      return;
    }

    const aplicar = async () => {
      const mediaId = await getContenidoProgramado(id);
      setContenidoActualId(mediaId);
    };

    aplicar();
    const interval = setInterval(aplicar, INTERVALO_PROGRAMACION_MS);
    return () => clearInterval(interval);
  }, [id, supabase, getContenidoProgramado]);

  const activarPantalla = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').catch((err: Error) => {
        console.error(`${err.name}, ${err.message}`);
      });
    }
  };

  if (!isActivated) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={() => {
            activarPantalla();
            setIsActivated(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black p-10 rounded-full text-2xl animate-pulse shadow-2xl shadow-emerald-500/50"
        >
          ACTIVAR PIZARRA SMART PÁDEL
        </button>
        <p className="mt-6 text-slate-400">Toca para iniciar la sincronización en tiempo real</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/20 border border-red-500/50 text-red-300 text-xs p-2 rounded z-10">
          {error}
        </div>
      )}
      <p className="text-gray-500 text-sm">Pantalla ID: {id || '—'}</p>
      <p className="text-gray-600 text-xs mt-2">
        Contenido programado: {contenidoActualId || 'ninguno'} · Se actualiza cada 1 min
      </p>
      <p className="text-gray-600 text-xs mt-2">
        Aquí irá: reproductor principal, tira informativa, logos sponsors + Realtime.
      </p>
    </div>
  );
}
