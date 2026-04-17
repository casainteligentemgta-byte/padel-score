import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TrophyShowcase } from '@/components/profile/TrophyShowcase';
import {
  fetchPublicProfileTrophies,
  isProfileUuid,
} from '@/lib/profileAchievementsServer';

export const metadata = {
  title: 'Perfil del jugador | Smart Padel',
};

type PageProps = { params: Promise<{ id: string }> };

export default async function PublicPlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  if (!id || !isProfileUuid(id)) {
    notFound();
  }

  const { profile, trophies, profileMissing } = await fetchPublicProfileTrophies(id);
  if (profileMissing) {
    notFound();
  }

  const displayName = profile.name?.trim() || 'Jugador';

  return (
    <div className="min-h-screen bg-[#080808] text-white font-outfit">
      <div className="absolute top-0 right-0 h-[420px] w-[420px] rounded-full bg-padel-primary/5 blur-[120px] pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10 pb-20">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-padel-primary transition-colors"
        >
          ← Volver
        </Link>

        <header className="mb-10 border-b border-white/5 pb-8">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-padel-primary/80 mb-2">
            Perfil público
          </p>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
            {displayName}
          </h1>
          {profile.uniqueCode && (
            <p className="mt-2 font-mono text-xs tracking-[0.25em] text-zinc-500">{profile.uniqueCode}</p>
          )}
        </header>

        <section aria-labelledby="vitrina-heading">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
              <span className="text-lg" aria-hidden>
                🏆
              </span>
            </span>
            <div>
              <h2 id="vitrina-heading" className="text-lg font-black uppercase italic tracking-tight">
                Vitrina de trofeos
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Logros y reconocimientos
              </p>
            </div>
          </div>

          <TrophyShowcase trophies={trophies} />
        </section>
      </div>
    </div>
  );
}
