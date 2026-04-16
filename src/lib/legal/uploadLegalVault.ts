import { createClient } from '@/lib/supabase/client';

export const LEGAL_VAULT_BUCKET = 'legal_vault';

export async function uploadToLegalVault(
    userId: string,
    fileName: string,
    body: Blob,
    contentType: string
): Promise<string> {
    const path = `${userId}/${Date.now()}-${fileName}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from(LEGAL_VAULT_BUCKET).upload(path, body, {
        contentType,
        upsert: false,
        cacheControl: '3600',
    });
    if (error) {
        const details = [error.message, (error as any).code, (error as any).statusCode, (error as any).error]
            .filter(Boolean)
            .join(' | ');
        throw new Error(`[legal_vault] ${details}`);
    }
    return path;
}

export async function getLegalVaultSignedUrl(path: string, expiresInSec = 3600): Promise<string | null> {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(LEGAL_VAULT_BUCKET).createSignedUrl(path, expiresInSec);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
}
