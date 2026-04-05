'use client';

type Props = {
    size?: number;
    className?: string;
    title?: string;
};

/**
 * Pelota Smart Padel (estática, mismo look que `BouncingBall`) para indicador de saque en pizarras.
 */
export function SmartPadelBallIcon({ size = 22, className = '', title = 'Saque' }: Props) {
    const s = size;
    const inset = Math.max(1, Math.round(s * 0.09));
    return (
        <span
            className={`inline-block shrink-0 rounded-full ${className}`}
            style={{
                width: s,
                height: s,
                background:
                    'radial-gradient(circle at 35% 32%, #e8ff6a 0%, #c8f400 38%, #86b000 75%, #5a7800 100%)',
                boxShadow: `
                    inset -${inset}px -${inset + 1}px ${Math.round(s * 0.22)}px rgba(0,0,0,0.35),
                    inset ${inset}px ${inset}px ${Math.round(s * 0.16)}px rgba(255,255,180,0.45),
                    0 0 ${Math.round(s * 0.45)}px rgba(180,255,0,0.28)
                `,
            }}
            title={title}
            role="img"
            aria-label={title}
        />
    );
}
