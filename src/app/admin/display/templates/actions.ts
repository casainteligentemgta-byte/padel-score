'use server'
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveTemplateAction(id: string, payload: any) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Supabase Service Role Client no inicializado');

  const isNew = id.startsWith('new-');
  
  // Limpiamos el payload de campos que no existen en la BD o vienen corruptos
  const { id: _, created_at, updated_at, ...data } = payload;

  if (isNew) {
    const { data: resData, error } = await supabase
      .from('display_templates')
      .insert([data])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    revalidatePath('/admin/display/templates');
    return resData;
  } else {
    const { data: resData, error } = await supabase
      .from('display_templates')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    revalidatePath('/admin/display/templates');
    return resData;
  }
}

export async function applyTemplateToCanchaAction(canchaId: string, templateId: string) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('Supabase Service Role Client no inicializado');

  const { error } = await supabase
    .from('canchas')
    .update({ current_template_id: templateId })
    .eq('cancha_id', canchaId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/display/templates');
  return { success: true };
}
