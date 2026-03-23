import { MatchStatus } from '@/types/tournament';

export const toMs = (v: any): number => {
    if (!v) return 0;
    if (v?.toDate) return v.toDate().getTime();
    if (typeof v === 'string') return new Date(v).getTime();
    return new Date(v).getTime();
};

export const formatHHMM = (v: any) => {
    if (!v) return 'TBD';
    const d = v?.toDate ? v.toDate() : new Date(v);
    if (isNaN(d.getTime())) return 'TBD';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const toMinute = (v: any): number => Math.floor(toMs(v) / 60000);

/**
 * Formatea un nombre para mostrar "Nombre Inicial." (e.g. Juan Perez -> Juan P.)
 */
export const formatDisplayName = (name: string): string => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return name;

    // Si la segunda parte es un número (ej. Jugador 13), no abreviar
    if (/^\d+$/.test(parts[1])) return name;

    // Si es "Jugador X", no abreviar
    if (parts[0].toLowerCase() === 'jugador') return name;

    // Tomar primer nombre y la inicial del primer apellido/segundo nombre
    return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
};


/**
 * Resuelve los nombres de jugadores de un equipo.
 */
export const resolveTeamNames = (team: any, teamName?: string): [string, string] => {
    if (!team) return [teamName || '?', ''];
    if (team.isTBD || team.teamLabel) {
        return [team.teamLabel || formatDisplayName(team.p1?.name) || teamName || '?', ''];
    }

    if (typeof team.full === 'string' && team.full.trim()) {
        const parts = team.full.split(/\s*\/\s*/).map((s: string) => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
            return [formatDisplayName(parts[0]) || '?', formatDisplayName(parts[1])];
        }
        if (parts.length === 1) {
            return [formatDisplayName(parts[0]) || '?', ''];
        }
    }

    const p1 = (team.p1Name || team.p1?.name || '').trim();
    const p2 = (team.p2Name || team.p2?.name || '').trim();

    if (p1 || p2) {
        return [
            formatDisplayName(p1) || '?',
            formatDisplayName(p2)
        ];
    }

    if (team.name) {
        const parts = team.name.split('/');
        return [
            formatDisplayName((parts[0] || '?').trim()),
            formatDisplayName((parts[1] || '').trim())
        ];
    }

    if (teamName) {
        const parts = teamName.split('/');
        return [
            formatDisplayName((parts[0] || '?').trim()),
            formatDisplayName((parts[1] || '').trim())
        ];
    }

    return ['?', ''];
};

// Mapeo legible de categorías
const CAT_LABEL_MAP: Record<string, string> = {
    MAS_40: '+40',
    FEM_40: '+40',
    MIX_40: '+40',
    MAS_45: '+45',
    MAS_50: '+50',
    SUMA_7: 'Suma 7',
    SUMA_8: 'Suma 8',
    SUMA_9: 'Suma 9',
    SUMA_10: 'Suma 10',
    SUMA_11: 'Suma 11',
    PRIMERA: '1ª Cat.',
    SEGUNDA: '2ª Cat.',
    TERCERA: '3ª Cat.',
    CUARTA: '4ª Cat.',
    QUINTA: '5ª Cat.',
    SEXTA: '6ª Cat.',
    SEPTIMA: '7ª Cat.',
};

export const formatCategory = (cat?: string): string => {
    if (!cat) return '';
    return CAT_LABEL_MAP[cat] ?? cat.replace(/_/g, ' ');
};

export const formatGender = (g?: string): string => {
    if (!g) return '';
    if (g === 'MALE') return 'Masculino';
    if (g === 'FEMALE') return 'Femenino';
    if (g === 'MIXED') return 'Mixto';
    return g;
};

export const STATUS_COLORS: Record<string, string> = {
    [MatchStatus.LIVE]: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20',
    [MatchStatus.FINISHED]: 'bg-white/[0.02] border-white/10 text-gray-500 grayscale-[0.5] opacity-80',
    [MatchStatus.PENDING]: 'bg-yellow-400/5 border-yellow-400/30 text-yellow-200/80',
};

export const PENDING_NEXT_COLORS = 'bg-yellow-400/10 border-yellow-400/40 text-yellow-200 shadow-[0_4px_20px_rgba(250,204,21,0.05)]';
export const PENDING_LATER_COLORS = 'bg-white/[0.03] border-white/10 text-gray-400';

export const CAT_COLORS: Record<string, string> = {
    MALE: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    FEMALE: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    MIXED: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

export const TABS = [
    { label: 'Todos', value: 'all' },
    { label: 'Grupos', value: 'groups' },
    { label: 'Por Comenzar', value: MatchStatus.PENDING },
    { label: 'En Vivo', value: MatchStatus.LIVE },
    { label: 'Finalizados', value: MatchStatus.FINISHED },
    { label: 'Reglas', value: 'rules' },
];

export const KNOWN_COMPLEXES: Record<string, number> = {
    'El Bodeguero': 3,
    'Food Kart': 3,
    'Hotel Tibisay': 2,
    'Tibisay Padel': 2,
    'Padel 360': 6
};

export function calcGroupStanding(teamId: string, teamNum: number, matches: any[]) {
    let PJ = 0, PG = 0, PP = 0, JF = 0, JC = 0;
    matches.filter(m =>
        m.status === MatchStatus.FINISHED &&
        m.stage === 'GROUP_STAGE' &&
        (m.team1Index === teamNum || m.team2Index === teamNum)
    ).forEach(m => {
        const side = m.team1Index === teamNum ? 't1' : 't2';
        const opp = side === 't1' ? 't2' : 't1';
        PJ++;
        const gWon = m.games?.[side] ?? 0;
        const gLost = m.games?.[opp] ?? 0;
        JF += gWon;
        JC += gLost;
        const sWon = m.sets?.[side] ?? 0;
        const sLost = m.sets?.[opp] ?? 0;
        if (sWon > sLost || (sWon === sLost && gWon > gLost)) PG++;
        else PP++;
    });

    const winRate = PJ > 0 ? (PG / PJ) * 100 : 0;
    const gameRate = (JF + JC) > 0 ? (JF / (JF + JC)) * 100 : 0;

    return { PJ, PG, PP, JF, JC, Pts: PG * 3, winRate, gameRate };
}
