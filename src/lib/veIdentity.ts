/** Identidad venezolana: cédula, teléfono y fecha de nacimiento. */

const MOBILE_PREFIXES = ['412', '414', '416', '422', '424', '426'];

export function normalizeVeCedula(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const trimmed = String(raw).trim();
    if (!trimmed) return null;
    const prefix = trimmed.toUpperCase().startsWith('E') ? 'E' : 'V';
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return null;
    return `${prefix}${digits}`;
}

export function isValidVeCedula(raw: string | null | undefined): boolean {
    const n = normalizeVeCedula(raw);
    return !!n && /^[VE]\d{6,9}$/.test(n);
}

export function formatVeCedulaInput(raw: string): string {
    const prefix = raw.toUpperCase().trim().startsWith('E') ? 'E-' : 'V-';
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    if (!digits) return prefix;
    const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${prefix}${grouped}`;
}

export function isValidVeMobile(raw: string | null | undefined): boolean {
    if (!raw) return false;
    let d = String(raw).replace(/\D/g, '');
    while (d.startsWith('00')) d = d.slice(2);
    if (d.startsWith('58') && d.length >= 12) d = d.slice(2);
    if (d.startsWith('0') && d.length >= 11) d = d.slice(1);
    if (d.length !== 10) return false;
    return MOBILE_PREFIXES.some((p) => d.startsWith(p));
}

export function isValidBirthDate(raw: string | null | undefined, opts?: { minAge?: number; maxAge?: number }): boolean {
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return false;
    const [y, m, d] = raw.trim().split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
    const today = new Date();
    let age = today.getFullYear() - y;
    const md = today.getMonth() - (m - 1);
    if (md < 0 || (md === 0 && today.getDate() < d)) age -= 1;
    const minAge = opts?.minAge ?? 5;
    const maxAge = opts?.maxAge ?? 100;
    return age >= minAge && age <= maxAge;
}

export function isValidPersonName(raw: string | null | undefined): boolean {
    const s = String(raw || '').trim();
    if (s.length < 2 || s.length > 60) return false;
    return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(s);
}
