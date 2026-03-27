import assert from 'node:assert/strict';
import {
  Match,
  Team,
  buildFinalFromSemifinals,
  buildPlayoffsFromGroupResults,
  calculatePoints,
  generateRoundRobinMatches,
  rankGroupAdvanced,
  rankGroup,
} from '../src/lib/tournamentEngine';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`OK  ${name}`);
  } catch (e) {
    console.error(`ERR ${name}`);
    throw e;
  }
}

run('calculatePoints formula', () => {
  assert.equal(calculatePoints(3, 1), 10);
  assert.equal(calculatePoints(0, 2), 2);
});

run('round robin count n=4 => C(4,2)=6', () => {
  const teams: Team[] = [
    { id: 'A1', name: 'A1', groupId: 'A' },
    { id: 'A2', name: 'A2', groupId: 'A' },
    { id: 'A3', name: 'A3', groupId: 'A' },
    { id: 'A4', name: 'A4', groupId: 'A' },
  ];
  const matches = generateRoundRobinMatches('A', teams);
  assert.equal(matches.length, 6);
});

run('round robin with BYE n=3 => C(3,2)=3', () => {
  const teams: Team[] = [
    { id: 'A1', name: 'A1', groupId: 'A' },
    { id: 'A2', name: 'A2', groupId: 'A' },
    { id: 'A3', name: 'A3', groupId: 'A' },
  ];
  const matches = generateRoundRobinMatches('A', teams);
  assert.equal(matches.length, 3);
});

run('ranking tiebreak by head-to-head after points and diff', () => {
  const teams: Team[] = [
    { id: 'A1', name: 'A1', groupId: 'A' },
    { id: 'A2', name: 'A2', groupId: 'A' },
    { id: 'A3', name: 'A3', groupId: 'A' },
  ];
  const matches: Match[] = [
    {
      id: 'm1',
      phase: 'GROUP',
      groupId: 'A',
      homeTeamId: 'A1',
      awayTeamId: 'A2',
      homeScore: 3,
      awayScore: 2,
      finished: true,
    },
    {
      id: 'm2',
      phase: 'GROUP',
      groupId: 'A',
      homeTeamId: 'A1',
      awayTeamId: 'A3',
      homeScore: 1,
      awayScore: 2,
      finished: true,
    },
    {
      id: 'm3',
      phase: 'GROUP',
      groupId: 'A',
      homeTeamId: 'A2',
      awayTeamId: 'A3',
      homeScore: 2,
      awayScore: 1,
      finished: true,
    },
  ];

  // A1 y A2 terminan con mismos puntos y delta (=0), gana A1 por H2H
  const ranking = rankGroup(teams, matches, 'A');
  assert.equal(ranking[0].teamId, 'A1');
  assert.equal(ranking[1].teamId, 'A2');
});

run('ranking triple tie resolves by pointsFor after points/diff', () => {
  const teams: Team[] = [
    { id: 'T1', name: 'T1', groupId: 'A' },
    { id: 'T2', name: 'T2', groupId: 'A' },
    { id: 'T3', name: 'T3', groupId: 'A' },
  ];
  const matches: Match[] = [
    // todos con 1 victoria y 1 derrota -> mismos puntos (=3) y misma diff (=0)
    { id: 'x1', phase: 'GROUP', groupId: 'A', homeTeamId: 'T1', awayTeamId: 'T2', homeScore: 6, awayScore: 5, finished: true },
    { id: 'x2', phase: 'GROUP', groupId: 'A', homeTeamId: 'T2', awayTeamId: 'T3', homeScore: 3, awayScore: 2, finished: true },
    { id: 'x3', phase: 'GROUP', groupId: 'A', homeTeamId: 'T3', awayTeamId: 'T1', homeScore: 4, awayScore: 3, finished: true },
  ];
  const ranking = rankGroup(teams, matches, 'A');
  // GF: T1=9, T2=8, T3=6
  assert.equal(ranking[0].teamId, 'T1');
  assert.equal(ranking[1].teamId, 'T2');
  assert.equal(ranking[2].teamId, 'T3');
});

run('cross semifinals and final winner chaining', () => {
  const teams: Team[] = [
    { id: 'A1', name: 'A1', groupId: 'A' },
    { id: 'A2', name: 'A2', groupId: 'A' },
    { id: 'A3', name: 'A3', groupId: 'A' },
    { id: 'B1', name: 'B1', groupId: 'B' },
    { id: 'B2', name: 'B2', groupId: 'B' },
    { id: 'B3', name: 'B3', groupId: 'B' },
  ];
  const groupMatches: Match[] = [
    // Grupo A
    { id: 'A-m1', phase: 'GROUP', groupId: 'A', homeTeamId: 'A1', awayTeamId: 'A2', homeScore: 3, awayScore: 1, finished: true },
    { id: 'A-m2', phase: 'GROUP', groupId: 'A', homeTeamId: 'A1', awayTeamId: 'A3', homeScore: 2, awayScore: 1, finished: true },
    { id: 'A-m3', phase: 'GROUP', groupId: 'A', homeTeamId: 'A2', awayTeamId: 'A3', homeScore: 2, awayScore: 0, finished: true },
    // Grupo B
    { id: 'B-m1', phase: 'GROUP', groupId: 'B', homeTeamId: 'B1', awayTeamId: 'B2', homeScore: 3, awayScore: 0, finished: true },
    { id: 'B-m2', phase: 'GROUP', groupId: 'B', homeTeamId: 'B1', awayTeamId: 'B3', homeScore: 2, awayScore: 0, finished: true },
    { id: 'B-m3', phase: 'GROUP', groupId: 'B', homeTeamId: 'B2', awayTeamId: 'B3', homeScore: 1, awayScore: 0, finished: true },
  ];

  const { semifinals } = buildPlayoffsFromGroupResults(teams, groupMatches, 'A', 'B');
  assert.equal(semifinals[0].homeTeamId, 'A1');
  assert.equal(semifinals[0].awayTeamId, 'B2');
  assert.equal(semifinals[1].homeTeamId, 'B1');
  assert.equal(semifinals[1].awayTeamId, 'A2');

  const sf1Done: Match = { ...semifinals[0], homeScore: 2, awayScore: 1, finished: true };
  const sf2Done: Match = { ...semifinals[1], homeScore: 0, awayScore: 1, finished: true };
  const final = buildFinalFromSemifinals(sf1Done, sf2Done);
  assert.equal(final.homeTeamId, 'A1');
  assert.equal(final.awayTeamId, 'A2');
});

run('advanced ranking supports deterministic seeded fallback', () => {
  const teams: Team[] = [
    { id: 'S1', name: 'S1', groupId: 'A' },
    { id: 'S2', name: 'S2', groupId: 'A' },
  ];
  const matches: Match[] = [
    {
      id: 's-1',
      phase: 'GROUP',
      groupId: 'A',
      homeTeamId: 'S1',
      awayTeamId: 'S2',
      homeScore: 1,
      awayScore: 1,
      finished: true,
    },
  ];
  const r1 = rankGroupAdvanced(teams, matches, 'A', { finalFallback: 'seeded', seed: 'alpha' });
  const r2 = rankGroupAdvanced(teams, matches, 'A', { finalFallback: 'seeded', seed: 'alpha' });
  assert.equal(r1[0].teamId, r2[0].teamId);
});

console.log('All tournament engine tests passed.');
