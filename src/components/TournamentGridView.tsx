'use client';

import React from 'react';
import { Lock, CheckCircle2, UserPlus } from 'lucide-react';

export interface Team {
  id: string;
  player1_name: string;
  player2_name: string;
  is_placeholder: boolean;
  player2_accepted: boolean;
}

export interface Group {
  name: string;
  teams: Team[];
}

export function TournamentGridView({ groups }: { groups: Group[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-[#0a0a0a]">
      {groups.map((group) => (
        <div key={group.name} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          {/* Encabezado del Grupo */}
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
            <h3 className="text-[#ccff00] font-black italic uppercase tracking-tighter">Grupo {group.name}</h3>
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Round Robin</span>
          </div>

          {/* Lista de Parejas */}
          <div className="space-y-3">
            {group.teams.map((team, index) => (
              <div
                key={team.id || index}
                className={`relative overflow-hidden p-3 rounded-xl border-2 transition-all duration-300 ${
                  team.is_placeholder
                    ? 'border-dashed border-white/10 bg-transparent hover:border-white/30'
                    : 'border-solid border-[#ccff00]/50 bg-[#ccff00]/5 backdrop-blur-md shadow-[0_0_25px_rgba(204,255,0,0.35)]'
                }`}
              >
                {team.is_placeholder ? (
                  /* VISTA PLACEHOLDER */
                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-2 rounded-lg border border-dashed border-white/10">
                      <UserPlus size={16} className="text-white/40" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/70 uppercase tracking-tighter">Cupo disponible</p>
                      <p className="text-[10px] text-white/30 italic">Toca para inscribir una pareja…</p>
                    </div>
                  </div>
                ) : (
                  /* VISTA REAL */
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                        <p className="text-xs font-bold text-white uppercase tracking-tight">
                          {team.player1_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${team.player2_accepted ? 'bg-[#ccff00]' : 'bg-white/20'}`} />
                        <p
                          className={`text-xs uppercase ${
                            team.player2_accepted ? 'text-white font-bold' : 'opacity-30 italic font-medium'
                          }`}
                        >
                          {team.player2_name}
                          {!team.player2_accepted && <span className="italic"> (Pendiente)</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#ccff00]">
                          Confirmado
                        </span>
                      </span>
                      {team.player2_accepted && (
                        <CheckCircle2 size={16} className="text-[#ccff00] opacity-90" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
