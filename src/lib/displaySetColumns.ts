/**
 * Columnas de sets visibles en pizarras: solo el set en curso al inicio;
 * al cerrar el primero aparece el segundo, etc.
 */

export type VisibleSetsInput = {
    matchFormat?: string;
    /** TB / STB u otros flags que implican tercer segmento */
    superTiebreak?: boolean;
    tiebreak?: boolean;
    setsT1: number;
    setsT2: number;
};

export function visibleSetNumbersForScoreboard(input: VisibleSetsInput): number[] {
    const fmt = (input.matchFormat || '') as string;
    const currentSet = input.setsT1 + input.setsT2 + 1;

    // Formatos de 1 set: solo columna SET 1
    if (fmt === 'ONE_SET_6' || fmt === 'ONE_SET_9') return [1];

    // Formatos de 2 sets + STB/TB como desempate:
    // mostrar columna 3 SOLO cuando el desempate está realmente en juego
    const twoSetsPlusDecider =
        fmt === 'TWO_SHORT_SETS' ||
        fmt === 'TWO_NORMAL_SETS' ||
        fmt === '2SETS_STB';
    if (twoSetsPlusDecider) {
        // El STB/TB está activo cuando ya se jugaron 2 sets (1-1) y empieza el 3er segmento
        const deciderActive =
            currentSet >= 3 ||
            input.superTiebreak === true ||
            input.tiebreak === true;
        if (currentSet <= 1) return [1];
        if (currentSet === 2 && !deciderActive) return [1, 2];
        return deciderActive ? [1, 2, 3] : [1, 2];
    }

    // Formatos de 3 sets normales (BEST_OF_3, etc.): mostrar col 3 desde que arranca el set 3
    if (currentSet <= 1) return [1];
    if (currentSet === 2) return [1, 2];
    return [1, 2, 3];
}

export function scoreboardGridClassForSetCount(setCount: number): string {
    if (setCount === 1) return 'grid-cols-[1fr_8%_12%]';
    if (setCount === 2) return 'grid-cols-[1fr_8%_8%_12%]';
    return 'grid-cols-[1fr_8%_8%_8%_12%]';
}
