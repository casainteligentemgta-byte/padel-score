/**
 * IDs de canchas para autorización de marcadores.
 * El admin asigna a cada marcador una o varias canchas; solo puede marcar en esas.
 */
export const CANCHA_IDS = ['cancha_1', 'cancha_2', 'cancha_3', 'cancha_4', 'cancha_5', 'cancha_6'] as const;
export type CanchaId = (typeof CANCHA_IDS)[number];

export function getCanchaLabel(id: string): string {
    const num = id.replace('cancha_', '');
    return `Pista ${num}`;
}
