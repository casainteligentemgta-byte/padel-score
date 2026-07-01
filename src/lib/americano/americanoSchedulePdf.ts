import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AmericanoPointsGoal } from '@/types/americano';
import type { AmericanoScheduleResult } from '@/types/americano';
import type { AmericanoBundle } from '@/lib/americano/americanoDb';
import { playerNameById } from '@/lib/americano/logic';
import { playerNameById as playerNameFromRotation } from '@/lib/americano/rotationEngine';

export type AmericanoPdfRoundMatch = {
  court: number;
  teamA: string;
  teamB: string;
  score?: string;
  status?: string;
};

export type AmericanoPdfRound = {
  roundNumber: number;
  matches: AmericanoPdfRoundMatch[];
  restingLabel?: string;
};

export type AmericanoPdfPlayer = {
  name: string;
  totalPoints?: number;
};

export type AmericanoPdfInput = {
  eventName: string;
  baseVenue?: string;
  courtCount: number;
  pointsGoal: AmericanoPointsGoal;
  totalRounds: number;
  estimatedMinutes?: number;
  warnings?: string[];
  players: AmericanoPdfPlayer[];
  rounds: AmericanoPdfRound[];
};

function safeFilenamePart(s: string, maxLen = 48): string {
  return s.replace(/[^\w\s\-áéíóúñüÁÉÍÓÚÑÜ]/gi, '').replace(/\s+/g, '_').slice(0, maxLen) || 'Americano';
}

export function buildAmericanoPdfInputFromSchedule(
  schedule: AmericanoScheduleResult,
  meta: {
    eventName: string;
    baseVenue?: string;
    courtCount: number;
    pointsGoal: AmericanoPointsGoal;
    players: { id: string; name: string }[];
  },
): AmericanoPdfInput {
  const nameById = (id: string) => playerNameFromRotation(meta.players, id);

  return {
    eventName: meta.eventName,
    baseVenue: meta.baseVenue,
    courtCount: meta.courtCount,
    pointsGoal: meta.pointsGoal,
    totalRounds: schedule.totalRounds,
    estimatedMinutes: schedule.estimatedMinutes,
    warnings: schedule.warnings,
    players: meta.players.map((p) => ({ name: p.name })),
    rounds: schedule.rounds.map((round) => ({
      roundNumber: round.round,
      matches: round.matches.map((m) => ({
        court: m.court,
        teamA: `${nameById(m.teamA[0])} / ${nameById(m.teamA[1])}`,
        teamB: `${nameById(m.teamB[0])} / ${nameById(m.teamB[1])}`,
      })),
      restingLabel:
        round.restingPlayerIds.length > 0
          ? round.restingPlayerIds.map((id) => nameById(id)).join(', ')
          : undefined,
    })),
  };
}

export function buildAmericanoPdfInputFromBundle(bundle: AmericanoBundle): AmericanoPdfInput {
  const { session, players, matches } = bundle;
  const roundMap = new Map<number, typeof matches>();

  for (const m of matches) {
    const list = roundMap.get(m.roundNumber) ?? [];
    list.push(m);
    roundMap.set(m.roundNumber, list);
  }

  const rounds = [...roundMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([roundNumber, roundMatches]) => {
      const restingIds = new Set<string>();
      const activeIds = new Set<string>();
      for (const m of roundMatches) {
        [m.playerA1Id, m.playerA2Id, m.playerB1Id, m.playerB2Id].forEach((id) => activeIds.add(id));
      }
      for (const p of players) {
        if (!activeIds.has(p.id)) restingIds.add(p.id);
      }

      return {
        roundNumber,
        matches: roundMatches
          .sort((a, b) => a.courtNumber - b.courtNumber)
          .map((m) => ({
            court: m.courtNumber,
            teamA: `${playerNameById(players, m.playerA1Id)} / ${playerNameById(players, m.playerA2Id)}`,
            teamB: `${playerNameById(players, m.playerB1Id)} / ${playerNameById(players, m.playerB2Id)}`,
            score: m.status === 'finished' ? `${m.scoreA} – ${m.scoreB}` : undefined,
            status: m.status,
          })),
        restingLabel:
          restingIds.size > 0
            ? [...restingIds].map((id) => playerNameById(players, id)).join(', ')
            : undefined,
      };
    });

  const estimatedMinutes =
    rounds.length > 0
      ? Math.round(
          (session.pointsGoal <= 16 ? 10 : session.pointsGoal <= 24 ? 15 : session.pointsGoal <= 32 ? 22 : 30) *
            rounds.length,
        )
      : undefined;

  return {
    eventName: session.name,
    baseVenue: session.baseVenue,
    courtCount: session.courtCount,
    pointsGoal: session.pointsGoal,
    totalRounds: rounds.length,
    estimatedMinutes,
    players: [...players]
      .sort((a, b) => b.totalPoints - a.totalPoints || a.sortOrder - b.sortOrder)
      .map((p) => ({ name: p.name, totalPoints: p.totalPoints })),
    rounds,
  };
}

