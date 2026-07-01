import { AmericanoSessionControl } from '@/components/americano/AmericanoSessionControl';
import Link from 'next/link';

type Props = {
  params: Promise<{ sessionId: string }>;
};

export default async function AmericanoSessionPage({ params }: Props) {
  const { sessionId } = await params;

  return (
    <div className="min-h-screen bg-black font-outfit text-white">
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-amber-300">
        Americano · panel de control
      </div>

      <header className="border-b border-white/10 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <Link
            href="/americano"
            className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-300 hover:border-amber-400/40 hover:text-amber-300"
          >
            ← Laboratorio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-8">
        <AmericanoSessionControl sessionId={sessionId} />
      </main>
    </div>
  );
}
