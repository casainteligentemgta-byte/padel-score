'use client';

import { useId, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export type LegalFlowType = 'inscription' | 'pro_player';

export type PremiumPartner = 'buchanans' | 'buchanans_pro';

export type SponsorConfig = {
    /** Color del cuerpo (ignorado si `premiumPartner === 'buchanans_pro'` usa degradado marca) */
    bodyColor: string;
    /** URL del logo (sello / marca); en Buchanan's Pro suele ir al sello flotante en la pantalla LED */
    logoUrl: string;
    eyeColor?: string;
    specialAccessories?: string[];
    /** Preset premium (estilos condicionales sin assets pesados) */
    premiumPartner?: PremiumPartner;
};

const LEGAL_COPY: Record<LegalFlowType, string> = {
    inscription: '¡Epa! Firma aquí para que tu comprobante sea validado y entres al sorteo.',
    pro_player: '¡Estás a un paso de ser PRO! Lee esto para que juguemos bajo las reglas.',
};

const BUCHANANS_PRO = {
    bodyGradient: ['#004D40', '#00695C'] as const,
    seam: '#B71C1C',
    ledEye: '#CCFF00',
    gold: '#c9a227',
    goldSoft: 'rgba(201, 162, 39, 0.55)',
} as const;

function resolveBubbleText(message: string | undefined, type: LegalFlowType | undefined): string {
    if (message?.trim()) return message.trim();
    if (type) return LEGAL_COPY[type];
    return 'Smart Padel';
}

function SunRays({ color }: { color: string }) {
    const rays = 8;
    return (
        <g aria-hidden style={{ color }}>
            {Array.from({ length: rays }).map((_, i) => {
                const a = (i / rays) * Math.PI * 2;
                const x2 = 20 + Math.cos(a) * 14;
                const y2 = 12 + Math.sin(a) * 14;
                return (
                    <line
                        key={i}
                        x1={20}
                        y1={12}
                        x2={x2}
                        y2={y2}
                        stroke="currentColor"
                        strokeWidth={1.2}
                        strokeLinecap="round"
                        opacity={0.45}
                    />
                );
            })}
        </g>
    );
}

function IceFrame() {
    return (
        <rect
            x={1}
            y={1}
            width={38}
            height={38}
            rx={10}
            fill="none"
            stroke="#7dd3fc"
            strokeWidth={1.25}
            opacity={0.85}
            style={{ filter: 'drop-shadow(0 0 3px rgba(125,211,252,0.5))' }}
        />
    );
}

/** Curvas tipo costura de pelota de pádel (líneas rojo mate en preset Pro). */
function PadelSeamLines({ stroke, opacity = 0.92 }: { stroke: string; opacity?: number }) {
    return (
        <g fill="none" stroke={stroke} strokeWidth={1.15} strokeLinecap="round" opacity={opacity}>
            <path d="M 10 22 Q 20 16 30 22" />
            <path d="M 10 24 Q 20 30 30 24" />
        </g>
    );
}

function PuntitoSponsorAvatar({
    config,
    idle,
    celebrate,
    thinking,
    xEyes,
    gradientId,
}: {
    config: SponsorConfig;
    idle: boolean;
    celebrate: boolean;
    thinking: boolean;
    xEyes: boolean;
    gradientId: string;
}) {
    const isPro = config.premiumPartner === 'buchanans_pro';
    const eye = isPro ? BUCHANANS_PRO.ledEye : config.eyeColor ?? '#CCFF00';
    const acc = new Set(config.specialAccessories ?? []);
    const bodyFill = isPro ? `url(#${gradientId})` : config.bodyColor;
    const runIdle = idle && !celebrate;
    const runThinking = thinking && !celebrate;
    const runXEyes = xEyes && !celebrate;

    return (
        <motion.svg
            viewBox="0 0 40 40"
            className="h-9 w-9 shrink-0 overflow-visible"
            aria-hidden
            animate={runIdle ? { y: [0, -2.2, 0, -1.2, 0] } : { y: 0 }}
            transition={{ duration: 4.2, repeat: runIdle ? Infinity : 0, ease: 'easeInOut' }}
        >
            {isPro && (
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={BUCHANANS_PRO.bodyGradient[0]} />
                        <stop offset="100%" stopColor={BUCHANANS_PRO.bodyGradient[1]} />
                    </linearGradient>
                </defs>
            )}

            {acc.has('sun-rays') && <SunRays color={eye} />}
            {acc.has('ice-frame') && <IceFrame />}

            <rect
                x={6}
                y={10}
                width={28}
                height={24}
                rx={9}
                ry={9}
                fill={bodyFill}
                stroke={isPro ? 'rgba(201,162,39,0.35)' : 'rgba(255,255,255,0.18)'}
                strokeWidth={isPro ? 1.2 : 1}
            />

            {isPro && <PadelSeamLines stroke={BUCHANANS_PRO.seam} />}

            <motion.g
                animate={
                    runThinking
                        ? { x: [0, 0.7, 0, -0.4, 0] }
                        : runIdle
                          ? { x: [0, 1.5, 0, -1.5, 0] }
                          : { x: 0 }
                }
                transition={{ duration: 5.6, repeat: runIdle || runThinking ? Infinity : 0, ease: 'easeInOut' }}
            >
                <motion.g
                    style={{ transformOrigin: '20px 19px' }}
                    animate={
                        runThinking
                            ? { scaleY: [1, 0.78, 0.96, 0.78, 1], x: [0, 0.6, 0] }
                            : runIdle
                              ? { scaleY: [1, 1, 0.1, 1, 1], x: 0 }
                              : { scaleY: 1, x: 0 }
                    }
                    transition={{
                        duration: runThinking ? 1.6 : 3.4,
                        repeat: runIdle || runThinking ? Infinity : 0,
                        ease: 'easeInOut',
                        times: runThinking ? undefined : [0, 0.86, 0.9, 0.94, 1],
                    }}
                >
                    {runXEyes ? (
                        <>
                            <motion.path
                                d="M 12.2 18.2 L 17.8 23.8"
                                stroke={eye}
                                strokeWidth={1.9}
                                strokeLinecap="round"
                                animate={{ opacity: [1, 0.65, 1], rotate: [0, -10, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <motion.path
                                d="M 17.8 18.2 L 12.2 23.8"
                                stroke={eye}
                                strokeWidth={1.9}
                                strokeLinecap="round"
                                animate={{ opacity: [1, 0.65, 1], rotate: [0, 10, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <motion.path
                                d="M 22.2 18.2 L 27.8 23.8"
                                stroke={eye}
                                strokeWidth={1.9}
                                strokeLinecap="round"
                                animate={{ opacity: [1, 0.65, 1], rotate: [0, 10, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <motion.path
                                d="M 27.8 18.2 L 22.2 23.8"
                                stroke={eye}
                                strokeWidth={1.9}
                                strokeLinecap="round"
                                animate={{ opacity: [1, 0.65, 1], rotate: [0, -10, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </>
                    ) : (
                        <>
                            <circle cx={14} cy={19} r={3.2} fill={eye} style={{ filter: 'drop-shadow(0 0 2px currentColor)' }} />
                            <circle cx={26} cy={19} r={3.2} fill={eye} style={{ filter: 'drop-shadow(0 0 2px currentColor)' }} />
                            <circle cx={13.2} cy={18.2} r={0.9} fill="rgba(255,255,255,0.85)" />
                            <circle cx={25.2} cy={18.2} r={0.9} fill="rgba(255,255,255,0.85)" />
                        </>
                    )}
                </motion.g>
            </motion.g>

            {!isPro && (
                <image
                    href={config.logoUrl}
                    x={9}
                    y={24}
                    width={22}
                    height={11}
                    preserveAspectRatio="xMidYMid meet"
                />
            )}

            <path
                d="M 14 29 Q 20 33 26 29"
                fill="none"
                stroke={isPro ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.35)'}
                strokeWidth={1.2}
                strokeLinecap="round"
            />
        </motion.svg>
    );
}

/** Sello flotante (SVG/PNG) en esquina de la pantalla LED — ultraligero: una sola `<img>` o `<image>`. */
function WaxSealFloat({ href }: { href: string }) {
    return (
        <motion.div
            className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-11 w-11 sm:h-12 sm:w-12"
            initial={false}
            animate={{ y: [0, -4, 0, -2, 0], rotate: [0, -2, 0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
                filter:
                    'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(201,162,39,0.35))',
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={href} alt="" className="h-full w-full object-contain" loading="lazy" decoding="async" />
        </motion.div>
    );
}

export type PuntitoIAProps = {
    type?: LegalFlowType;
    celebrate?: boolean;
    message?: string;
    sponsorConfig?: SponsorConfig | null;
    /** Animación idle (parpadeo + mirada) cuando hay avatar patrocinado */
    idle?: boolean;
    /** Ojos en modo “thinking” (usado durante procesamiento) */
    thinking?: boolean;
    /** Ojos en modo “X” (usado para errores/duplicados) */
    xEyes?: boolean;
    className?: string;
};

export function PuntitoIA({
    type,
    celebrate = false,
    message,
    sponsorConfig,
    idle: idleProp,
    thinking = false,
    xEyes = false,
    className = '',
}: PuntitoIAProps) {
    const uid = useId().replace(/:/g, '');
    const gradientId = `bp-body-${uid}`;
    const bubbleText = resolveBubbleText(message, type);
    const isPro = sponsorConfig?.premiumPartner === 'buchanans_pro';
    const accent = isPro ? BUCHANANS_PRO.ledEye : sponsorConfig?.eyeColor ?? '#CCFF00';
    const idle = idleProp !== false && !!sponsorConfig;

    const ledFrameStyle = useMemo(() => {
        if (!isPro) {
            return {
                borderColor: `${accent}66`,
                backgroundColor: 'rgba(0,0,0,0.82)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            } as const;
        }
        return {
            borderColor: BUCHANANS_PRO.gold,
            backgroundColor: 'rgba(0, 20, 18, 0.88)',
            boxShadow: `
              0 0 0 1px ${BUCHANANS_PRO.goldSoft},
              0 0 0 2px rgba(0, 77, 64, 0.5),
              0 0 24px rgba(0, 105, 92, 0.55),
              0 0 48px rgba(0, 77, 64, 0.35),
              inset 0 1px 0 rgba(201, 162, 39, 0.25),
              inset 0 -12px 28px rgba(0, 0, 0, 0.45)
            `
                .replace(/\s+/g, ' ')
                .trim(),
        } as const;
    }, [isPro, accent]);

    return (
        <div
            className={`pointer-events-none absolute right-2 top-2 z-30 flex max-w-[min(220px,55vw)] flex-col items-end gap-1 sm:right-3 sm:top-3 ${className}`}
        >
            <AnimatePresence>
                {celebrate && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="mb-1 flex flex-wrap justify-end gap-0.5"
                    >
                        {Array.from({ length: 10 }).map((_, i) => (
                            <motion.span
                                key={i}
                                className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                                style={{ backgroundColor: accent, color: accent }}
                                initial={{ opacity: 1, y: 0, x: 0 }}
                                animate={{
                                    opacity: 0,
                                    y: -28 - Math.random() * 18,
                                    x: (i - 5) * 10 + (Math.random() * 8 - 4),
                                }}
                                transition={{ duration: 0.75, ease: 'easeOut' }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className={`relative flex items-center gap-2 rounded-2xl border-2 px-2.5 py-2 backdrop-blur-md ${
                    isPro ? 'ring-1 ring-amber-500/30 pl-11 sm:pl-12' : ''
                }`}
                style={ledFrameStyle}
                animate={
                    celebrate
                        ? { scale: [1, 1.06, 1], rotate: [0, -2, 2, 0] }
                        : isPro && idle
                          ? { scale: [1, 1.012, 1] }
                          : { scale: 1 }
                }
                transition={
                    celebrate
                        ? { duration: 0.45 }
                        : isPro && idle
                          ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
                          : { duration: 0.2 }
                }
            >
                {isPro && sponsorConfig.logoUrl ? <WaxSealFloat href={sponsorConfig.logoUrl} /> : null}

                {sponsorConfig ? (
                    <motion.div
                        className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-black/30"
                        style={{ borderColor: accent, boxShadow: `0 0 0 0 ${accent}80` }}
                        animate={
                            celebrate
                                ? { boxShadow: [`0 0 0 0 ${accent}80`, `0 0 0 12px ${accent}00`] }
                                : { boxShadow: '0 0 0 0 transparent' }
                        }
                        transition={{ duration: 0.6, repeat: celebrate ? 2 : 0 }}
                    >
                        <PuntitoSponsorAvatar
                            config={sponsorConfig}
                            idle={idle}
                            celebrate={celebrate}
                            thinking={thinking}
                            xEyes={xEyes}
                            gradientId={gradientId}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#ccff00] bg-[#ccff00]/15"
                        animate={
                            celebrate
                                ? { boxShadow: ['0 0 0 0 rgba(204,255,0,0.5)', '0 0 0 12px rgba(204,255,0,0)'] }
                                : {}
                        }
                        transition={{ duration: 0.6, repeat: celebrate ? 2 : 0 }}
                    >
                        <Sparkles className="h-4 w-4 text-[#ccff00]" strokeWidth={2.2} />
                    </motion.div>
                )}

                <p className="pointer-events-auto relative z-10 pl-1 text-left text-[10px] font-semibold leading-snug tracking-tight text-zinc-200 sm:text-[11px]">
                    {bubbleText}
                </p>
            </motion.div>
        </div>
    );
}
