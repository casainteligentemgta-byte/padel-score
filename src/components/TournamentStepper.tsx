'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, RefreshCw, Rocket } from 'lucide-react';
import { generateTournamentStructure } from '@/lib/tournamentService';
import { dataService } from '@/lib/dataService';

export type TournamentStepperFormData = {
  /** Si ya existe el torneo, pasar su ID. Si no, se creará con el payload. */
  tournamentId?: string;
  /** Cupos por categoría (key → cantidad máxima). */
  maxTeamsByCategory: Record<string, number>;
  /** Payload mínimo para crear torneo (cuando tournamentId no viene) */
  name?: string;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  complexName?: string;
  totalCourts?: number;
  courtNames?: string[];
  inscriptionCategories?: Array<{ key: string; name?: string; price?: number; maxSlots?: number }>;
  [key: string]: unknown;
};

type TournamentStepperProps = {
  formData: TournamentStepperFormData;
  userId: string;
  onSuccess?: (result: { tournamentId: string; inscriptionsCreated: number; matchesCreated: number }) => void;
  onError?: (error: Error) => void;
  /** Ruta a la que redirigir tras éxito (ej. `/tournaments/${id}`). Si no se pasa, no redirige. */
  redirectTo?: string | ((tournamentId: string) => string);
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

export function TournamentStepper({
  formData,
  userId,
  onSuccess,
  onError,
  redirectTo,
}: TournamentStepperProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [launching, setLaunching] = useState(false);
  const [activatePlaceholders, setActivatePlaceholders] = useState(true);

  const allCategoryKeys = useMemo(
    () => Object.keys(formData.maxTeamsByCategory || {}),
    [formData.maxTeamsByCategory]
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(allCategoryKeys);

  const canGoNext =
    currentStep === 1 ||
    (currentStep === 2 && selectedCategories.length > 0) ||
    (currentStep === 3 && activatePlaceholders);

  const goToStep = (nextStep: number) => {
    if (nextStep < 1 || nextStep > 3) return;
    setDirection(nextStep > currentStep ? 1 : -1);
    setCurrentStep(nextStep);
  };

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleLaunch = async () => {
    if (!activatePlaceholders) {
      onError?.(new Error('Activa los placeholders para generar los cupos automáticos.'));
      return;
    }

    const baseMax = formData.maxTeamsByCategory || {};
    const filteredMax: Record<string, number> = {};
    for (const key of selectedCategories) {
      const raw = baseMax[key] ?? formData.inscriptionCategories?.find((c) => c.key === key)?.maxSlots ?? 8;
      filteredMax[key] = Math.max(2, Math.floor(Number(raw) || 0));
    }

    if (Object.keys(filteredMax).length === 0) {
      onError?.(new Error('Selecciona al menos una categoría.'));
      return;
    }

    setLaunching(true);
    try {
      let tournamentId = formData.tournamentId;

      if (!tournamentId) {
        const { maxTeamsByCategory: _max, tournamentId: _tid, ...rest } = formData;
        const payload = {
          name: formData.name ?? 'Torneo',
          startDate: formData.startDate ?? new Date().toISOString().split('T')[0],
          startTime: formData.startTime ?? '08:00',
          endTime: formData.endTime ?? '22:00',
          complexName: formData.complexName ?? '',
          totalCourts: formData.totalCourts ?? 1,
          courtNames: formData.courtNames ?? [],
          inscriptionCategories: formData.inscriptionCategories ?? [],
          registrationStatus: 'open',
          ...rest,
        };
        const { id } = await dataService.createTournament(payload, userId);
        tournamentId = id ?? '';
      }

      if (!tournamentId) {
        onError?.(new Error('No se pudo obtener el ID del torneo.'));
        return;
      }

      const result = await generateTournamentStructure(tournamentId, filteredMax);
      onSuccess?.({ tournamentId, ...result });

      if (redirectTo) {
        const path = typeof redirectTo === 'function' ? redirectTo(tournamentId) : redirectTo;
        router.push(path);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
    } finally {
      setLaunching(false);
    }
  };

  const stepLabel = (step: number) => {
    if (step === 1) return 'Configurar resumen';
    if (step === 2) return 'Categorías y cupos';
    return 'Placeholders y lanzamiento';
  };

  const categories = formData.inscriptionCategories || [];

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl bg-[#050505] border border-white/10 p-4 sm:p-5 shadow-[0_0_40px_rgba(0,0,0,0.7)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-32 -right-10 w-64 h-64 bg-padel-primary/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-10 w-72 h-72 bg-violet-500/20 blur-3xl rounded-full" />
      </div>

      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              Lanzador automático
            </p>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
              Torneo con Placeholders
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/60">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => goToStep(step)}
                className={`relative w-6 h-6 rounded-full border text-[9px] font-black flex items-center justify-center transition-all ${
                  currentStep === step
                    ? 'bg-padel-primary text-black border-padel-primary shadow-[0_0_15px_rgba(204,255,0,0.6)]'
                    : 'border-white/20 text-white/60 hover:border-padel-primary/70 hover:text-white'
                }`}
              >
                {currentStep > step ? <Check className="w-3 h-3" /> : step}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-white/50 font-medium">{stepLabel(currentStep)}</p>

        <div className="relative min-h-[160px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              {currentStep === 1 && (
                <div className="h-full flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-white/80">
                      Vamos a crear{' '}
                      <span className="font-bold text-padel-primary">
                        inscripciones y partidos placeholder
                      </span>{' '}
                      para que el fixture y el cuadro se vean completos desde el primer minuto.
                    </p>
                    <ul className="text-[11px] text-white/60 space-y-1.5">
                      <li>• Genera pares ficticios por categoría (Pareja 1, Pareja 2, ...).</li>
                      <li>• Arma la fase de grupos (Round Robin) automáticamente.</li>
                      <li>• Deja todo listo para reemplazar un placeholder por una pareja real.</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/50">
                    <span>
                      Categorías detectadas:{' '}
                      <span className="font-semibold text-white/80">
                        {allCategoryKeys.length || '0'}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="h-full flex flex-col gap-3">
                  <p className="text-[11px] text-white/70">
                    Selecciona las categorías donde quieres habilitar{' '}
                    <span className="font-semibold text-padel-primary">cupos automáticos</span>.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {categories.map((cat) => {
                      const key = cat.key;
                      const isActive = selectedCategories.includes(key);
                      const max =
                        formData.maxTeamsByCategory?.[key] ??
                        cat.maxSlots ??
                        8;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleCategory(key)}
                          className={`relative flex flex-col items-start justify-between p-2.5 rounded-2xl border text-left transition-all text-[11px] ${
                            isActive
                              ? 'border-padel-primary bg-padel-primary/10 shadow-[0_0_20px_rgba(204,255,0,0.25)]'
                              : 'border-white/10 bg-white/5 hover:border-padel-primary/60'
                          }`}
                        >
                          <span className="font-black uppercase tracking-tight text-[10px] text-white">
                            {cat.name || key}
                          </span>
                          <div className="flex items-center justify-between w-full mt-1 text-[10px] text-white/60">
                            <span>{max} parejas máx.</span>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 text-padel-primary font-semibold">
                                <Check className="w-3 h-3" /> ON
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {categories.length === 0 && (
                      <div className="col-span-full text-[11px] text-orange-300/80 bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2">
                        No se encontraron categorías de inscripción. Revisa el paso anterior del
                        formulario.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="h-full flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/40 border border-padel-primary/40 px-3 py-2.5">
                      <div>
                        <p className="text-[11px] font-semibold text-white">
                          Activar Placeholders
                        </p>
                        <p className="text-[10px] text-white/60">
                          Crea parejas fantasma y genera todos los partidos automáticamente.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivatePlaceholders((v) => !v)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-all ${
                          activatePlaceholders
                            ? 'bg-padel-primary border-padel-primary shadow-[0_0_18px_rgba(204,255,0,0.7)]'
                            : 'bg-white/5 border-white/20'
                        }`}
                        aria-pressed={activatePlaceholders}
                      >
                        <span
                          className={`inline-block h-5 w-5 rounded-full bg-black shadow transition-transform ${
                            activatePlaceholders ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[10px] text-white/60">
                      Cuando confirmes, se insertarán inscripciones{' '}
                      <span className="font-semibold text-padel-primary">placeholder</span> y se
                      generará el fixture de grupos en Supabase.
                    </p>
                  </div>

                  {launching && (
                    <div className="flex items-center gap-2 text-[11px] text-padel-primary">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creando cupos y partidos en la base de datos...</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
          <div className="flex items-center gap-1 text-[10px] text-white/50">
            <span>Paso {currentStep} de 3</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => goToStep(currentStep - 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/15 text-[10px] text-white/70 hover:border-white/40 hover:text-white transition-all"
              >
                <ChevronLeft className="w-3 h-3" />
                Atrás
              </button>
            )}

            {currentStep < 3 && (
              <button
                type="button"
                onClick={() => goToStep(currentStep + 1)}
                disabled={!canGoNext}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-padel-primary/70 bg-padel-primary/10 text-[10px] font-semibold text-padel-primary hover:bg-padel-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
                <ChevronRight className="w-3 h-3" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={handleLaunch}
                disabled={launching || !activatePlaceholders || selectedCategories.length === 0}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-padel-primary text-black text-[10px] font-black uppercase tracking-[0.16em] shadow-[0_0_22px_rgba(204,255,0,0.55)] hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {launching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Lanzando...
                  </>
                ) : (
                  <>
                    <Rocket className="w-3.5 h-3.5" />
                    Lanzar torneo
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
