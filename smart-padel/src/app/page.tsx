import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige la raíz directamente a /login
  redirect('/login');
}
