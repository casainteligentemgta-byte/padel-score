import assert from 'node:assert/strict';
import {
  applyAmericanoPoint,
  buildAmericanoDuplaStandings,
  courtsForAmericanoDupla,
  generateAmericanoDuplaIndexPairings,
  generateAmericanoDuplaPairings,
  isAmericanoMatchComplete,
  rankAmericanoDupla,
  resolveAmericanoPointsGoal,
} from '../src/lib/americanoDupla';
import { getScoringRules } from '../src/lib/matchScoringRules';
import { MasterScheduleEngine } from '../src/services/MasterScheduleEngine';
import { TournamentType } from '../src/types/tournament';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`OK  ${name}`);
  } catch (e) {
    console.error(`ERR ${name}`);
    throw e;
  }
}

run('pointsGoal defaults to 24 and accepts 16/24/32', () => {
  assert.equal(resolveAmericanoPointsGoal(undefined), 24);
  assert.equal(resolveAmericanoPointsGoal(20), 24);
  assert.equal(resolveAmericanoPointsGoal(16), 16);
  assert.equal(resolveAmericanoPointsGoal(32), 32);
});

run('generator n=4 => C(4,2)=6', () => {
  const pairs = generateAmericanoDuplaIndexPairings(4);
  assert.equal(pairs.length, 6);
  const keys = new Set(pairs.map(([a, b]) => (a < b ? `${a}-${b}` : `${b}-${a}`)));
  assert.equal(keys.size, 6);
});

run('generator n=5 with BYE => C(5,2)=10', () => {
  const pairs = generateAmericanoDuplaIndexPairings(5);
  assert.equal(pairs.length, 10);
});

run('courts = min(P/2, numCourts)', () => {
  assert.equal(courtsForAmericanoDupla(5, 4), 2);
  assert.equal(courtsForAmericanoDupla(8, 3), 3);
  assert.equal(courtsForAmericanoDupla(3, 6), 1);
});

run('master engine: AMERICANO_DUPLA is RR only, no knockout', () => {
  const teams = Array.from({ length: 5 }, (_, i) => ({
    id: `t${i}`,
    p1: { id: `p1-${i}`, name: `A${i}` },
    p2: { id: `p2-${i}`, name: `B${i}` },
  }));
  const result = MasterScheduleEngine.generateMasterSchedule({
    tournamentName: 'Test',
    startDate: '2026-11-05',
    endDate: '2026-11-05',
    dailyStartTime: '08:00',
    dailyEndTime: '23:00',
    numCourts: 4,
    courtNames: ['P1', 'P2', 'P3', 'P4'],
    matchDurationMinutes: 30,
    bufferMinutes: 2,
    categories: [{
      id: 'cat1',
      gender: 'MALE',
      category: 'PRIMERA' as any,
      numTeams: 5,
      type: TournamentType.AMERICANO_DUPLA,
      teams,
      goldenPoint: false,
      setFormat: 'TIE_BREAK',
      matchFormat: '2SETS_STB',
      groupSize: 4,
      advanceCount: 2,
      pointsGoal: 24,
    }],
  });
  assert.equal(result.totalMatches, 10);
  assert.ok(result.matches.every((m: any) => m.roundName === 'Fase de Grupos' && m.isKnockout !== true));
});

run('pairings helper keeps team objects and 1-based indices', () => {
  const teams = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const pairs = generateAmericanoDuplaPairings(teams);
  assert.equal(pairs.length, 3);
  assert.ok(pairs.every((p) => p.team1Index >= 1 && p.team2Index >= 1));
});

run('scoring end: 15-8 +1 => 15-9 complete at 24', () => {
  const next = applyAmericanoPoint(15, 8, 'visitante', 1);
  assert.deepEqual(next, { local: 15, visitante: 9 });
  assert.equal(isAmericanoMatchComplete(15, 8, 24), false);
  assert.equal(isAmericanoMatchComplete(15, 9, 24), true);
});

run('scoring end: 12-11 +1 => 12-12 complete (draw allowed)', () => {
  const next = applyAmericanoPoint(12, 11, 'visitante', 1);
  assert.deepEqual(next, { local: 12, visitante: 12 });
  assert.equal(isAmericanoMatchComplete(next.local, next.visitante, 24), true);
});

run('scoring rules expose points mode via matchScoringRules', () => {
  const r = getScoringRules('AMERICANO_POINTS', 'STB', { pointsGoal: 16, tournamentType: 'AMERICANO_DUPLA' });
  assert.equal(r.scoringMode, 'points');
  assert.equal(r.pointsGoal, 16);
  const sets = getScoringRules('ONE_SET_6', 'TB');
  assert.notEqual(sets.scoringMode, 'points');
  assert.equal(sets.setsToWinMatch, 1);
});

run('ranking: pointsFor, then diff, then H2H', () => {
  const teams = [
    { id: 'A', name: 'A' },
    { id: 'B', name: 'B' },
    { id: 'C', name: 'C' },
  ];
  const matches = [
    { team1Id: 'A', team2Id: 'B', score1: 15, score2: 9, finished: true },
    { team1Id: 'A', team2Id: 'C', score1: 10, score2: 14, finished: true },
    { team1Id: 'B', team2Id: 'C', score1: 13, score2: 11, finished: true },
  ];
  // A: PF 25, PA 23, diff +2
  // B: PF 22, PA 26, diff -4
  // C: PF 25, PA 23, diff +2
  // A vs C: C won 14-10 → C ahead of A on H2H
  const ranked = rankAmericanoDupla(teams, matches);
  assert.deepEqual(ranked.map((r) => r.id), ['C', 'A', 'B']);
  assert.equal(ranked[0].pointsFor, 25);
  assert.equal(ranked[1].pointsFor, 25);
  assert.equal(ranked[0].pointDiff, 2);
});

run('buildAmericanoDuplaStandings uses games as points', () => {
  const tournament = {
    type: TournamentType.AMERICANO_DUPLA,
    teams: [
      { p1: { name: 'Ana' }, p2: { name: 'Luis' } },
      { p1: { name: 'Bea' }, p2: { name: 'Carlos' } },
    ],
  };
  const matches = [{
    status: 'FINISHED',
    team1Index: 1,
    team2Index: 2,
    games: { t1: 15, t2: 9 },
  }];
  const rows = buildAmericanoDuplaStandings(tournament, matches);
  assert.equal(rows[0].id, 'team-1');
  assert.equal(rows[0].pointsFor, 15);
  assert.equal(rows[1].pointsFor, 9);
});
