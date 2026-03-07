/**
 * PadelScoreManager.ts
 * Lógica robusta para la gestión de puntuación en pádel siguiendo el reglamento FIP.
 */

export type ScorePoint = '0' | '15' | '30' | '40' | 'AD';
export type MatchFormat = 'BEST_OF_3' | 'TWO_SETS_STB' | 'ONE_SET_6' | 'ONE_SET_9';

export interface PadelMatchState {
    points: { t1: number | ScorePoint; t2: number | ScorePoint };
    games: { t1: number; t2: number };
    sets: { t1: number; t2: number };
    setScores: { t1: number; t2: number }[];
    server: { team: 1 | 2; player: 1 | 2 };
    isTieBreak: boolean;
    isSuperTieBreak: boolean;
    isFinished: boolean;
    winner: 1 | 2 | null;
}

export interface PadelSettings {
    isGoldenPoint: boolean;
    matchFormat: MatchFormat;
}

export class PadelScoreManager {
    private state: PadelMatchState;
    private settings: PadelSettings;

    constructor(initialState?: Partial<PadelMatchState>, settings?: Partial<PadelSettings>) {
        this.state = {
            points: { t1: '0', t2: '0' },
            games: { t1: 0, t2: 0 },
            sets: { t1: 0, t2: 0 },
            setScores: [],
            server: { team: 1, player: 1 },
            isTieBreak: false,
            isSuperTieBreak: false,
            isFinished: false,
            winner: null,
            ...initialState
        };
        this.settings = {
            isGoldenPoint: false,
            matchFormat: 'BEST_OF_3',
            ...settings
        };
    }

    public getState(): PadelMatchState {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Incrementa el punto para el equipo indicado.
     */
    public addPoint(team: 1 | 2): PadelMatchState {
        if (this.state.isFinished) return this.getState();

        if (this.state.isTieBreak || this.state.isSuperTieBreak) {
            this.handleTieBreakPoint(team);
        } else {
            this.handleStandardPoint(team);
        }

        return this.getState();
    }

    /**
     * Lógica de puntuación estándar (0-15-30-40-AD-Juego)
     */
    private handleStandardPoint(team: 1 | 2): void {
        const otherTeam = team === 1 ? 2 : 1;
        const currentPoints = this.state.points[`t${team}`] as ScorePoint;
        const otherPoints = this.state.points[`t${otherTeam}`] as ScorePoint;

        if (currentPoints === '40') {
            if (otherPoints === '40') {
                if (this.settings.isGoldenPoint) {
                    this.winGame(team);
                } else {
                    this.state.points[`t${team}`] = 'AD';
                }
            } else if (otherPoints === 'AD') {
                this.state.points[`t${otherTeam}`] = '40';
            } else {
                this.winGame(team);
            }
        } else if (currentPoints === 'AD') {
            this.winGame(team);
        } else {
            const sequence: ScorePoint[] = ['0', '15', '30', '40'];
            const nextIdx = sequence.indexOf(currentPoints) + 1;
            this.state.points[`t${team}`] = sequence[nextIdx];
        }
    }

    /**
     * Lógica de Tie-break (1, 2, 3...)
     */
    private handleTieBreakPoint(team: 1 | 2): void {
        const otherTeam = team === 1 ? 2 : 1;
        const currentPoints = Number(this.state.points[`t${team}`]);
        const otherPoints = Number(this.state.points[`t${otherTeam}`]);

        const nextPoints = currentPoints + 1;
        this.state.points[`t${team}`] = nextPoints;

        // Rotación de saque en Tiebreak (A1, B2, B3, A4, A5...)
        const totalPoints = nextPoints + otherPoints;
        if (totalPoints % 2 === 1) {
            this.rotateServer();
        }

        // Condición de victoria de Tie-break
        const target = this.state.isSuperTieBreak ? 10 : 7;
        if (nextPoints >= target && (nextPoints - otherPoints) >= 2) {
            this.winGame(team);
        }
    }

    /**
     * Finaliza el juego actual e incrementa el marcador de juegos.
     */
    private winGame(team: 1 | 2): void {
        this.state.games[`t${team}`]++;
        this.state.points = { t1: '0', t2: '0' };

        const g1 = this.state.games.t1;
        const g2 = this.state.games.t2;

        if (this.state.isTieBreak || this.state.isSuperTieBreak) {
            this.winSet(team);
            return;
        }

        // Se gana el set con 6 juegos y diff de 2, o llegando a 7
        const isSetFinished = (g1 >= 6 && Math.abs(g1 - g2) >= 2) || g1 === 7 || g2 === 7;
        const isEntryTieBreak = g1 === 6 && g2 === 6;

        if (isSetFinished) {
            this.winSet(team);
        } else if (isEntryTieBreak) {
            this.state.isTieBreak = true;
            this.state.points = { t1: 0, t2: 0 };
            // El sacador del TB es el que le tocaba, pero rota tras el primer punto
        } else {
            this.rotateServer(); // Cambio de turno normal tras juego
        }
    }

    /**
     * Finaliza el set actual e incrementa el marcador de sets.
     */
    private winSet(team: 1 | 2): void {
        this.state.setScores.push({ ...this.state.games });
        this.state.sets[`t${team}`]++;
        this.state.games = { t1: 0, t2: 0 };
        this.state.isTieBreak = false;

        const setsT1 = this.state.sets.t1;
        const setsT2 = this.state.sets.t2;
        const totalSets = setsT1 + setsT2;

        // Verificar ganador final
        let setsToWin = 2; // Mejor de 3 por defecto
        if (this.settings.matchFormat === 'ONE_SET_6' || this.settings.matchFormat === 'ONE_SET_9') {
            setsToWin = 1;
        }

        if (this.state.sets[`t${team}`] >= setsToWin) {
            this.state.isFinished = true;
            this.state.winner = team;
        } else if (this.settings.matchFormat === 'TWO_SETS_STB' && totalSets === 2 && setsT1 === 1 && setsT2 === 1) {
            // Tercer set es un Super Tie-break
            this.state.isSuperTieBreak = true;
            this.state.points = { t1: 0, t2: 0 };
        } else {
            // Siguiente set comienza de cero
            this.state.isSuperTieBreak = false;
            this.state.points = { t1: '0', t2: '0' };
            this.rotateServer();
        }
    }

    /**
     * Rotación de sacador basada en el equipo.
     */
    private rotateServer(): void {
        const nextTeam = this.state.server.team === 1 ? 2 : 1;
        // La lógica de jugador requeriría más contexto (quién sacó antes), 
        // pero rotamos equipo como base.
        this.state.server = { ...this.state.server, team: nextTeam as 1 | 2 };
    }

    /**
     * Determina si se debe realizar un cambio de campo.
     * En set: Cuando la suma de juegos es impar.
     * En Tie-break: Cada 6 puntos sumados.
     */
    public shouldChangeSide(): boolean {
        if (this.state.isTieBreak || this.state.isSuperTieBreak) {
            const totalPoints = Number(this.state.points.t1) + Number(this.state.points.t2);
            return totalPoints > 0 && totalPoints % 6 === 0;
        }
        const totalGames = this.state.games.t1 + this.state.games.t2;
        return totalGames % 2 === 1;
    }
}
