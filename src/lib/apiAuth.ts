/**
 * Helper para enviar el token de Firebase en las peticiones a las APIs protegidas.
 * Uso: headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) }
 */
import { auth } from '@/lib/firebase';

export async function getAuthHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) return {};
    try {
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
    } catch {
        return {};
    }
}
