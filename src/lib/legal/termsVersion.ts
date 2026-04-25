/** Versión canónica publicada: registro, política, e inscripción a torneos (un solo consentimiento). */
export const CURRENT_TERMS_VERSION = 'v2.1-2026';

function toSortable(version: string): number {
    const m = /^v(\d+)\.(\d+)-(\d+)$/.exec(version.trim());
    if (!m) return 0;
    return Number(m[1]) * 1_000_000_000 + Number(m[2]) * 1_000_000 + Number(m[3]);
}

/** true si el usuario debe re-aceptar (versión ausente o anterior a la vigente). */
export function isProfileTermsStale(accepted: string | null | undefined): boolean {
    const a = accepted ? toSortable(accepted) : 0;
    return a < toSortable(CURRENT_TERMS_VERSION);
}