export function buildAmericanoSchedulePdf(input: AmericanoPdfInput): jsPDF {
  const doc = new jsPDF();
  const margin = 14;
  let y = 18;

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(204, 255, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(String(input.eventName || 'Americano').toUpperCase(), margin, 12);
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const metaLine = [
    input.baseVenue?.trim(),
    `${input.courtCount} cancha(s)`,
    `a ${input.pointsGoal} pts`,
    `${input.players.length} jugadores`,
  ]
    .filter(Boolean)
    .join(' · ');
  doc.text(metaLine, margin, 19);
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, margin, 24);

  y = 36;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summary = [
    `${input.totalRounds} rondas`,
    input.estimatedMinutes != null ? `~${input.estimatedMinutes} min estimados` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  doc.text(summary, margin, y);
  y += 5;

  if (input.warnings?.length) {
    doc.setTextColor(160, 100, 0);
    for (const w of input.warnings) {
      doc.text(`• ${w}`, margin, y);
      y += 4;
    }
    doc.setTextColor(40, 40, 40);
    y += 2;
  }

  const tableBody: string[][] = [];
  for (const round of input.rounds) {
    for (const m of round.matches) {
      tableBody.push([
        String(round.roundNumber),
        String(m.court),
        m.teamA,
        m.score ?? (m.status === 'finished' ? '—' : 'vs'),
        m.teamB,
        round.restingLabel ?? '—',
      ]);
    }
  }

  if (tableBody.length > 0) {
    autoTable(doc, {
      startY: y + 2,
      head: [['Ronda', 'Cancha', 'Equipo A', 'Res.', 'Equipo B', 'Descanso']],
      body: tableBody,
      styles: { fontSize: 8, cellPadding: 3, valign: 'middle', textColor: [40, 40, 40] },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [204, 255, 0],
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        1: { cellWidth: 16, halign: 'center' },
        2: { cellWidth: 52 },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 52 },
        5: { cellWidth: 36, fontSize: 7 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin },
      theme: 'striped',
    });
  } else {
    doc.setFontSize(10);
    doc.text('Sin rondas generadas.', margin, y + 4);
  }

  const hasStandings = input.players.some((p) => (p.totalPoints ?? 0) > 0);
  if (hasStandings) {
    const docAny = doc as jsPDF & { lastAutoTable?: { finalY: number } };
    const standingsY = (docAny.lastAutoTable?.finalY ?? y) + 10;

    autoTable(doc, {
      startY: standingsY,
      head: [['#', 'Jugador', 'Puntos']],
      body: input.players.map((p, idx) => [
        String(idx + 1),
        p.name,
        String(p.totalPoints ?? 0),
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [204, 255, 0],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
      },
      margin: { left: margin, right: margin },
      theme: 'striped',
    });
  }

  return doc;
}

export function americanoPdfFileName(eventName: string): string {
  return `Americano_${safeFilenamePart(eventName)}.pdf`;
}

const WHATSAPP_TEXT_MAX = 3500;

export function buildAmericanoWhatsAppMessage(
  input: AmericanoPdfInput,
  shareUrl?: string,
): string {
  const lines: string[] = [];
  lines.push(`🎾 *${input.eventName}*`);
  const meta = [
    input.baseVenue?.trim(),
    `${input.courtCount} cancha(s)`,
    `a ${input.pointsGoal} pts`,
    `${input.players.length} jugadores`,
  ]
    .filter(Boolean)
    .join(' · ');
  if (meta) lines.push(`📍 ${meta}`);
  lines.push('');

  for (const round of input.rounds) {
    lines.push(`*Ronda ${round.roundNumber}*`);
    for (const m of round.matches) {
      const score = m.score ? ` _(${m.score})_` : '';
      lines.push(`Cancha ${m.court}: ${m.teamA} vs ${m.teamB}${score}`);
    }
    if (round.restingLabel) {
      lines.push(`Descanso: ${round.restingLabel}`);
    }
    lines.push('');
  }

  const hasStandings = input.players.some((p) => (p.totalPoints ?? 0) > 0);
  if (hasStandings) {
    lines.push('*Clasificación*');
    for (const [idx, p] of input.players.slice(0, 12).entries()) {
      lines.push(`${idx + 1}. ${p.name} — ${p.totalPoints ?? 0} pts`);
    }
    lines.push('');
  }

  const url = shareUrl?.trim();
  if (url) {
    lines.push(`🔗 ${url}`);
  } else {
    lines.push('📎 Cuadrante completo en PDF (descargado en tu dispositivo).');
  }

  let text = lines.join('\n').trim();
  if (text.length > WHATSAPP_TEXT_MAX) {
    text = `${text.slice(0, WHATSAPP_TEXT_MAX - 40).trim()}\n\n… (cuadrante completo en el PDF)`;
  }
  return text;
}

function openWhatsAppWithText(text: string): void {
  if (typeof window === 'undefined') return;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

export async function shareAmericanoScheduleViaWhatsApp(
  input: AmericanoPdfInput,
  options?: { shareUrl?: string },
): Promise<void> {
  const doc = buildAmericanoSchedulePdf(input);
  const fileName = americanoPdfFileName(input.eventName);
  const blob = doc.output('blob') as Blob;
  const file = new File([blob], fileName, { type: 'application/pdf' });
  const shareUrl =
    options?.shareUrl?.trim() ||
    (typeof window !== 'undefined' ? window.location.href : undefined);
  const text = buildAmericanoWhatsAppMessage(input, shareUrl);

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: input.eventName,
        text,
      });
      return;
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return;
    }
  }

  downloadAmericanoSchedulePdf(input);
  openWhatsAppWithText(text);
}

export function downloadAmericanoSchedulePdf(input: AmericanoPdfInput): void {
  const doc = buildAmericanoSchedulePdf(input);
  const fileName = americanoPdfFileName(input.eventName);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareAmericanoSchedulePdf(input: AmericanoPdfInput): Promise<void> {
  const doc = buildAmericanoSchedulePdf(input);
  const fileName = americanoPdfFileName(input.eventName);
  const blob = doc.output('blob') as Blob;
  const file = new File([blob], fileName, { type: 'application/pdf' });

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: input.eventName,
        text: `Cuadrante americano — ${input.eventName}`,
      });
      return;
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return;
    }
  }

  downloadAmericanoSchedulePdf(input);
}
