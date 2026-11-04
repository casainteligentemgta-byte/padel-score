import { dataService } from '@/lib/dataService';

const MAX_BYTES = 5 * 1024 * 1024;

function extFromMime(mime: string): string {
    if (mime.includes('png')) return 'png';
    if (mime.includes('webp')) return 'webp';
    return 'jpg';
}

/** Convierte un data URL a File. Si ya es URL http(s), no hace nada. */
export async function persistPlayerPhoto(
    photo: string | null | undefined,
    userId: string
): Promise<string> {
    const raw = String(photo || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (!raw.startsWith('data:')) return raw;

    const res = await fetch(raw);
    const blob = await res.blob();
    if (blob.size > MAX_BYTES) {
        throw new Error('La foto supera 5 MB. Usa una imagen más liviana.');
    }
    const mime = blob.type || 'image/jpeg';
    const ext = extFromMime(mime);
    const file = new File([blob], `ficha.${ext}`, { type: mime });
    const path = `${userId}/${Date.now()}.${ext}`;
    return dataService.uploadFile(file, path, 'player-photos');
}
