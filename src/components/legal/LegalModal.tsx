'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { SMART_CONSENT_LEGAL_VERSION } from '@/lib/legal/smartConsent';
import { LegalTermsInscriptionBody } from '@/components/legal/LegalTermsBodies';

export type LegalModalProps = {
  open: boolean;
  onClose: () => void;
  onAccept: () => Promise<void> | void;
  loading?: boolean;
  title?: string;
  /** 'save' = botón Aceptar que persiste. 'dismiss' = solo Cerrar; el envío se hace con Inscribirme. */
  footerMode?: 'save' | 'dismiss';
};

const LEGAL_TEXT = {
  title: 'Términos, privacidad e inscripción a torneos (único contrato)',
  intro:
    'Debes leer y aceptar, en un solo acto, (1) el contrato de adhesión y exoneración de responsabilidad de la plataforma, y (2) los términos de inscripción a torneos (incluida la veracidad de comprobantes y reglas de pago y conducta. Al aceptar, vinculamos tu cuenta y tus futuras inscripciones a esta versión, sin requerir otra firma o foto para cada torneo, salvo que se publique un cambio y debas aceptar la nueva versión.',
  sections: [
    {
      h: '1. Adhesión y participación',
      p: 'Este documento constituye un contrato de adhesión aplicable a tu participación en torneos y actividades gestionadas por Smart Padel. La aceptación es voluntaria y necesaria para el acceso a funciones del sistema, incluidos ranking y participación.',
    },
    {
      h: '2. Condiciones físicas y exoneración',
      p: 'Declara el participante estar en condiciones físicas óptimas para la práctica de alta competencia. El participante libera irrevocablemente a Smart Padel, a sus organizadores y patrocinadores de toda responsabilidad por lesiones, accidentes o percances médicos ocurridos durante la competencia o en las instalaciones.',
    },
    {
      h: '3. Protección de datos personales',
      p: 'Al aceptar, autorizas el tratamiento de tus datos personales con la finalidad de gestionar tu participación, comunicarte información de torneos y administrarte dentro de la plataforma. No se venderán tus datos a terceros.',
    },
    {
      h: '4. Imagen y material audiovisual',
      p: 'Autorizas el uso de tu nombre e imagen (fotos/videos) con fines promocionales y de transmisión asociada a torneos de Smart Padel, de acuerdo con la Política de Privacidad publicada en la plataforma.',
    },
    {
      h: '5. Conducta deportiva',
      p: 'Te comprometes a mantener un espíritu de Fair Play. Conductas antideportivas o incumplimientos pueden implicar la suspensión de acceso a funciones o la expulsión del evento.',
    },
    {
      h: '6. Versión y vigencia',
      p: 'La versión vigente de este contrato corresponde a la publicada en Smart Padel. Si existen actualizaciones, te será requerida una nueva aceptación.',
    },
  ],
};

export default function LegalModal({
  open,
  onClose,
  onAccept,
  loading = false,
  title,
  footerMode = 'save',
}: LegalModalProps) {
  const [localLoading, setLocalLoading] = useState(false);

  const effectiveLoading = loading || localLoading;

  const shownTitle = useMemo(() => title || LEGAL_TEXT.title, [title]);

  const handleAccept = async () => {
    if (effectiveLoading) return;
    try {
      setLocalLoading(true);
      await onAccept();
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <motion.button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-[10000] w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
              <div className="min-w-0">
                <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                  {shownTitle}
                </h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Versión: {SMART_CONSENT_LEGAL_VERSION}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <X className="h-5 w-5 text-zinc-300" />
              </button>
            </div>

            <div className="max-h-[min(70vh,640px)] overflow-y-auto px-5 py-4">
              <p className="text-sm leading-relaxed text-zinc-400 [text-wrap:pretty]">
                {LEGAL_TEXT.intro}
              </p>

              <div className="mt-5 space-y-6">
                {LEGAL_TEXT.sections.map((s, idx) => (
                  <section key={idx}>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#ccff00]">
                      {s.h}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400 [text-wrap:pretty]">
                      {s.p}
                    </p>
                  </section>
                ))}

                <h4 className="mt-8 text-sm font-black uppercase tracking-tight text-white">
                  Inscripción a torneos
                </h4>
                <p className="mt-1 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  Parte integrante del mismo acuerdo (misma versión)
                </p>
                <div className="mt-3 max-w-none text-sm leading-relaxed text-zinc-400 [text-wrap:pretty] text-justify">
                  <LegalTermsInscriptionBody />
                </div>
              </div>
              {footerMode === 'save' && (
                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Al aceptar, se registra tu consentimiento en la tabla <span className="text-zinc-300">profiles</span>.
                  </p>
                  <button
                    type="button"
                    disabled={effectiveLoading}
                    onClick={() => void handleAccept()}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ccff00] px-5 py-3 text-sm font-black uppercase italic tracking-wide text-black shadow-[0_0_24px_rgba(204,255,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {effectiveLoading ? (
                      'Guardando…'
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Aceptar
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {footerMode === 'dismiss' && (
              <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Cierra y pulsa <span className="text-[#ccff00] font-bold">Inscribirme</span> abajo para confirmar tu
                    inscripción y registrar el consentimiento.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-white/10 sm:w-auto"
                  >
                    Cerrar
                  </button>
                </>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

