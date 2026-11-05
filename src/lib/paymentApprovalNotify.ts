import { Resend } from 'resend';
import { getAppBaseUrl } from '@/lib/brand';
import { sanitizeString } from '@/lib/apiValidation';
import { sendPaymentStatusUpdateMessage } from '@/services/whatsappService';

export type PaymentNotifyStatus =
    | 'paid'
    | 'rechazado'
    | 'revision'
    | 'alert'
    | 'exonerado'
    | 'pending';

export type InscriptionNotifySource = {
    id?: string;
    participant_name?: string | null;
    participant_email?: string | null;
    tournament_name?: string | null;
    owner_id?: string | null;
    user_id?: string | null;
    participant_id?: string | null;
    data?: unknown;
};

export function extractInscriptionEmail(row: InscriptionNotifySource | null | undefined): string | null {
    if (!row) return null;
    const data = (row.data && typeof row.data === 'object' ? row.data : {}) as Record<string, unknown>;
    const candidates = [
        row.participant_email,
        data.email,
        data.participantEmail,
        data.playerEmail,
    ];
    for (const raw of candidates) {
        const email = sanitizeString(raw);
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return email;
    }
    return null;
}

export function extractInscriptionPhone(row: InscriptionNotifySource | null | undefined): string | null {
    if (!row) return null;
    const data = (row.data && typeof row.data === 'object' ? row.data : {}) as Record<string, unknown>;
    const candidates = [
        data.phone,
        data.participantPhone,
        data.whatsapp,
        data.telefono,
    ];
    for (const raw of candidates) {
        const phone = sanitizeString(raw);
        if (phone) return phone;
    }
    return null;
}

export function paymentApprovedEmailHtml(params: {
    playerName: string;
    tournamentName: string;
    dashboardUrl: string;
}): string {
    const name = sanitizeString(params.playerName) || 'Jugador';
    const tournament = sanitizeString(params.tournamentName) || 'tu torneo';
    const url = params.dashboardUrl;
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #ccff00; background: #000; padding: 10px; border-radius: 5px; text-align: center; font-style: italic; text-transform: uppercase;">Smart Padel Pro</h2>
          <p>Hola ${name},</p>
          <p>Tu pago para <strong>${tournament}</strong> fue <strong>aprobado</strong>.</p>
          <p>Ya quedaste confirmado en el roster. Puedes revisar el estado en tu panel:</p>
          <p><a href="${url}" target="_blank" rel="noopener noreferrer">Abrir dashboard</a></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">Sistema de Notificaciones Smart Padel</p>
        </div>
    `;
}

export async function sendPaymentApprovedEmail(params: {
    to: string;
    playerName: string;
    tournamentName: string;
}): Promise<{ sent: boolean; error?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return { sent: false, error: 'RESEND_API_KEY no configurada' };
    }
    const dest = sanitizeString(params.to);
    if (!dest || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dest)) {
        return { sent: false, error: 'Email de jugador inválido' };
    }
    try {
        const resend = new Resend(apiKey);
        const { error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Smart Padel Pro <notifications@resend.dev>',
            to: [dest],
            subject: `Pago aprobado — ${sanitizeString(params.tournamentName) || 'torneo'}`,
            html: paymentApprovedEmailHtml({
                playerName: params.playerName,
                tournamentName: params.tournamentName,
                dashboardUrl: `${getAppBaseUrl()}/dashboard`,
            }),
        });
        if (error) return { sent: false, error: error.message || 'Resend error' };
        return { sent: true };
    } catch (e: unknown) {
        return { sent: false, error: e instanceof Error ? e.message : 'Error enviando email' };
    }
}

export async function notifyPlayerPaymentStatus(params: {
    row: InscriptionNotifySource;
    status: PaymentNotifyStatus;
    note?: string | null;
}): Promise<{ email?: { sent: boolean; error?: string }; whatsapp?: { sent: boolean; error?: string } }> {
    const playerName = sanitizeString(params.row.participant_name) || 'Jugador';
    const tournamentName = sanitizeString(params.row.tournament_name) || 'tu torneo';
    const phone = extractInscriptionPhone(params.row);
    const email = extractInscriptionEmail(params.row);

    const out: { email?: { sent: boolean; error?: string }; whatsapp?: { sent: boolean; error?: string } } = {};

    if (params.status === 'paid' && email) {
        out.email = await sendPaymentApprovedEmail({
            to: email,
            playerName,
            tournamentName,
        });
    } else if (params.status === 'paid' && !email) {
        out.email = { sent: false, error: 'Sin email en la inscripción' };
    }

    if (phone) {
        const wa = await sendPaymentStatusUpdateMessage({
            phone,
            playerName,
            tournamentName,
            status: params.status,
            note: params.note,
            inscriptionId: params.row.id,
        });
        out.whatsapp = { sent: wa.success, error: wa.success ? undefined : wa.error };
    }

    return out;
}
