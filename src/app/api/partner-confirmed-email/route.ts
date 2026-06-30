import { Resend } from 'resend';
import { PartnerConfirmedEmail } from '@/emails/PartnerConfirmedEmail';
import { NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/brand';

export async function POST(req: Request) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('[partner-confirmed-email] RESEND_API_KEY is missing');
        return NextResponse.json({ error: 'Service configuration error' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    try {
        const { to, guestName, tournamentName } = await req.json();
        const hubUrl = `${getAppBaseUrl()}/dashboard`;

        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Smart Padel <onboarding@resend.dev>',
            to: [to],
            subject: `🎾 ¡Pareja Confirmada! - ${tournamentName}`,
            react: PartnerConfirmedEmail({ guestName, tournamentName, hubUrl }),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Resend Error:', error);
        return NextResponse.json({ error: 'Mail delivery failed' }, { status: 500 });
    }
}

