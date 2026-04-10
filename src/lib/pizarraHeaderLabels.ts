/** Etiquetas de cabecera para pizarras por cancha (alineado con control / hub). */

const CAT_LEVEL_LABELS: Record<string, string> = {
    PRIMERA: '1ª',
    SEGUNDA: '2ª',
    TERCERA: '3ª',
    CUARTA: '4ª',
    QUINTA: '5ª',
    SEXTA: '6ª',
    SEPTIMA: '7ª',
    MAS_40: '+40',
    FEM_40: '+40',
    MIX_40: '+40',
    MAS_45: '+45',
    MAS_50: '+50',
    SUMA_7: 'Suma 7',
    SUMA_8: 'Suma 8',
    SUMA_9: 'Suma 9',
    SUMA_10: 'Suma 10',
    SUMA_11: 'Suma 11',
};

export function formatPizarraGender(gender: string | undefined): string {
    if (!gender) return '';
    const s = String(gender).trim();
    if (!s) return '';
    const u = s.toUpperCase();
    const n = s
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '');

    if (u === 'MALE' || u === 'M' || n === 'masculine' || n === 'masculino' || n === 'male' || n === 'hombre' || n === 'masc')
        return 'Masculino';
    if (u === 'FEMALE' || u === 'F' || n === 'feminine' || n === 'femenino' || n === 'female' || n === 'mujer' || n === 'fem')
        return 'Femenino';
    if (u === 'MIXED' || n === 'mixed' || n === 'mixto' || n === 'mix' || n === 'mixta') return 'Mixto';

    if (u === 'MASCULINO') return 'Masculino';
    if (u === 'FEMENINO') return 'Femenino';
    if (u === 'MIXTO' || u === 'MIXTA') return 'Mixto';

    return s;
}

export function formatPizarraCategoryLevel(cat: string | undefined): string {
    if (!cat) return '';
    return CAT_LEVEL_LABELS[String(cat).toUpperCase()] ?? String(cat).replace(/_/g, ' ');
}

export function splitPizarraCategoryMeta(t: { category?: string; gender?: string } | null | undefined): {
    levelLine: string;
    genderLine: string;
} {
    if (!t) return { levelLine: '', genderLine: '' };
    const cat = t.category ? String(t.category).toUpperCase() : '';
    const isGenderCat = ['MALE', 'FEMALE', 'MIXED'].includes(cat);
    const genderLine =
        formatPizarraGender(t.gender) || (isGenderCat ? formatPizarraGender(t.category) : '');
    const levelLine = cat && !isGenderCat ? formatPizarraCategoryLevel(t.category) : '';
    return { levelLine, genderLine };
}

export function buildCourtHeadline(venueName: string | null | undefined, courtId: string): string {
    const v = (venueName || '').trim();
    if (v) return `${v} · Pista ${courtId}`;
    return `Pista ${courtId}`;
}
