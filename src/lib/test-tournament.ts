import { 
  generateRoundRobin, 
  getRanking, 
  generateSemifinals, 
  MatchStatus, 
  Team, 
  Match 
} from './tournamentCore';

// 1. Definir equipos
const groupA: Team[] = [
  { id: 'A1', name: 'Equipo A1' },
  { id: 'A2', name: 'Equipo A2' },
  { id: 'A3', name: 'Equipo A3' },
];

const groupB: Team[] = [
  { id: 'B1', name: 'Equipo B1' },
  { id: 'B2', name: 'Equipo B2' },
  { id: 'B3', name: 'Equipo B3' },
];

console.log("--- GENERANDO ROUND ROBIN (GRUPO A) ---");
const matchesA = generateRoundRobin(groupA, "GRUPO_A");
console.log(`Partidos generados: ${matchesA.length}`);

// 2. Simular resultados para Grupo A
// A1 gana 10-5 a A2
// A1 pierde 8-12 contra A3
// A2 gana 15-10 a A3
const simulatedA = [...matchesA];
// Encontrar partido A1 vs A2
const m_a1_a2 = simulatedA.find(m => (m.team1Id === 'A1' && m.team2Id === 'A2') || (m.team2Id === 'A1' && m.team1Id === 'A2'))!;
m_a1_a2.status = MatchStatus.FINISHED;
m_a1_a2.score1 = 10; m_a1_a2.score2 = 5;

// Encontrar partido A1 vs A3
const m_a1_a3 = simulatedA.find(m => (m.team1Id === 'A1' && m.team2Id === 'A3') || (m.team2Id === 'A1' && m.team1Id === 'A3'))!;
m_a1_a3.status = MatchStatus.FINISHED;
m_a1_a3.score1 = 8; m_a1_a3.score2 = 12;

// Encontrar partido A2 vs A3
const m_a2_a3 = simulatedA.find(m => (m.team1Id === 'A2' && m.team2Id === 'A3') || (m.team2Id === 'A2' && m.team1Id === 'A3'))!;
m_a2_a3.status = MatchStatus.FINISHED;
m_a2_a3.score1 = 15; m_a2_a3.score2 = 10;

console.log("--- CALCULANDO RANKING (GRUPO A) ---");
const rankingA = getRanking(groupA, simulatedA);
rankingA.forEach((tr, index) => {
  console.log(`${index + 1}. ${tr.name} - Pts: ${tr.totalPoints}, Delta: ${tr.pointDiff}`);
});

// 3. Simular resultados para Grupo B (B1 1ro, B2 2do)
const matchesB = generateRoundRobin(groupB, "GRUPO_B");
const simulatedB = [...matchesB];
// B1 gana todos
simulatedB.forEach(m => {
  m.status = MatchStatus.FINISHED;
  if (m.team1Id === 'B1') { m.score1 = 20; m.score2 = 5; }
  else if (m.team2Id === 'B1') { m.score2 = 20; m.score1 = 5; }
  else { m.score1 = 10; m.score2 = 10; } // Otros empatan
});

const rankingB = getRanking(groupB, simulatedB);

console.log("--- GENERANDO SEMIFINALES (CRUCE EN X) ---");
const semifinals = generateSemifinals(rankingA, rankingB);
semifinals.forEach(m => {
  console.log(`${m.id}: ${m.team1Id} vs ${m.team2Id}`);
});
