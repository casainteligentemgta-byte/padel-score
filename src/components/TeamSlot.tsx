'use client';

type Team = {
  is_placeholder?: boolean;
  player1_name?: string;
  player2_name?: string;
  player2_accepted?: boolean;
};

export function TeamSlot({ team }: { team: Team }) {
  if (team.is_placeholder) {
    return (
      <div className="border-2 border-dashed border-white/10 p-3 rounded-xl opacity-40">
        <span className="text-sm italic text-gray-400">Cupo Disponible</span>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-[#ccff00]/30 p-3 rounded-xl">
      <p className="font-bold text-white">{team.player1_name}</p>
      <p className={`text-sm ${team.player2_accepted ? 'text-white' : 'opacity-30 italic'}`}>
        {team.player2_name || 'Invitado...'}
        {!team.player2_accepted && <span className="italic"> (Pendiente)</span>}
      </p>
    </div>
  );
}
