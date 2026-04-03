import { redirect } from 'next/navigation';

/** Compatibilidad con enlaces antiguos a boards/youtube. */
export default function AdminBoardsYoutubeRedirectPage() {
  redirect('/admin/publicidad');
}
