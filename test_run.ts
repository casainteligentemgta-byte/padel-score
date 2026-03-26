
import { winsTiebreakPoints, getScoringRules } from './src/lib/matchScoringRules';

function runTests() {
  console.log('--- PRUEBA DE LÓGICA DE TIE-BREAK ---');

  // Test 1: Tie-break normal (Target 7)
  const tbTarget = 7;
  console.log('\n1. TIE-BREAK NORMAL (Meta: 7, Ventaja: 2)');
  console.log(`6-5 (TB 7): ${winsTiebreakPoints(6, 5, tbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Continúa
  console.log(`7-5 (TB 7): ${winsTiebreakPoints(7, 5, tbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Ganado
  console.log(`7-6 (TB 7): ${winsTiebreakPoints(7, 6, tbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Continúa (falta ventaja)
  console.log(`8-6 (TB 7): ${winsTiebreakPoints(8, 6, tbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Ganado

  // Test 2: Super Tie-break (Target 10)
  const stbTarget = 10;
  console.log('\n2. SUPER TIE-BREAK (Meta: 10, Ventaja: 2)');
  console.log(`9-8 (STB 10): ${winsTiebreakPoints(9, 8, stbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Continúa
  console.log(`10-8 (STB 10): ${winsTiebreakPoints(10, 8, stbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Ganado
  console.log(`10-9 (STB 10): ${winsTiebreakPoints(10, 9, stbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Continúa (falta ventaja)
  console.log(`11-9 (STB 10): ${winsTiebreakPoints(11, 9, stbTarget) ? 'GANADO' : 'CONTINÚA'}`); // Ganado

  // Test 3: Verificación de reglas por formato
  console.log('\n3. VERIFICACIÓN POR FORMATO');
  const rulesSTB = getScoringRules('TWO_NORMAL_SETS', 'STB');
  console.log(`Formato 2 Sets + STB -> Meta STB: ${rulesSTB.superTiebreakPointsToWin}`); // Debería ser 10
  
  const rulesTB = getScoringRules('TWO_NORMAL_SETS', 'TB');
  console.log(`Formato 2 Sets + TB -> Meta TB: ${rulesTB.superTiebreakPointsToWin}`); // Debería ser 7
}

runTests();
