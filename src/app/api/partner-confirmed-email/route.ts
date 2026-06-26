import { Resend } from 'resend';
import { PartnerConfirmedEmail } from '@/emails/PartnerConfirmedEmail';
import { NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/brand';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
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

