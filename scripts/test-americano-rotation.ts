import { generateRotativeRotation, validateMatchScores } from '../src/lib/americano/logic.ts';
import { generateBalancedRotation } from '../src/lib/americano/socialGolfer.ts';
import {
  isAmericanoMatchComplete,
  nextAmericanoScore,
} from '../src/lib/americano/americanoScoring.ts';
import { ScheduleEngine } from '../src/services/ScheduleEngine.ts';
import { flattenPlayersFromTeams } from '../src/lib/americano/tournamentBridge.ts';
import { TournamentType } from '../src/types/tournament.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function partnerRepeatMax(players: { id: string; name: string }[], courtCount: number) {
  const r = generateBalancedRotation(players, courtCount, 24);
  const partnerCount = new Map<string, number>();
  function inc(a: string, b: string) {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    partnerCount.set(key, (partnerCount.get(key) ?? 0) + 1);
  }
  for (const round of r.rounds) {
    for (const m of round.matches) {
      inc(m.playerA1Id, m.playerA2Id);
      inc(m.playerB1Id, m.playerB2Id);
    }
  }
  let max = 0;
  for (const v of partnerCount.values()) max = Math.max(max, v);
  return max;
}

function testRotation() {
  const players = Array.from({ length: 8 }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Jugador ${i + 1}`,
  }));
  const result = generateRotativeRotation(players, 2, 24);
  assert(result.rounds.length === 7, '8 jugadores deben generar 7 rondas');
  assert(result.rounds[0].matches.length === 2, '2 canchas en ronda 1');
  assert(validateMatchScores(24, 18, 24) === null, '24-18 válido');
  assert(validateMatchScores(24, 24, 24) !== null, 'empate inválido');
  assert(validateMatchScores(24, 23, 24) === null, '24-23 válido');
  assert(validateMatchScores(23, 20, 24) !== null, 'ganador debe llegar a 24');

  const maxPartners = partnerRepeatMax(players, 2);
  assert(maxPartners <= 2, `social golfer: repeticiones de pareja <= 2 (got ${maxPartners})`);
}

function testScheduleEngine() {
  const teams = Array.from({ length: 4 }, (_, i) => ({
    id: `team-${i}`,
    p1: { id: `p${i * 2 + 1}`, name: `J${i * 2 + 1}` },
    p2: { id: `p${i * 2 + 2}`, name: `J${i * 2 + 2}` },
  }));

  const schedule = ScheduleEngine.generateAmericanoIndividualSchedule({
    tournamentId: 'test',
    numTeams: teams.length,
    numCourts: 2,
    clubHoursStart: '08:00',
    clubHoursEnd: '22:00',
    startDate: new Date('2026-07-01'),
    matchDurationMinutes: 15,
    bufferMinutes: 2,
    type: TournamentType.AMERICANO_INDIVIDUAL,
    teams,
    players: flattenPlayersFromTeams(teams),
    pointsGoal: 24,
  });

  assert(schedule.matches.length > 0, 'debe generar partidos');
  assert(schedule.matches[0].format === 'AMERICANO_ROTATIVE', 'formato rotativo');
  assert(Boolean(schedule.matches[0].playerA1Id), 'partido con 4 jugadores');
}

function testTactileScoring() {
  const base = { scoreA: 20, scoreB: 18, pointsGoal: 24 as const };
  const inc = nextAmericanoScore(base, 'a', 'increment');
  assert(inc?.scoreA === 21, 'increment team A');
  assert(isAmericanoMatchComplete({ scoreA: 24, scoreB: 20, pointsGoal: 24 }), '24-20 completo');
  assert(!isAmericanoMatchComplete({ scoreA: 23, scoreB: 20, pointsGoal: 24 }), '23-20 incompleto');
  assert(nextAmericanoScore({ scoreA: 0, scoreB: 0, pointsGoal: 24 }, 'a', 'decrement') === null, 'no negativos');
}

testRotation();
testScheduleEngine();
testTactileScoring();
console.log('test-americano-rotation: OK');
