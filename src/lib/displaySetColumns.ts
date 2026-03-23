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
    const twoSetsPlusStb = fmt === 'TWO_SHORT_SETS' || fmt === 'TWO_NORMAL_SETS';
    const mayHaveThirdScoreboardCol =
        fmt === 'BEST_OF_3' ||
        fmt === '3SETS' ||
        fmt === 'THREE_SETS' ||
        fmt === 'SUPER_TIEBREAK' ||
        fmt === 'SET_3_STB' ||
        fmt === 'TIEBREAK' ||
        twoSetsPlusStb ||
        input.superTiebreak === true ||
        input.tiebreak === true;

    if (fmt === 'ONE_SET_6' || fmt === 'ONE_SET_9') return [1];
    if (currentSet <= 1) return [1];
    if (currentSet === 2) return [1, 2];
    return mayHaveThirdScoreboardCol ? [1, 2, 3] : [1, 2];
}

export function scoreboardGridClassForSetCount(setCount: number): string {
    if (setCount === 1) return 'grid-cols-[1fr_8%_12%]';
    if (setCount === 2) return 'grid-cols-[1fr_8%_8%_12%]';
    return 'grid-cols-[1fr_8%_8%_8%_12%]';
}
