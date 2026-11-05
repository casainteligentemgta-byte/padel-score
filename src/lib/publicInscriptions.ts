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

export function mapPublicInscriptionRow(row: Record<string, unknown>): PublicTournamentInscription {
    const data = (row.data && typeof row.data === 'object' ? row.data : {}) as Record<string, unknown>;
    const partnerName =
        (typeof row.partner_name === 'string' && row.partner_name) ||
        (typeof row.partnerName === 'string' && row.partnerName) ||
        (typeof data.partnerName === 'string' && data.partnerName) ||
        '';

    return {
        id: String(row.id ?? ''),
        tournamentId: String(row.tournament_id ?? row.tournamentId ?? ''),
        categoryKey: row.category_key != null ? String(row.category_key) : '',
        participantName: typeof row.participant_name === 'string'
            ? row.participant_name
            : typeof row.participantName === 'string'
                ? row.participantName
                : '',
        isPlaceholder: row.is_placeholder === true || row.isPlaceholder === true,
        groupName: row.group_name != null
            ? String(row.group_name)
            : row.groupName != null
                ? String(row.groupName)
                : null,
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
