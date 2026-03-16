'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Zap } from 'lucide-react';

export type PlayerCardPlayer = {
  avatar_url?: string;
  full_name?: string;
  category?: string;
  ranking_points?: number;
  titles_won?: number;
  total_matches?: number;
};

export function PlayerCard({ player }: { player: PlayerCardPlayer }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative w-80 h-[450px] bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group"
    >
      {/* Fondo con resplandor neón */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#ccff00]/20 to-transparent opacity-50" />

      {/* Imagen del Jugador */}
      <div className="h-2/3 overflow-hidden relative">
        <img
          src={player.avatar_url || 'https://via.placeholder.com/400'}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          alt={player.full_name ?? 'Jugador'}
        />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
      </div>

      {/* Contenido */}
      <div className="absolute bottom-0 w-full p-6 text-center">
        <div className="bg-[#ccff00] text-black text-[10px] font-black px-3 py-1 rounded-full inline-block mb-2 uppercase italic tracking-tighter">
          {player.category ?? 'Sin Categoría'}
        </div>
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
          {player.full_name ?? '—'}
        </h2>

        {/* Stats Rápidas */}
        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
          <div className="flex flex-col items-center">
            <Zap size={14} className="text-[#ccff00] mb-1" />
            <span className="text-[10px] text-white/40 uppercase">Puntos</span>
            <span className="text-sm font-bold text-white">{player.ranking_points ?? 0}</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/10">
            <Trophy size={14} className="text-[#ccff00] mb-1" />
            <span className="text-[10px] text-white/40 uppercase">Títulos</span>
            <span className="text-sm font-bold text-white">{player.titles_won ?? 0}</span>
          </div>
          <div className="flex flex-col items-center">
            <Users size={14} className="text-[#ccff00] mb-1" />
            <span className="text-[10px] text-white/40 uppercase">Partidos</span>
            <span className="text-sm font-bold text-white">{player.total_matches ?? 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
