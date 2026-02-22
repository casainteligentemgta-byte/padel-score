export enum TournamentType {
    AMERICANO_INDIVIDUAL = 'AMERICANO_INDIVIDUAL', // Rey de pista (cambio de pareja)
    AMERICANO_DUPLA = 'AMERICANO_DUPLA',           // Dupla fija
    KNOCKOUT = 'KNOCKOUT',                         // Eliminación directa
    ROUND_ROBIN = 'ROUND_ROBIN',                   // Liga / Grupos / Round Robin
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
    MAS_45 = 'MAS_45',

    // Sumas
    SUMA_7 = 'SUMA_7',
    SUMA_8 = 'SUMA_8',
    SUMA_9 = 'SUMA_9',
    SUMA_10 = 'SUMA_10',
    SUMA_11 = 'SUMA_11'
}

export enum MatchStatus {
    PENDING = 'PENDING',
    LIVE = 'LIVE',
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
    type: TournamentType;
    category: TournamentCategory;
    startDate: Date;
    endDate: Date;
    clubHoursStart: string; // HH:mm
    clubHoursEnd: string;   // HH:mm
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
    courtId: string;
    team1Id: string;
    team2Id: string;
    scheduledTime: Date;
    status: MatchStatus;
    score?: string; // e.g. "6-4, 7-5"
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
