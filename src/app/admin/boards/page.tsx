import { redirect } from 'next/navigation';

/** Ruta histórica: las pantallas de boards se unificaron en Publicidad + Dynamic Studio. */
export default function AdminBoardsRedirectPage() {
  redirect('/admin/publicidad');
}
