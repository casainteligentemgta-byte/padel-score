'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Loader2, Mail, MessageCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { createClient } from '@/lib/supabase/client';
import { driveDossierUrls } from '@/lib/driveDossier';
import { DossierViewer } from '@/components/sales/DossierViewer';
import { SalesManualPuntito } from '@/components/sales/SalesManualPuntito';

const PHASES = [
  {
    id: '1',
    badge: 'Fase 1',
    title: 'Descubrimiento',
    summary: 'Diagnóstico del club y mapa de decisión',
    bullets: [
      'Identifica presidente, gerencia y responsable de pistas: quién sufre hoy el caos de inscripciones y publicidad.',
      'Relevá flujo real: WhatsApp suelto, planillas, marcador manual y rotación de sponsors sin métricas.',
      'Objetivo de la reunión: que verbalicen el dolor en 2 frases (“perdemos tiempo” / “no monetizamos pantallas”).',
    ],
  },
  {
    id: '2',
    badge: 'Fase 2',
    title: 'Propuesta de valor Smart Padel',
    summary: 'De operación amateur a experiencia PRO',
    bullets: [
      'Hub unificado: jugadores, códigos de pareja, ranking y reputación visible para el club.',
      'Torneos y pizarra TV: menos fricción operativa, más espectáculo y control desde el móvil del organizador.',
      'Publicidad en circuito cerrado: playlists por sede/cancha, heartbeat de pantallas y reporting para sponsors.',
    ],
  },
  {
    id: '3',
    badge: 'Fase 3',
    title: 'Pilotaje y cierre',
    summary: 'Prueba táctica y contrato emocional',
    bullets: [
      'Propone un piloto acotado: un torneo + una sede con 2 pantallas activas y plantilla de patrocinio.',
      'Compromisos claros: quién sube medios, quién valida pagos y fecha de revisión de KPIs (inscripciones, ocupación).',
      'Cierra con siguiente paso concreto (fecha de kickoff + contacto de soporte Smart Padel).',
    ],
  },
  {
    id: '4',
    badge: 'Fase 4',
    title: 'Expansión y ingresos recurrentes',
    summary: 'Escala y marca blanca del club',
    bullets: [
      'Segunda sede o multi-complejo: replica venue/cancha y estandariza la experiencia del jugador.',
      'Broadcasting Pro y packs premium: storytelling del club en streamings y activaciones con marcas locales.',
      'Modelo de retainer: auditoría trimestral de contenidos, nuevas piezas creativas y training a staff del club.',
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 32 },
  },
};

export default function SalesManualPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [folderId, setFolderId] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await dataService.getAdminSettings();
        if (!alive) return;
        setFolderId(s?.publicidadDossierDriveId?.trim() || null);
      } finally {
        if (alive) setSettingsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const dossierOpenUrl = useMemo(() => {
    const id = folderId?.trim();
    if (!id) return null;
    return driveDossierUrls(id).open;
  }, [folderId]);

  const whatsappShareHref = useMemo(() => {
    if (!dossierOpenUrl) return null;
    const text = `Hola! Chequea el futuro de tu club con Smart Padel: ${dossierOpenUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [dossierOpenUrl]);

  const openWhatsAppShare = useCallback(() => {
    if (!whatsappShareHref) return;
    window.open(whatsappShareHref, '_blank', 'noopener,noreferrer');
  }, [whatsappShareHref]);

  const sendDossierEmail = useCallback(async () => {
    const to = clientEmail.trim().toLowerCase();
    if (!to) {
      setSendMsg('Indica el email del cliente.');
      return;
    }
    setSending(true);
    setSendMsg(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setSendMsg('Sesión no válida. Vuelve a iniciar sesión.');
        return;
      }
      const res = await fetch('/api/admin/send-dossier-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          to,
          recipientName: clientName.trim() || 'Hola',
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendMsg(j?.error || 'No se pudo enviar el correo.');
        return;
      }
      setSendMsg('Correo enviado correctamente.');
    } catch {
      setSendMsg('Error de red al enviar.');
    } finally {
      setSending(false);
    }
  }, [clientEmail, clientName]);

  if (authLoading || !isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#030303]">
        <Loader2 className="h-9 w-9 animate-spin text-[#ccff00]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-[#030303] text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(204,255,0,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(204,255,0,0.06), transparent)',
        }}
      />
      <SalesManualPuntito />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-28 pt-6 sm:px-6 sm:pb-32 sm:pt-8 md:px-8 md:pt-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/admin/publicidad"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white/90 transition hover:border-[#ccff00]/35 hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4 text-[#ccff00]" />
            Publicidad
          </Link>
        </div>

        <header className="mb-8 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#ccff00]/40 bg-[#ccff00]/10 shadow-[0_0_40px_rgba(204,255,0,0.12)]">
              <BookOpen className="h-7 w-7 text-[#ccff00]" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ccff00]/90">Executive · Admin</p>
              <h1 className="text-balance text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">
                Manual de operación y negocio
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                Guía interna para reuniones con clubes: contexto comercial, narrativa Smart Padel y cierre. Optimizado
                para tablet en sala de juntas.
              </p>
            </div>
          </div>
        </header>

        <section className="mb-10 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl backdrop-blur-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#ccff00]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Acción rápida</h2>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email del cliente</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="director@club.com"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-sm text-white outline-none ring-0 focus:border-[#ccff00]/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nombre (opcional)</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="María / Club Los Pro"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ccff00]/50"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={sending || !dossierOpenUrl}
                onClick={() => void sendDossierEmail()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ccff00] px-5 py-3 text-sm font-black uppercase italic tracking-wide text-black shadow-[0_0_24px_rgba(204,255,0,0.25)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Enviar dossier por email
              </button>
              <button
                type="button"
                disabled={!whatsappShareHref}
                onClick={openWhatsAppShare}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-black uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-40"
              >
                <MessageCircle className="h-4 w-4" />
                Compartir por WhatsApp
              </button>
            </div>
          </div>
          {sendMsg && (
            <p className={`mt-3 text-xs font-medium ${sendMsg.includes('correctamente') ? 'text-emerald-400' : 'text-amber-300'}`}>
              {sendMsg}
            </p>
          )}
          {!dossierOpenUrl && !settingsLoading && (
            <p className="mt-3 text-xs text-amber-300/90">Define el dossier en Publicidad para habilitar envío y WhatsApp.</p>
          )}
        </section>

        <section className="mb-12 rounded-2xl border border-[#ccff00]/20 bg-gradient-to-b from-[#ccff00]/[0.06] to-black/50 p-4 sm:p-6">
          {settingsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#ccff00]" />
            </div>
          ) : (
            <DossierViewer folderId={folderId} />
          )}
        </section>

        <motion.div
          className="space-y-5 pb-8"
          variants={container}
          initial="hidden"
          animate="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          {PHASES.map((phase) => (
            <motion.article
              key={phase.id}
              variants={item}
              className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-lg sm:p-7"
            >
              <div className="mb-3 flex flex-wrap items-baseline gap-2">
                <span className="rounded-full border border-[#ccff00]/35 bg-[#ccff00]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#ccff00]">
                  {phase.badge}
                </span>
                <h2 className="text-lg font-black uppercase italic tracking-tight text-white sm:text-xl">{phase.title}</h2>
              </div>
              <p className="mb-4 text-sm font-semibold text-zinc-300">{phase.summary}</p>
              <ul className="space-y-2.5 border-t border-white/5 pt-4">
                {phase.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ccff00]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
