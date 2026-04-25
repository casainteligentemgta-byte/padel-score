import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/authServerSupabase';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeString } from '@/lib/apiValidation';
import {
  buildPadelPosterPrompt,
  generateNanoBanana2PosterDataUrl,
} from '@/lib/nanoBanana2Client';

type Body = {
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  category?: string;
  prize?: string;
  cta?: string;
  imageQuality?: '1K' | '2K' | '4K';
  googleSearch?: boolean;
};

export async function POST(request: Request) {
  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: 'Demasiadas peticiones. Intenta más tarde.' }, { status: 429 });
  }

  const auth = await requireRole(request, ['admin']);
  if (auth instanceof NextResponse) return auth;

  try {
    const json = (await request.json()) as Body;
    const title = sanitizeString(json.title);
    if (!title) {
      return NextResponse.json({ error: 'Indica el título del torneo.' }, { status: 400 });
    }

    const prompt = buildPadelPosterPrompt({
      title,
      date: sanitizeString(json.date),
      time: sanitizeString(json.time),
      venue: sanitizeString(json.venue),
      category: sanitizeString(json.category),
      prize: sanitizeString(json.prize),
      cta: sanitizeString(json.cta) || undefined,
    });

    const q = json.imageQuality;
    const imageQuality = q === '1K' || q === '2K' || q === '4K' ? q : '2K';

    const result = await generateNanoBanana2PosterDataUrl(prompt, {
      aspectRatio: '3:4',
      imageQuality,
      googleSearch: Boolean(json.googleSearch),
    });

    if ('error' in result) {
      const missingKey = result.error.includes('NANOPHOTO_API_KEY');
      return NextResponse.json(
        { error: result.error },
        { status: missingKey ? 503 : 502 }
      );
    }

    return NextResponse.json({ imageDataUrl: result.dataUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
