export enum TieBreakRule {
    GAMES_DIFF = 'GAMES_DIFF',      // 1. Pts, 2. JF-JC, 3. PG
    HEAD_TO_HEAD = 'HEAD_TO_HEAD', // 1. Pts, 2. Enfrentamiento directo, 3. JF-JC
}


export enum TournamentType {
    AMERICANO_INDIVIDUAL = 'AMERICANO_INDIVIDUAL', // Rey de pista (cambio de pareja)
    AMERICANO_DUPLA = 'AMERICANO_DUPLA',           // Dupla fija
    KNOCKOUT = 'KNOCKOUT',                         // Eliminación directa
    ROUND_ROBIN = 'ROUND_ROBIN',                   // Liga / Grupos / Round Robin
    CRUZADO = 'CRUZADO',                           // Grupo A vs Grupo B → Cuartos de final
    CUADRO_CONSOLACION = 'CUADRO_CONSOLACION',     // Cuadro principal + llave consolación (mín. 2 partidos por pareja)
}


export enum TournamentCategory {
    // Géneros básicos
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    MIXED = 'MIXED',

    // Niveles específicos
    PRIMERA = 'PRIMERA',
    SEGUNDA = 'SEGUNDA',
    TERCERA = 'TERCERA',
    CUARTA = 'CUARTA',
    QUINTA = 'QUINTA',
    SEXTA = 'SEXTA',
    SEPTIMA = 'SEPTIMA',

    // Veteranos
    MAS_40 = 'MAS_40',
    FEM_40 = 'FEM_40',
    MIX_40 = 'MIX_40',
    MAS_45 = 'MAS_45',
    MAS_50 = 'MAS_50',

    // Sumas
    SUMA_7 = 'SUMA_7',
    SUMA_8 = 'SUMA_8',
    SUMA_9 = 'SUMA_9',
    SUMA_10 = 'SUMA_10',
    SUMA_11 = 'SUMA_11',
    OPEN = 'OPEN',
}

export enum MatchStatus {
    PENDING = 'PENDING',
    LIVE = 'LIVE',
    PAUSED = 'PAUSED',
    FINISHED = 'FINISHED',
    CANCELLED = 'CANCELLED',
}

export interface Complex {
    id: string;
    name: string;
    location: string;
    totalCourts: number;
}

export interface Court {
    id: string;
    complexId: string;
    name: string;
}

export interface Tournament {
    id: string;
    name: string;
    owners?: string[];
    type: TournamentType;
    category: TournamentCategory;
    startDate: Date;
    endDate: Date;
    clubHoursStart: string; // HH:mm
    clubHoursEnd: string;   // HH:mm
    groupSize?: number;
    matchFormat?: 'ONE_SET_6' | 'ONE_SET_9' | 'TWO_SHORT_SETS' | 'TWO_NORMAL_SETS';
    scoringSystem?: 'GOLDEN_POINT' | 'TRADITIONAL';
    tieBreakType?: 'TB' | 'STB';
    groupAssignments?: { [groupName: string]: string[] }; // groupName -> list of teamIds
    broadcastingSettings?: {
        primaryColor?: string;
        showLiveIndicator?: boolean;
        sponsors?: { name: string; logoUrl?: string }[];
        bannerText?: string;
        adFrequencySeconds?: number;
        adDurationSeconds?: number;
        adMediaUrls?: string[]; // URLs specifically for the full-screen display
        funAnimationsEnabled?: boolean;
        aiAnimationSearchEnabled?: boolean;
    };
    tieBreakRule?: TieBreakRule;
    rules?: {
        content?: string;
        manuals?: { title: string; url: string }[];
    };
}

export interface Team {
    id: string;
    player1Id: string;
    player2Id: string;
    level: number;
}

export interface Match {
    id: string;
    tournamentId: string;
    courtId?: string;
    courtIndex?: number;
    team1Id?: string;
    team2Id?: string;
    team1Index?: number; // 1-based, opcional si no se ha asignado parejai (knockout)
    team2Index?: number; // 1-based
    scheduledTime: string | Date;
    actualStartTime?: Date;
    actualEndTime?: Date;
    status: MatchStatus;
    score?: string;
    sets?: { t1: number, t2: number };
    games?: { t1: number, t2: number };
    points?: { t1: string, t2: string }; // '0', '15', '30', '40', 'AD'
    server?: { team: 1 | 2, player: 1 | 2 }; // 1 o 2 (pareja) y 1 o 2 (jugador dentro de esa pareja)
    groupName?: string;
    stage?: 'GROUP_STAGE' | 'MAIN_DRAW' | 'CONSOLATION';
    roundName?: string;
    bracketPosition?: {
        round: number;
        position: number;
    };
}

export interface ScheduleConfig {
    tournamentId: string;
    numTeams: number;
    numCourts: number;
    clubHoursStart: string;
    clubHoursEnd: string;
    type: TournamentType;
    matchDurationMinutes: number;
    bufferMinutes: number;
    startDate: Date;
}

export interface Participant {
    id: string;
    name: string;
    lastName?: string;
    email?: string;
    phone?: string;
    photo?: string;
    category: TournamentCategory;
    gender: 'MALE' | 'FEMALE';
    ownerId: string; // Quien lo registró
    createdAt: any;
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    participantIds: string[]; // Referencias a Participants
    ownerId: string;
    createdAt: any;
}

export interface MatchAnimation {
    id: string;
    name: string;
    type: 'SIDE_CHANGE' | 'GAME_WON' | 'MATCH_WON' | 'GENERAL';
    url: string;
    isActive: boolean;
    createdAt: any;
}
