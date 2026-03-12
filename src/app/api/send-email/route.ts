import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { validateEmailBody, sanitizeString } from '@/lib/apiValidation';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: 'Límite de envíos excedido. Intenta más tarde.' }, { status: 429 });
  }
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY is missing from environment variables');
    return NextResponse.json({ error: 'Service configuration error' }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const body = await request.json();
    const validation = validateEmailBody(body);
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { type, data: rawData } = body;

    // Sanitizar datos para evitar inyección de HTML o scripts en el email
    const data: any = {};
    for (const key in rawData) {
      if (typeof rawData[key] === 'string') {
        data[key] = sanitizeString(rawData[key]);
      } else {
        data[key] = rawData[key];
      }
    }

    let subject = '';
    let html = '';

    if (type === 'NEW_PLAYER') {
      subject = `🎾 Nuevo Jugador Registrado: ${data.name} ${data.lastName}`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #ccff00; background: #000; padding: 10px; border-radius: 5px; text-align: center; font-style: italic; text-transform: uppercase;">Smart Padel Pro</h2>
          <p>Se ha registrado un nuevo jugador en la plataforma:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Nombre:</strong> ${data.name} ${data.lastName}</li>
            <li><strong>DNI:</strong> ${data.dni}</li>
            <li><strong>WhatsApp:</strong> ${data.phone}</li>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Instagram:</strong> @${data.instagram}</li>
            <li><strong>Nivel:</strong> Cat. ${data.level}</li>
            <li><strong>Posición:</strong> ${data.position}</li>
          </ul>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">Sistema de Notificaciones Smart Padel</p>
        </div>
      `;
    } else if (type === 'NEW_INSCRIPTION') {
      subject = `🏆 Nueva Inscripción: ${data.participantName} en ${data.tournamentName}`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #ccff00; background: #000; padding: 10px; border-radius: 5px; text-align: center; font-style: italic; text-transform: uppercase;">Smart Padel Pro</h2>
          <p>Un jugador se ha inscrito en un torneo:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Jugador:</strong> ${data.participantName}</li>
            <li><strong>Torneo:</strong> ${data.tournamentName}</li>
            <li><strong>Categoría:</strong> ${data.categoryName}</li>
            <li><strong>Monto:</strong> $${data.amount}</li>
            <li><strong>Método:</strong> ${data.paymentMethod}</li>
            <li><strong>Referencia:</strong> ${data.paymentReference}</li>
          </ul>
          ${data.receiptUrl ? `<p><strong>Comprobante:</strong> <a href="${data.receiptUrl}">Ver Imagen</a></p>` : ''}
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">Sistema de Notificaciones Smart Padel</p>
        </div>
      `;
    }

    const { error } = await resend.emails.send({
      from: 'Smart Padel Pro <notifications@resend.dev>',
      to: ['casainteligentemgta@gmail.com'],
      subject: subject,
      html: html,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
