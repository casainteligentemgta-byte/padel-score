'use client';

import { useState, useCallback } from 'react';
import { PadelScoreManager, PadelMatchState, PadelSettings } from '@/lib/padelScoreLogic';

/**
 * usePadelScore
 * Hook para gestionar el marcador de un partido de pádel en tiempo real.
 */
export function usePadelScore(initialState?: Partial<PadelMatchState>, settings?: Partial<PadelSettings>) {
    const [manager] = useState(() => new PadelScoreManager(initialState, settings));
    const [state, setState] = useState<PadelMatchState>(manager.getState());

    /**
     * Sumar un punto al equipo 1 o 2.
     */
    const addPoint = useCallback((team: 1 | 2) => {
        const newState = manager.addPoint(team);
        setState(newState);
        return newState;
    }, [manager]);

    /**
     * Comprobar si toca cambio de pista.
     */
    const checkSideChange = useCallback(() => {
        return manager.shouldChangeSide();
    }, [manager]);

    /**
     * Reiniciar el marcador.
     */
    const reset = useCallback(() => {
        const resetManager = new PadelScoreManager(undefined, settings);
        setState(resetManager.getState());
    }, [settings]);

    return {
        state,
        addPoint,
        checkSideChange,
        reset
    };
}
