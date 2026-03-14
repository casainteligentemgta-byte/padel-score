'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MediaContent } from '@/lib/supabase/publicidad';

export const useDisplayRealtime = (pantallaId: string | null) => {
  const [contenido, setContenido] = useState<MediaContent | null>(null);
  const [tiraMensajes, setTiraMensajes] = useState<string[]>([]);

  useEffect(() => {
    if (!pantallaId) return;

    const supabase = createClient();

    const fetchInitial = async () => {
      const { data: estado } = await supabase
        .from('display_estado')
        .select('media_content_id')
        .eq('pantalla_id', pantallaId)
        .single();

      if (estado?.media_content_id) {
        const { data: media } = await supabase
          .from('media_content')
          .select('*')
          .eq('id', estado.media_content_id)
          .single();
        setContenido(media as MediaContent | null);
      } else {
        setContenido(null);
      }

      try {
        const { data: tira, error } = await supabase
          .from('tira_informativa')
          .select('mensaje')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (!error && tira?.length) {
          setTiraMensajes(tira.map((r: { mensaje: string }) => r.mensaje));
        } else {
          setTiraMensajes([]);
        }
      } catch {
        setTiraMensajes([]);
      }
    };

    fetchInitial();

    const channel = supabase
      .channel(`display-${pantallaId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'display_estado',
          filter: `pantalla_id=eq.${pantallaId}`,
        },
        async (payload: { new: { media_content_id: string | null } }) => {
          const id = payload.new?.media_content_id;
          if (!id) {
            setContenido(null);
            return;
          }
          const { data } = await supabase
            .from('media_content')
            .select('*')
            .eq('id', id)
            .single();
          setContenido(data as MediaContent | null);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tira_informativa',
        },
        async () => {
          try {
            const { data } = await supabase
              .from('tira_informativa')
              .select('mensaje')
              .eq('activo', true)
              .order('orden', { ascending: true });
            if (data?.length) {
              setTiraMensajes(data.map((r: { mensaje: string }) => r.mensaje));
            } else {
              setTiraMensajes([]);
            }
          } catch {
            setTiraMensajes([]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pantallaId]);

  const tiraTexto = tiraMensajes.join('  •  ');

  return { contenido, tiraTexto, tiraMensajes };
};
