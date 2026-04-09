'use client';

import SmartDisplay from '@/components/SmartDisplay';

export default function SmartDisplayPreviewPage() {
  return (
    <SmartDisplay
      canchaId="1"
      tournamentId="preview"
      matchId="preview"
      venueName="SEDE CENTRAL"
      smartPadelColor="#ccff00"
      initialMatchData={{
        playerA1: 'JUAN PEREZ',
        playerA2: 'MARIO LOPEZ',
        playerB1: 'DIEGO RUIZ',
        playerB2: 'PABLO GOMEZ',
        currentPointsA: '40',
        currentPointsB: '30',
        prevSets: ['6-4', '3-6'],
        serverTeam: 'A',
        tournamentName: 'TORNEO SMART PADEL',
        tournamentCategory: 'SUMA 8 / MASCULINO',
        tournamentPhase: 'SEMIFINAL',
        elapsedSeconds: 754,
        temperatureC: 24,
        tickerMessages: [
          { id: '1', mensaje: 'BIENVENIDOS AL SMART DISPLAY PREVIEW' },
          { id: '2', mensaje: 'HEADER NUEVO: PISTA, TIEMPO, SEDE, FECHA Y TEMPERATURA' },
        ],
      }}
    />
  );
}
