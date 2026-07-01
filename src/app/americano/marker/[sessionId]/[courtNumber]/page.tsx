import { AmericanoCourtMarker } from '@/components/americano/AmericanoCourtMarker';
import Link from 'next/link';

type Props = {
  params: Promise<{ sessionId: string; courtNumber: string }>;
};

export default async function AmericanoCourtMarkerPage({ params }: Props) {
  const { sessionId, courtNumber } = await params;
  const court = Math.max(1, parseInt(courtNumber, 10) || 1);

  return (
    <div className="min-h-[100dvh] bg-black font-outfit text-white touch-manipulation">
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-amber-300">
        Marcador táctil · americano
      </div>

      <header className="border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <Link
            href={`/americano/session/${sessionId}`}
            className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-amber-300"
          >
            ← Control
          </Link>
          <Link
            href={`/americano/tv/${sessionId}?court=${court}`}
            target="_blank"
            className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-amber-300"
          >
            TV cancha
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6">
        <AmericanoCourtMarker sessionId={sessionId} courtNumber={court} />
      </main>
    </div>
  );
}
