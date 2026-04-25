/**
 * Cliente servidor para Nano Banana 2 (API NanoPhoto.AI).
 * @see https://nanophoto.ai/docs/api/nano-banana-2
 */

const DEFAULT_BASE = 'https://nanophoto.ai';

export type PosterFieldsForPrompt = {
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  category?: string;
  prize?: string;
  cta?: string;
};

export function getNanoBanana2Config(): { apiKey: string; baseUrl: string } | null {
  const apiKey =
    process.env.NANOPHOTO_API_KEY?.trim() ||
    process.env.NANO_BANANA2_API_KEY?.trim() ||
    '';
  if (!apiKey) return null;
  const baseUrl = (process.env.NANOPHOTO_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');
  return { apiKey, baseUrl };
}

export function buildPadelPosterPrompt(f: PosterFieldsForPrompt): string {
  const title = (f.title || '').trim().slice(0, 80);
  const date = (f.date || '').trim();
  const time = (f.time || '').trim();
  const venue = (f.venue || '').trim();
  const category = (f.category || '').trim();
  const prize = (f.prize || '').trim();
  const cta = (f.cta || 'Inscríbete ahora').trim();

  return [
    'Professional vertical sports poster for a padel tournament, 3:4 portrait aspect.',
    'Style: premium event flyer, dark background near #050505, electric lime / chartreuse accent #ccff00 for borders and highlights, high contrast.',
    'Typography: bold condensed sans-serif, readable hierarchy, Spanish text.',
    'Visual: subtle padel court lines or racket silhouette texture in background, not cluttered.',
    `Main headline (large): "${title}"`,
    date ? `Date line: "${date}"` : '',
    time ? `Time: "${time}"` : '',
    venue ? `Venue: "${venue}"` : '',
    category ? `Category: "${category}"` : '',
    prize ? `Prize callout: "${prize}"` : '',
    `Call to action strip: "${cta}"`,
    'Small footer: www.smartpadel58.com',
    'No watermarks from other brands. Photoreal lighting optional; poster must look print-ready.',
  ]
    .filter(Boolean)
    .join(' ');
}

type GenResponse = { success?: boolean; generationId?: string; error?: string };
type StatusResponse = {
  success?: boolean;
  status?: string;
  imageUrl?: string;
  error?: string;
  progress?: number;
};

export async function generateNanoBanana2PosterDataUrl(
  prompt: string,
  opts?: { aspectRatio?: string; imageQuality?: string; googleSearch?: boolean }
): Promise<{ dataUrl: string } | { error: string }> {
  const cfg = getNanoBanana2Config();
  if (!cfg) return { error: 'Falta NANOPHOTO_API_KEY (o NANO_BANANA2_API_KEY) en el servidor.' };

  const { apiKey, baseUrl } = cfg;
  const aspectRatio = opts?.aspectRatio ?? '3:4';
  const imageQuality = opts?.imageQuality ?? '2K';
  const googleSearch = opts?.googleSearch ?? false;

  const genRes = await fetch(`${baseUrl}/api/nano-banana-2/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      mode: 'generate',
      aspectRatio,
      imageQuality,
      googleSearch,
    }),
  });

  const genJson = (await genRes.json().catch(() => ({}))) as GenResponse;
  if (!genRes.ok || !genJson.success || !genJson.generationId) {
    return {
      error:
        genJson.error ||
        `Nano Banana 2 (generate): HTTP ${genRes.status}`,
    };
  }

  const generationId = genJson.generationId;
  const maxAttempts = 50;
  const delayMs = 3000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));

    const stRes = await fetch(`${baseUrl}/api/nano-banana-2/check-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ generationId }),
    });

    const st = (await stRes.json().catch(() => ({}))) as StatusResponse;

    if (st.status === 'completed' && st.imageUrl) {
      const imgRes = await fetch(st.imageUrl);
      if (!imgRes.ok) {
        return { error: `No se pudo descargar la imagen generada (HTTP ${imgRes.status}).` };
      }
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const ct = imgRes.headers.get('content-type') || 'image/png';
      const dataUrl = `data:${ct};base64,${buf.toString('base64')}`;
      return { dataUrl };
    }

    if (st.status === 'failed' || st.success === false) {
      return { error: st.error || 'La generación de imagen falló.' };
    }
  }

  return { error: 'Tiempo de espera agotado al generar el póster con Nano Banana 2.' };
}
