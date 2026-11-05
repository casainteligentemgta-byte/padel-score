/** Columnas seguras del roster público de un torneo (sin PII de pago/contacto). */
export type PublicTournamentInscription = {
    id: string;
    tournamentId: string;
    categoryKey: string;
    participantName: string;
    isPlaceholder: boolean;
    groupName: string | null;
    inscriptionStatus: string | null;
    data: { partnerName?: string };
};

const SENSITIVE_KEYS = [
    'participant_email',
    'participantEmail',
    'receipt_url',
    'receiptUrl',
    'payment_status',
    'paymentStatus',
    'alert_message',
    'alertMessage',
    'amount_extracted',
    'amountExtracted',
    'phone',
    'whatsapp',
    'email',
    'cedula',
    'dni',
];

function flagFromUnknown(value: unknown): boolean | null {
    if (value === true || value === 1) return true;
    if (value === false || value === 0) return false;
    if (typeof value === 'string') {
        const s = value.trim().toLowerCase();
        if (s === 'true' || s === 't' || s === '1') return true;
        if (s === 'false' || s === 'f' || s === '0') return false;
    }
    return null;
}

function firstText(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
}

/** Prod no tiene columnas group_name / is_placeholder: viven en data jsonb o en el RPC. */
export function mapPublicInscriptionRow(row: Record<string, unknown>): PublicTournamentInscription {
    const data = (row.data && typeof row.data === 'object' ? row.data : {}) as Record<string, unknown>;
    const partnerName =
        firstText(row.partner_name, row.partnerName, data.partnerName) || '';
    const groupName = firstText(
        row.group_name,
        row.groupName,
        data.groupName,
        data.group_name,
    );
    const isPlaceholder =
        flagFromUnknown(row.is_placeholder) ??
        flagFromUnknown(row.isPlaceholder) ??
        flagFromUnknown(data.isPlaceholder) ??
        flagFromUnknown(data.is_placeholder) ??
        false;

    return {
        id: String(row.id ?? ''),
        tournamentId: String(row.tournament_id ?? row.tournamentId ?? ''),
        categoryKey: row.category_key != null ? String(row.category_key) : '',
        participantName: typeof row.participant_name === 'string'
            ? row.participant_name
            : typeof row.participantName === 'string'
                ? row.participantName
                : '',
        isPlaceholder,
        groupName,
        inscriptionStatus: row.inscription_status != null
            ? String(row.inscription_status)
            : row.inscriptionStatus != null
                ? String(row.inscriptionStatus)
                : null,
        data: partnerName ? { partnerName } : {},
    };
}

export function assertNoSensitivePublicInscription(row: PublicTournamentInscription): void {
    const blob = JSON.stringify(row);
    for (const key of SENSITIVE_KEYS) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
            throw new Error(`Roster público no debe exponer ${key}`);
        }
    }
    if (/"receipt|"participant_email|"payment_status/i.test(blob)) {
        throw new Error('Roster público contiene campos sensibles');
    }
}
