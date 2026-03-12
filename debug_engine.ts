
import { MasterScheduleEngine } from './src/services/MasterScheduleEngine';
import * as fs from 'fs';

const testCat = {
    id: 'cat-1',
    category: 'MASCULINO',
    gender: 'MALE',
    numTeams: 4,
    groupSize: 3, // Probar con 3
    teams: [
        { id: 't1', p1: { id: 'p1', name: 'Real P1' }, p2: { id: 'p2', name: 'Real P2' } },
        { id: 't2', p1: { id: 'p3', name: 'Real P3' }, p2: { id: 'p4', name: 'Real P4' } },
        { id: 't3', p1: { id: 'p5', name: 'Real P5' }, p2: { id: 'p6', name: 'Real P6' } },
        { id: 't4', p1: { id: 'p7', name: 'Real P7' }, p2: { id: 'p8', name: 'Real P8' } }
    ]
};

const pairings = (MasterScheduleEngine as any).generatePairings(testCat);
let report = '--- PAIRINGS REPORT (GroupSize 3, 4 Teams) ---\n';
pairings.forEach((p: any, i: number) => {
    report += `Match ${i + 1} [${p.roundName}]: #${p.team1Index} vs #${p.team2Index}\n`;
    report += `  P1: ${p.team1?.p1?.name || 'MISSING'} / ${p.team1?.p2?.name || 'MISSING'}\n`;
    report += `  P2: ${p.team2?.p1?.name || 'MISSING'} / ${p.team2?.p2?.name || 'MISSING'}\n`;

    // Verificar si hay campos nulos que causen el error de "jugadores 1" o similar
    if (!p.team1 || !p.team2 || !p.team1.p1 || !p.team1.p2 || !p.team2.p1 || !p.team2.p2) {
        report += `  WARNING: INCOMPLETE TEAM DATA DETECTED\n`;
    }
});
fs.writeFileSync('debug_report.txt', report);
console.log('Report written to debug_report.txt');
