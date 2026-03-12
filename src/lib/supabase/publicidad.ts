/**
 * Tipos y constantes para el sistema de publicidad y pantallas (Supabase)
 */

export type MediaTipo = 'video_url' | 'video_file' | 'imagen' | 'animacion' | 'url_web';

export interface MediaContent {
  id: string;
  tipo: MediaTipo;
  url: string;
  nombre_sponsor: string | null;
  duracion_segundos: number | null;
  nombre: string | null;
  activa: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Pantalla {
  id: string;
  nombre: string;
  ubicacion: string | null;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export type ModoDisplay = 'global' | 'individual';

export interface ConfiguracionDisplay {
  id: string;
  pantalla_id: string | null;
  media_content_id: string | null;
  modo: ModoDisplay;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface TiraInformativa {
  id: string;
  mensaje: string;
  activo: boolean;
  orden: number;
  pantalla_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisplayEstado {
  pantalla_id: string;
  media_content_id: string | null;
  updated_at: string;
}

export interface ProgramacionPublicidad {
  id: string;
  pantalla_id: string | null;
  hora_inicio: string; // "HH:MM:SS"
  hora_fin: string;
  media_content_id: string;
  prioridad: number;
  created_at: string;
  updated_at: string;
}
