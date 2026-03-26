
// Lógica copiada de src/lib/matchScoringRules.ts
function winsTiebreakPoints(nextLeader, trailer, target) {
    return nextLeader >= target && nextLeader - trailer >= 2;
}

function runTests() {
  console.log('--- PRUEBA DE LÓGICA DE TIE-BREAK ---');

  // Test 1: Tie-break normal (Target 7)
  const tbTarget = 7;
  console.log('\n1. TIE-BREAK NORMAL (Meta: 7, Ventaja: 2)');
  console.log(`Puntos 6-5 -> ${winsTiebreakPoints(6, 5, tbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Continúa
  console.log(`Puntos 7-5 -> ${winsTiebreakPoints(7, 5, tbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Ganado
  console.log(`Puntos 7-6 -> ${winsTiebreakPoints(7, 6, tbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Continúa
  console.log(`Puntos 8-6 -> ${winsTiebreakPoints(8, 6, tbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Ganado

  // Test 2: Super Tie-break (Target 10)
  const stbTarget = 10;
  console.log('\n2. SUPER TIE-BREAK (Meta: 10, Ventaja: 2)');
  console.log(`Puntos 9-8  -> ${winsTiebreakPoints(9, 8, stbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Continúa
  console.log(`Puntos 10-8 -> ${winsTiebreakPoints(10, 8, stbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Ganado
  console.log(`Puntos 10-9 -> ${winsTiebreakPoints(10, 9, stbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Continúa
  console.log(`Puntos 11-9 -> ${winsTiebreakPoints(11, 9, stbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Ganado
}

runTests();
