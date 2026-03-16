import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { dataService } from '@/lib/dataService';

const PLACEHOLDER_PHOTO = 'https://via.placeholder.com/250';

function ensureAbsoluteUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return PLACEHOLDER_PHOTO;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return PLACEHOLDER_PHOTO;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('match_id');
  const tournamentId = searchParams.get('tournament_id');

  if (!matchId || !tournamentId) {
    return NextResponse.json(
      { error: 'Faltan match_id o tournament_id' },
      { status: 400 }
    );
  }

  try {
    const [tournament, matches] = await Promise.all([
      dataService.getTournament(tournamentId),
      dataService.getMatches(tournamentId),
    ]);

    if (!tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    const match = matches.find((m: any) => m.id === matchId);
    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    const status = (match as any).status;
    const sets = (match as any).sets ?? { t1: 0, t2: 0 };
    const team1Wins = (sets.t1 ?? 0) > (sets.t2 ?? 0);
    const winnerTeam = team1Wins ? (match as any).team1 : (match as any).team2;
    const loserTeam = team1Wins ? (match as any).team2 : (match as any).team1;

    const winnerP1 = winnerTeam?.p1 ?? {};
    const winnerP2 = winnerTeam?.p2 ?? {};
    const loserP1 = loserTeam?.p1 ?? {};
    const loserP2 = loserTeam?.p2 ?? {};

    const winnerNames = [winnerP1.name, winnerP2.name].filter(Boolean).join(' / ') || 'Ganadores';
    const loserNames = [loserP1.name, loserP2.name].filter(Boolean).join(' / ') || 'Rivales';
    const winnerPhoto = ensureAbsoluteUrl(winnerP1.photo ?? winnerP2.photo);
    const loserPhoto = ensureAbsoluteUrl(loserP1.photo ?? loserP2.photo);

    const tournamentName = (tournament as any).name ?? (tournament as any).eventName ?? 'Torneo Smart Padel';
    const scoreStr = (match as any).score ?? `${sets.t1 ?? 0}-${sets.t2 ?? 0}`;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0a0a0a',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            padding: 50,
            border: '10px solid #ccff00',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ color: '#ccff00', fontSize: 80, fontStyle: 'italic', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
              ¡VICTORIA PRO!
            </div>
            <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.8)', marginTop: 10 }}>{tournamentName}</div>
          </div>

          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%', textAlign: 'center' }}>
              <img src={winnerPhoto} alt="" width={250} height={250} style={{ borderRadius: '50%', border: '5px solid #ccff00', objectFit: 'cover' }} />
              <div style={{ fontSize: 35, fontWeight: 'bold', marginTop: 15 }}>{winnerNames}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 120, fontWeight: 900, color: 'white', letterSpacing: -5 }}>{scoreStr}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%', textAlign: 'center', opacity: 0.5 }}>
              <img src={loserPhoto} alt="" width={250} height={250} style={{ borderRadius: '50%', border: '5px solid white', objectFit: 'cover' }} />
              <div style={{ fontSize: 35, fontWeight: 'bold', marginTop: 15 }}>{loserNames}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px 40px', borderRadius: 20 }}>
            <div style={{ fontSize: 25, color: '#ccff00', margin: 0 }}>🔥 DATO DESTACADO 🔥</div>
            <div style={{ fontSize: 35, fontWeight: 'bold', marginTop: 5 }}>Gracias por jugar en Smart Padel.</div>
          </div>

          <div style={{ fontSize: 20, color: '#666' }}>Generado por smartpadel58.com</div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );
  } catch (err: any) {
    console.error('[generate-victory-card]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Error al generar la tarjeta' },
      { status: 500 }
    );
  }
}
