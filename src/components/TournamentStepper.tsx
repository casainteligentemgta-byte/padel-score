'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Rocket } from 'lucide-react';
import { initializeTournamentWithPlaceholders } from '@/lib/tournamentService';
import { dataService } from '@/lib/dataService';

export type TournamentStepperFormData = {
  /** Si ya existe el torneo, pasar su ID. Si no, se creará con el payload. */
  tournamentId?: string;
  /** Requerido para initializeTournamentWithPlaceholders: cupos por categoría */
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

export function TournamentStepper({
  formData,
  userId,
  onSuccess,
  onError,
  redirectTo,
}: TournamentStepperProps) {
  const router = useRouter();
  const [launching, setLaunching] = useState(false);

  const handleLaunch = async () => {
    const maxTeamsByCategory = formData.maxTeamsByCategory || {};
    if (Object.keys(maxTeamsByCategory).length === 0) {
      onError?.(new Error('Indica al menos una categoría con cupos (maxTeamsByCategory).'));
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
        tournamentId = id;
      }

      const result = await initializeTournamentWithPlaceholders(tournamentId, maxTeamsByCategory);

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

  return (
    <div className="flex flex-col items-center gap-4">
      {launching && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-6 w-full max-w-md">
          <RefreshCw className="w-10 h-10 text-padel-primary animate-spin" aria-hidden />
          <p className="text-sm font-medium text-white/90">Creando cupos y grupos en la base de datos...</p>
          <p className="text-xs text-white/50">Inscripciones placeholder y partidos Round Robin</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleLaunch}
        disabled={launching || Object.keys(formData.maxTeamsByCategory || {}).length === 0}
        className="flex items-center justify-center gap-2 bg-padel-primary text-black px-6 py-3 rounded-xl font-black text-sm uppercase italic tracking-tight transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95"
      >
        {launching ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Rocket className="w-5 h-5" />
            Lanzar Torneo
          </>
        )}
      </button>
    </div>
  );
}
