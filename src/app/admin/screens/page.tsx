import { redirect } from 'next/navigation';

/** Ruta histórica: gestión de pantallas vía Publicidad y display/court. */
export default function AdminScreensRedirectPage() {
  redirect('/admin/publicidad');
}
