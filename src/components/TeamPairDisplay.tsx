'use client';

import React from 'react';

/** Muestra los dos jugadores de una pareja; el segundo puede ir con estado "Pendiente" y estilo atenuado. */
export function TeamPairDisplay({
    player1Name,
    player2Name,
    player2Accepted = true,
    className = '',
    compact = false,
}: {
    player1Name: string;
    player2Name: string;
    player2Accepted?: boolean;
    className?: string;
    /** Si true, usa tamaños de fuente pequeños y truncate (para tablas). */
    compact?: boolean;
}) {
    const base = compact ? 'text-[9px] font-black uppercase italic tracking-tight truncate leading-none' : 'text-white font-medium';
    const secondLine = compact ? 'text-[8px] font-bold uppercase italic tracking-tighter truncate leading-none mt-1' : '';

    return (
        <div className={`flex flex-col min-w-0 ${className}`}>
            <span className={base}>{player1Name}</span>
            <span
                className={`${base} ${secondLine} transition-opacity duration-500 ${!player2Accepted ? 'opacity-30 italic text-gray-500' : 'opacity-100'}`}
            >
                {player2Name} {!player2Accepted && '(Pendiente)'}
            </span>
        </div>
    );
}
