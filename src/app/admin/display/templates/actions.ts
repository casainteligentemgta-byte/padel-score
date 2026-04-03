'use server';

import { splitRatioFromDatabase, splitRatioToDatabase } from '@/lib/displayTemplateSplitRatio';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type TemplateRow = {
  id: string;
  name: string;
  header_vh: number;
  score_vh: number;
  media_vh: number;
  ticker_vh: number;
  split_ratio: number;
  clock_style: string;
  clock_color: string;
  created_at?: string;
  updated_at?: string;
};

type RawTemplatePayload = {
  name?: string;
  header_vh?: number;
  score_vh?: number;
  media_vh?: number;
  ticker_vh?: number;
  split_ratio?: number;
  clock_style?: string;
  clock_color?: string;
};

/** Solo primitivos serializables para el resultado de la Server Action (evita fallos de Flight). */
function toPlainTemplateRow(row: Record<string, unknown>): TemplateRow {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    header_vh: Number(row.header_vh) || 0,
    score_vh: Number(row.score_vh) || 0,
    media_vh: Number(row.media_vh) || 0,
    ticker_vh: Number(row.ticker_vh) || 0,
    split_ratio: splitRatioFromDatabase(row.split_ratio),
    clock_style: String(row.clock_style ?? 'modern'),
    clock_color: String(row.clock_color ?? '#ccff00'),
    created_at: row.created_at != null ? String(row.created_at) : undefined,
    updated_at: row.updated_at != null ? String(row.updated_at) : undefined,
  };
}

function normalizeTemplatePayload(input: RawTemplatePayload) {
  let h = Math.round(Math.max(0, Number(input.header_vh) || 10));
  let s = Math.round(Math.max(0, Number(input.score_vh) || 23));
  let m = Math.round(Math.max(0, Number(input.media_vh) || 59));
  const cap = Math.max(0, 100 - h - s);
  m = Math.min(m, cap);
  const t = 100 - h - s - m;
  return {
    name: (input.name || 'Sin Nombre').trim() || 'Sin Nombre',
    header_vh: h,
    score_vh: s,
    media_vh: m,
    ticker_vh: t,
    split_ratio: splitRatioToDatabase(input.split_ratio ?? 0.5),
    clock_style: input.clock_style || 'modern',
    clock_color: input.clock_color || '#ccff00',
  };
}

export async function saveTemplateAction(
  id: string,
  payload: Record<string, unknown>,
): Promise<{ ok: true; data: TemplateRow } | { ok: false; error: string }> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return {
      ok: false,
      error:
        'Servidor sin credenciales Supabase (service role). Configura SUPABASE_SERVICE_ROLE_KEY en el entorno de producción.',
    };
  }

  const isNew = id.startsWith('new-');
  const { id: _i, created_at: _c, updated_at: _u, ...rest } = payload;
  const data = normalizeTemplatePayload(rest as RawTemplatePayload);

  if (data.header_vh + data.score_vh + data.media_vh + data.ticker_vh !== 100) {
    return { ok: false, error: 'Los bloques VH deben sumar 100. Revisa cabecera, marcador y media.' };
  }

  try {
    if (isNew) {
      const { data: resData, error } = await supabase
        .from('display_templates')
        .insert([data])
        .select()
        .single();

      if (error) {
        return { ok: false, error: error.message || 'No se pudo crear el template.' };
      }
      revalidatePath('/admin/display/templates');
      return { ok: true, data: toPlainTemplateRow(resData as Record<string, unknown>) };
    }

    const { data: resData, error } = await supabase
      .from('display_templates')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { ok: false, error: error.message || 'No se pudo actualizar el template.' };
    }
    if (!resData) {
      return {
        ok: false,
        error: 'No se encontró el template en la base de datos. Recarga la página e inténtalo de nuevo.',
      };
    }
    revalidatePath('/admin/display/templates');
    return { ok: true, data: toPlainTemplateRow(resData as Record<string, unknown>) };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error inesperado al guardar.';
    return { ok: false, error: msg };
  }
}

export async function applyTemplateToCanchaAction(
  canchaId: string,
  templateId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return {
      ok: false,
      error:
        'Servidor sin credenciales Supabase (service role). Configura SUPABASE_SERVICE_ROLE_KEY en el entorno de producción.',
    };
  }

  try {
    const { error } = await supabase
      .from('canchas')
      .update({ current_template_id: templateId })
      .eq('cancha_id', canchaId);

    if (error) {
      return { ok: false, error: error.message || 'No se pudo aplicar el template a la cancha.' };
    }
    revalidatePath('/admin/display/templates');
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error inesperado al aplicar.';
    return { ok: false, error: msg };
  }
}
